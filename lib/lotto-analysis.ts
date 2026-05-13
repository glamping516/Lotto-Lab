import {
  AnomalyReport,
  BacktestSummary,
  DashboardSnapshot,
  LottoDraw,
  StrategyKey
} from "@/lib/types";
import { generateNumbers } from "@/lib/number-generators";
import { loadLottoData as loadDataFromSource } from "@/lib/lotto-data";
import { validateDraw as validateDrawInput } from "@/lib/validators";
import {
  average,
  rangeLabel,
  round,
  sliceWindow,
  standardDeviation,
  sumNumbers
} from "@/lib/utils";

export const loadLottoData = loadDataFromSource;
export const validateDraw = validateDrawInput;

function buildFrequencyBase(data: LottoDraw[]) {
  const counts = Array.from({ length: 45 }, (_, index) => ({
    number: index + 1,
    count: 0
  }));

  data.forEach((draw) => {
    draw.numbers.forEach((number) => {
      counts[number - 1].count += 1;
    });
  });

  return counts;
}

export function getLatestDraw(data: LottoDraw[]) {
  return data[0] ?? null;
}

export function calculateNumberFrequency(
  data: LottoDraw[],
  options?: { window?: number | "all" }
) {
  const subset = sliceWindow(data, options?.window ?? "all");
  const counts = buildFrequencyBase(subset);
  const expected = subset.length ? (subset.length * 6) / 45 : 0;

  return counts.map((item) => ({
    ...item,
    expected: round(expected, 2),
    delta: round(item.count - expected, 2)
  }));
}

export function calculateBonusFrequency(data: LottoDraw[]) {
  const counts = Array.from({ length: 45 }, (_, index) => ({
    number: index + 1,
    count: 0
  }));

  data.forEach((draw) => {
    counts[draw.bonus - 1].count += 1;
  });

  return counts;
}

export function calculateOddEvenDistribution(data: LottoDraw[]) {
  const distribution = new Map<string, number>();

  data.forEach((draw) => {
    const odd = draw.numbers.filter((number) => number % 2 === 1).length;
    const even = 6 - odd;
    const key = `${odd}:${even}`;
    distribution.set(key, (distribution.get(key) ?? 0) + 1);
  });

  return Array.from(distribution.entries()).map(([label, value]) => ({
    label,
    value
  }));
}

export function calculateLowHighDistribution(data: LottoDraw[]) {
  const distribution = new Map<string, number>();

  data.forEach((draw) => {
    const low = draw.numbers.filter((number) => number <= 22).length;
    const high = 6 - low;
    const key = `${low}:${high}`;
    distribution.set(key, (distribution.get(key) ?? 0) + 1);
  });

  return Array.from(distribution.entries()).map(([label, value]) => ({
    label,
    value
  }));
}

export function calculateBandDistribution(data: LottoDraw[]) {
  const bands = [
    { label: "1-10", min: 1, max: 10 },
    { label: "11-20", min: 11, max: 20 },
    { label: "21-30", min: 21, max: 30 },
    { label: "31-40", min: 31, max: 40 },
    { label: "41-45", min: 41, max: 45 }
  ];

  return bands.map((band) => ({
    label: band.label,
    value: data.reduce(
      (sum, draw) =>
        sum +
        draw.numbers.filter(
          (number) => number >= band.min && number <= band.max
        ).length,
      0
    )
  }));
}

export function calculateSumDistribution(data: LottoDraw[]) {
  const buckets = new Map<string, number>();

  data.forEach((draw) => {
    const sum = sumNumbers(draw.numbers);
    const start = Math.floor(sum / 20) * 20;
    const label = `${start}-${start + 19}`;
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  });

  return Array.from(buckets.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => Number(a.label.split("-")[0]) - Number(b.label.split("-")[0]));
}

export function calculateSumTrend(data: LottoDraw[]) {
  return [...data]
    .reverse()
    .map((draw) => ({ round: draw.round, sum: sumNumbers(draw.numbers) }));
}

