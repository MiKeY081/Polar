export const TestType = {
  REACTION: 'REACTION',
  PATTERN: 'PATTERN',
  STROOP: 'STROOP',
  SEQUENCE: 'SEQUENCE',
  NPBACK: 'N_BACK'
} as const;

export type TestType = typeof TestType[keyof typeof TestType];

export interface TestResult {
  id: string;
  type: TestType;
  timestamp: number;
  score: number; // Generic score (ms, level, etc.)
  accuracy: number; // 0-100 percentage
  duration: number; // Time taken to complete test in ms
  difficultyLevel?: number;
  meta: Record<string, any>; // Test specific data (e.g., falsePositives)
}

export interface AdvancedMetrics {
  decisionConfidence: number; // 0-100
  cognitiveLoad: number; // 0-100
  fatigueIndex: number; // 0-100
  behaviorDrift: number; // 0-100
  analysisTimestamp: number;
  summary: string;
  anomalies: string[];
}

export interface UserProfile {
  name: string;
  results: TestResult[];
  latestMetrics?: AdvancedMetrics;
}
