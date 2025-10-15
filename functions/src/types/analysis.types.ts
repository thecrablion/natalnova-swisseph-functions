export interface AnalysisSection {
  title: string;
  content: string;
  isTruncated: boolean;
}

export interface NatalChartAnalysis {
  introduction: AnalysisSection;
  sun: AnalysisSection;
  moon: AnalysisSection;
  ascendant: AnalysisSection;
  majorAspects: AnalysisSection;
  conclusion: AnalysisSection;
  generatedAt: string;
}

export interface AnalysisRequest {
  chartData: {
    planetaryPositions: Record<string, {
      sign: string;
      house: number;
      degreesInSign: number;
    }>;
    aspects: Array<{
      planet1: string;
      aspectType: string;
      planet2: string;
      orb: number;
    }>;
  };
  fullAnalysis?: boolean;
}