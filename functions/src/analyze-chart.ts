import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { ClaudeAnalysisService } from './services/claude-analysis.service';
import { AnalysisRequest, NatalChartAnalysis } from './types/analysis.types';

const claudeApiKey = defineSecret('CLAUDE_API_KEY');

/**
 * Cloud Function to analyze natal chart with Claude AI
 */
export const analyzeNatalChart = onCall(
  {
    secrets: [claudeApiKey],
    memory: '512MiB',
    timeoutSeconds: 120,
    region: 'us-central1',
  },
  async (request): Promise<NatalChartAnalysis> => {
    const data = request.data as AnalysisRequest;

    if (!data.chartData || !data.chartData.planetaryPositions) {
      throw new HttpsError(
        'invalid-argument',
        'Missing chart data for analysis'
      );
    }

    try {
      const analysisService = new ClaudeAnalysisService(claudeApiKey.value());

      const analysis = await analysisService.generateAnalysis(
        data.chartData.planetaryPositions,
        data.chartData.aspects || [],
        data.fullAnalysis || false
      );

      return analysis;
    } catch (error: unknown) {
      console.error('Error generating analysis:', error);

      if (error instanceof Error) {
        throw new HttpsError('internal', `Failed to generate analysis: ${error.message}`);
      }

      throw new HttpsError('internal', 'Failed to generate analysis');
    }
  }
);