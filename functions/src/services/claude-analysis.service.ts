import Anthropic from '@anthropic-ai/sdk';
import { AnalysisSection, NatalChartAnalysis } from '../types/analysis.types';

interface PlanetaryPosition {
  sign: string;
  house: number;
  degreesInSign: number;
}

interface Aspect {
  planet1: string;
  aspectType: string;
  planet2: string;
  orb: number;
}

export class ClaudeAnalysisService {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  /**
   * Generates natal chart analysis using Claude AI
   */
  async generateAnalysis(
    planetaryPositions: Record<string, PlanetaryPosition>,
    aspects: Aspect[],
    fullAnalysis: boolean = false
  ): Promise<NatalChartAnalysis> {
    const prompt = this.buildPrompt(planetaryPositions, aspects, fullAnalysis);

    const message = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: fullAnalysis ? 4000 : 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    return this.parseAnalysisResponse(responseText, fullAnalysis);
  }

  /**
   * Builds the prompt for Claude AI
   */
  private buildPrompt(
    planetaryPositions: Record<string, PlanetaryPosition>,
    aspects: Aspect[],
    fullAnalysis: boolean
  ): string {
    const sunPosition = planetaryPositions['Sun'];
    const moonPosition = planetaryPositions['Moon'];
    const ascendantPosition = planetaryPositions['Ascendant'];

    const majorAspects = aspects
      .filter((a) => ['Conjunction', 'Opposition', 'Trine', 'Square'].includes(a.aspectType))
      .slice(0, 5);

    const prompt = `You are an expert astrologer. Analyze the following natal chart and provide a detailed interpretation in English.

**Chart Data:**

Sun: ${sunPosition.sign} (House ${sunPosition.house})
Moon: ${moonPosition.sign} (House ${moonPosition.house})
Ascendant: ${ascendantPosition.sign}

**Major Aspects:**
${majorAspects.map((a) => `- ${a.planet1} ${a.aspectType} ${a.planet2} (Orb: ${a.orb.toFixed(2)}°)`).join('\n')}

**Instructions:**
Provide a ${fullAnalysis ? 'comprehensive' : 'concise'} analysis divided into these sections:

1. **Introduction** (2-3 sentences): Brief overview of the chart's main themes.

2. **Sun Sign Analysis** (${fullAnalysis ? '3-4' : '2-3'} paragraphs): 
   - Core identity and life purpose
   - Strengths and natural talents
   - ${fullAnalysis ? 'Challenges and growth areas' : ''}
   - How Sun in ${sunPosition.sign} manifests in House ${sunPosition.house}

3. **Moon Sign Analysis** (${fullAnalysis ? '3-4' : '2-3'} paragraphs):
   - Emotional nature and inner needs
   - Comfort zones and emotional security
   - ${fullAnalysis ? 'Relationship patterns and nurturing style' : ''}
   - How Moon in ${moonPosition.sign} manifests in House ${moonPosition.house}

4. **Ascendant Analysis** (${fullAnalysis ? '2-3' : '2'} paragraphs):
   - First impressions and outward persona
   - Life approach and physical vitality
   - ${fullAnalysis ? 'How others perceive you' : ''}

5. **Major Aspects Analysis** (${fullAnalysis ? '2-3' : '1-2'} paragraphs):
   - Interpretation of the most significant planetary aspects
   - How these aspects shape personality and life experiences
   ${fullAnalysis ? '- Specific advice for working with these energies' : ''}

6. **Conclusion** (2-3 sentences): Summary of key themes and potential.

**Format Requirements:**
- Use clear headers for each section: "## Introduction", "## Sun in ${sunPosition.sign}", etc.
- Write in a professional yet accessible tone
- Focus on empowering insights rather than predictions
- Avoid fortune-telling or absolute statements
- ${fullAnalysis ? 'Provide actionable advice and growth opportunities' : 'Keep interpretations concise and focused'}
- Each paragraph should be 3-5 sentences

Begin the analysis now:`;

    return prompt;
  }

  /**
   * Parses Claude's response into structured sections
   */
  private parseAnalysisResponse(
    response: string,
    fullAnalysis: boolean
  ): NatalChartAnalysis {
    const sections = response.split('##').filter((s) => s.trim());

    const extractSection = (title: string): AnalysisSection => {
      const section = sections.find((s) =>
        s.trim().toLowerCase().startsWith(title.toLowerCase())
      );

      if (!section) {
        return {
          title: title,
          content: 'Analysis not available.',
          isTruncated: false,
        };
      }

      let content = section
        .replace(new RegExp(`^${title}`, 'i'), '')
        .trim();

      // Truncate to 30% if not full analysis
      let isTruncated = false;
      if (!fullAnalysis) {
        const paragraphs = content.split('\n\n').filter((p) => p.trim());
        if (paragraphs.length > 1) {
          const truncateAt = Math.ceil(paragraphs.length * 0.3);
          content = paragraphs.slice(0, Math.max(1, truncateAt)).join('\n\n');
          isTruncated = true;
        }
      }

      return {
        title: title,
        content: content,
        isTruncated: isTruncated,
      };
    };

    return {
      introduction: extractSection('Introduction'),
      sun: extractSection('Sun in'),
      moon: extractSection('Moon in'),
      ascendant: extractSection('Ascendant'),
      majorAspects: extractSection('Major Aspects'),
      conclusion: extractSection('Conclusion'),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Estimates token usage for analysis
   */
  estimateTokenUsage(fullAnalysis: boolean): number {
    return fullAnalysis ? 4000 : 2000;
  }
}