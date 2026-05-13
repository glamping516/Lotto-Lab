export type LottoDraw = {
  round: number;
  numbers: [number, number, number, number, number, number];
  bonus: number;
  source?: string;
  updatedAt?: string;
};

export type WindowOption = "all" | number;

export type WeightedItem = {
  number: number;
  weight: number;
};

export type StrategyKey =
  | "random"
  | "hot"
  | "cold"
  | "recentWeighted"
  | "overdue"
  | "balanced"
  | "pairBased"
  | "anomalyWeighted"
  | "mixed";

export type GeneratedGame = {
  strategy: StrategyKey;
  numbers: number[];
  explanation: string;
  debug?: Record<string, unknown>;
};

export type SyncLogEntry = {
  timestamp: string;
  status: "success" | "skipped" | "error";
  message: string;
  round?: number;
  details?: Record<string, unknown>;
};

export type DashboardSnapshot = {
  rangeLabel: string;
  totalDraws: number;
  numberFrequency: Array<{ number: number; count: number; expected: number; delta: number }>;
  bonusFrequency: Array<{ number: number; count: number }>;
  oddEven: Array<{ label: string; value: number }>;
  lowHigh: Array<{ label: string; value: number }>;
  bandDistribution: Array<{ label: string; value: number }>;
  sumDistribution: Array<{ label: string; count: number }>;
  sumTrend: Array<{ round: number; sum: number }>;
  consecutive: {
    drawsWithConsecutive: number;
    drawsWithoutConsecutive: number;
    distribution: Array<{ label: string; count: number }>;
  };
  lastDigit: Array<{ digit: number; count: number }>;
  pairTop20: Array<{ label: string; count: number }>;
  overlap: Array<{ overlap: number; count: number }>;
};

export type AnomalyReport = {
  expectedVsObserved: Array<{
    number: number;
    observed: number;
    expected: number;
    delta: number;
    zScore: number;
  }>;
  chiSquare: {
    statistic: number;
    degreesOfFreedom: number;
    approximatePValue: number;
    note: string;
  };
  topPairs: Array<{ key: string; count: number }>;
  bottomPairs: Array<{ key: string; count: number }>;
  topTriples: Array<{ key: string; count: number }>;
  bottomTriples: Array<{ key: string; count: number }>;
  overdueHighlights: Array<{ number: number; overdueBy: number }>;
  hotStreakHighlights: Array<{ number: number; appearancesInRecent100: number }>;
  overlapDistribution: Array<{ overlap: number; count: number }>;
  oddEvenDeviation: Array<{ pattern: string; count: number; share: number }>;
  lowHighDeviation: Array<{ pattern: string; count: number; share: number }>;
  sumOutliers: Array<{ round: number; sum: number; zScore: number }>;
  consecutiveSignal: {
    overRepresented: boolean;
    drawsWithConsecutive: number;
    expectedShare: number;
    actualShare: number;
  };
};

export type BacktestSummary = {
  strategy: StrategyKey;
  testsRun: number;
  averageHits: number;
  maxHits: number;
  hit3OrMore: number;
  hit4OrMore: number;
  sample: Array<{ round: number; hits: number; generated: number[]; actual: number[] }>;
};