export function calculateConsecutiveStats(data: LottoDraw[]) {
  const distribution = new Map<number, number>();
  let withConsecutive = 0;

  data.forEach((draw) => {
    let consecutivePairs = 0;
    for (let index = 1; index < draw.numbers.length; index += 1) {
      if (draw.numbers[index] - draw.numbers[index - 1] === 1) {
        consecutivePairs += 1;
      }
    }

    if (consecutivePairs > 0) {
      withConsecutive += 1;
    }
    distribution.set(consecutivePairs, (distribution.get(consecutivePairs) ?? 0) + 1);
  });

  return {
    drawsWithConsecutive: withConsecutive,
    drawsWithoutConsecutive: data.length - withConsecutive,
    distribution: Array.from(distribution.entries()).map(([pairs, count]) => ({
      label: `${pairs}쌍`,
      count
    }))
  };
}

export function calculateLastDigitStats(data: LottoDraw[]) {
  const counts = Array.from({ length: 10 }, (_, digit) => ({
    digit,
    count: 0
  }));

  data.forEach((draw) => {
    draw.numbers.forEach((number) => {
      counts[number % 10].count += 1;
    });
  });

  return counts;
}

export function calculatePairFrequency(data: LottoDraw[]) {
  const counts = new Map<string, number>();

  data.forEach((draw) => {
    for (let index = 0; index < draw.numbers.length; index += 1) {
      for (let inner = index + 1; inner < draw.numbers.length; inner += 1) {
        const key = `${draw.numbers[index]}-${draw.numbers[inner]}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  });

  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export function calculateTripleFrequency(data: LottoDraw[]) {
  const counts = new Map<string, number>();

  data.forEach((draw) => {
    for (let a = 0; a < draw.numbers.length; a += 1) {
      for (let b = a + 1; b < draw.numbers.length; b += 1) {
        for (let c = b + 1; c < draw.numbers.length; c += 1) {
          const key = `${draw.numbers[a]}-${draw.numbers[b]}-${draw.numbers[c]}`;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
    }
  });

  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export function calculateOverdueNumbers(data: LottoDraw[]) {
  return Array.from({ length: 45 }, (_, index) => {
    const number = index + 1;
    const foundIndex = data.findIndex((draw) => draw.numbers.includes(number));
    return {
      number,
      overdueBy: foundIndex === -1 ? data.length : foundIndex
    };
  }).sort((a, b) => b.overdueBy - a.overdueBy);
}

export function calculateDrawOverlapStats(data: LottoDraw[]) {
  const counts = new Map<number, number>();

  for (let index = 0; index < data.length - 1; index += 1) {
    const current = data[index];
    const previous = data[index + 1];
    const overlap = current.numbers.filter((value) =>
      previous.numbers.includes(value)
    ).length;
    counts.set(overlap, (counts.get(overlap) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([overlap, count]) => ({ overlap, count }))
    .sort((a, b) => a.overlap - b.overlap);
}

function erfApproximation(value: number) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
  return sign * y;
}

function normalCdf(value: number) {
  return (1 + erfApproximation(value / Math.sqrt(2))) / 2;
}

function chiSquarePValueApproximation(statistic: number, degreesOfFreedom: number) {
  if (degreesOfFreedom <= 0) {
    return 1;
  }
  const x = (statistic / degreesOfFreedom) ** (1 / 3);
  const mu = 1 - 2 / (9 * degreesOfFreedom);
  const sigma = Math.sqrt(2 / (9 * degreesOfFreedom));
  return 1 - normalCdf((x - mu) / sigma);
}

export function detectAnomalies(data: LottoDraw[]): AnomalyReport {
  const numberFrequency = calculateNumberFrequency(data);
  const expectedAppearances = data.length ? (data.length * 6) / 45 : 0;
  const chiSquareStatistic = numberFrequency.reduce((sum, item) => {
    if (!expectedAppearances) {
      return sum;
    }
    return sum + ((item.count - expectedAppearances) ** 2) / expectedAppearances;
  }, 0);

  const recent100 = data.slice(0, 100);
  const frequencyRecent100 = calculateNumberFrequency(recent100);
  const sums = data.map((draw) => sumNumbers(draw.numbers));
  const meanSum = average(sums);
  const stdSum = standardDeviation(sums) || 1;
  const consecutive = calculateConsecutiveStats(data);
  const oddEven = calculateOddEvenDistribution(data).map((item) => ({
    pattern: item.label,
    count: item.value,
    share: round(item.value / data.length, 4)
  }));
  const lowHigh = calculateLowHighDistribution(data).map((item) => ({
    pattern: item.label,
    count: item.value,
    share: round(item.value / data.length, 4)
  }));

  return {
    expectedVsObserved: numberFrequency
      .map((item) => ({
        number: item.number,
        observed: item.count,
        expected: expectedAppearances,
        delta: round(item.count - expectedAppearances, 2),
        zScore: round(
          expectedAppearances
            ? (item.count - expectedAppearances) / Math.sqrt(expectedAppearances)
            : 0,
          2
        )
      }))
      .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore)),
    chiSquare: {
      statistic: round(chiSquareStatistic, 2),
      degreesOfFreedom: 44,
      approximatePValue: round(chiSquarePValueApproximation(chiSquareStatistic, 44), 4),
      note: "반복 검정으로 인해 우연히 낮은 p-value가 관측될 수 있습니다."
    },
    topPairs: calculatePairFrequency(data).slice(0, 10),
    bottomPairs: calculatePairFrequency(data).slice(-10).reverse(),
    topTriples: calculateTripleFrequency(data).slice(0, 10),
    bottomTriples: calculateTripleFrequency(data).slice(-10).reverse(),
    overdueHighlights: calculateOverdueNumbers(data).slice(0, 10),
    hotStreakHighlights: frequencyRecent100
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        number: item.number,
        appearancesInRecent100: item.count
      })),
    overlapDistribution: calculateDrawOverlapStats(data),
    oddEvenDeviation: oddEven.sort((a, b) => b.share - a.share),
    lowHighDeviation: lowHigh.sort((a, b) => b.share - a.share),
    sumOutliers: data
      .map((draw) => ({
        round: draw.round,
        sum: sumNumbers(draw.numbers),
        zScore: round((sumNumbers(draw.numbers) - meanSum) / stdSum, 2)
      }))
      .filter((item) => Math.abs(item.zScore) >= 2)
      .slice(0, 20),
    consecutiveSignal: {
      overRepresented: consecutive.drawsWithConsecutive / data.length > 0.55,
      drawsWithConsecutive: consecutive.drawsWithConsecutive,
      expectedShare: 0.49,
      actualShare: round(consecutive.drawsWithConsecutive / data.length, 4)
    }
  };
}

export function buildStatsSnapshot(
  data: LottoDraw[],
  window: number | "all"
): DashboardSnapshot {
  const subset = sliceWindow(data, window);
  return {
    rangeLabel: rangeLabel(window),
    totalDraws: subset.length,
    numberFrequency: calculateNumberFrequency(subset),
    bonusFrequency: calculateBonusFrequency(subset),
    oddEven: calculateOddEvenDistribution(subset),
    lowHigh: calculateLowHighDistribution(subset),
    bandDistribution: calculateBandDistribution(subset),
    sumDistribution: calculateSumDistribution(subset),
    sumTrend: calculateSumTrend(subset),
    consecutive: calculateConsecutiveStats(subset),
    lastDigit: calculateLastDigitStats(subset),
    pairTop20: calculatePairFrequency(subset)
      .slice(0, 20)
      .map((item) => ({ label: item.key, count: item.count })),
    overlap: calculateDrawOverlapStats(subset)
  };
}

export function runBacktest(
  data: LottoDraw[],
  strategy: StrategyKey,
  options?: { window?: number; recentWindow?: number }
): BacktestSummary {
  const limit = options?.window ?? 120;
  const startIndex = Math.min(data.length - 2, limit);
  const results: BacktestSummary["sample"] = [];
  const hits: number[] = [];

  for (let index = startIndex; index >= 0; index -= 1) {
    const actual = data[index];
    const training = data.slice(index + 1);
    if (training.length < 30) {
      continue;
    }

    const generated = generateNumbers(training, {
      strategy,
      count: 1,
      recentWindow: options?.recentWindow ?? 100
    })[0]!;

    const hitCount = generated.numbers.filter((number: number) =>
      actual.numbers.includes(number)
    ).length;

    hits.push(hitCount);
    if (results.length < 8) {
      results.push({
        round: actual.round,
        hits: hitCount,
        generated: generated.numbers,
        actual: actual.numbers
      });
    }
  }

  return {
    strategy,
    testsRun: hits.length,
    averageHits: round(average(hits), 2),
    maxHits: hits.length ? Math.max(...hits) : 0,
    hit3OrMore: hits.filter((value) => value >= 3).length,
    hit4OrMore: hits.filter((value) => value >= 4).length,
    sample: results
  };
}
