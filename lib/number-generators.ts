import {
  calculateNumberFrequency,
  calculateOverdueNumbers,
  calculatePairFrequency
} from "@/lib/lotto-analysis";
import { GeneratedGame, LottoDraw, StrategyKey, WeightedItem } from "@/lib/types";
import { clamp, sumNumbers } from "@/lib/utils";
import { createWeightedSampler } from "@/lib/strategy-sampler";

function makeUniformWeights(): WeightedItem[] {
  return Array.from({ length: 45 }, (_, index) => ({
    number: index + 1,
    weight: 1
  }));
}

function recentSubset(data: LottoDraw[], recentWindow: number) {
  return data.slice(0, clamp(recentWindow, 10, data.length || 10));
}

function buildWeightedGames(
  items: WeightedItem[],
  count: number,
  strategy: StrategyKey,
  explanation: string
): GeneratedGame[] {
  const weights=Array.from({length:45},(_,i)=>items.find(item=>item.number===i+1)?.weight??0.01);
  const draw=createWeightedSampler(weights);
  return Array.from({ length: count }, () => {
    return {
      strategy,
      numbers: draw(),
      explanation
    };
  });
}

function buildRandomGames(count: number): GeneratedGame[] {
  return buildWeightedGames(
    makeUniformWeights(),
    count,
    "random",
    "1~45 전체 구간에서 균등 확률로 추출했습니다."
  );
}

function buildHotGames(
  data: LottoDraw[],
  count: number,
  recentWindow: number
): GeneratedGame[] {
  const weights = calculateNumberFrequency(recentSubset(data, recentWindow)).map((item) => ({
    number: item.number,
    weight: item.count + 1
  }));
  return buildWeightedGames(
    weights,
    count,
    "hot",
    `최근 ${recentWindow}회 빈도가 높은 번호에 가중치를 부여했습니다.`
  );
}

function buildColdGames(
  data: LottoDraw[],
  count: number,
  recentWindow: number
): GeneratedGame[] {
  const frequencies = calculateNumberFrequency(recentSubset(data, recentWindow));
  const max = Math.max(...frequencies.map((item) => item.count), 1);
  const weights = frequencies.map((item) => ({
    number: item.number,
    weight: max - item.count + 1
  }));
  return buildWeightedGames(
    weights,
    count,
    "cold",
    `최근 ${recentWindow}회 기준 덜 나온 번호에 더 높은 가중치를 주었습니다.`
  );
}

function buildRecentWeightedGames(data: LottoDraw[], count: number): GeneratedGame[] {
  const weights = Array.from({ length: 45 }, (_, index) => ({
    number: index + 1,
    weight: 1
  }));

  data.forEach((draw, index) => {
    const recencyWeight = Math.max(1, data.length - index);
    draw.numbers.forEach((number) => {
      weights[number - 1].weight += recencyWeight;
    });
  });

  return buildWeightedGames(
    weights,
    count,
    "recentWeighted",
    "최근 회차일수록 더 큰 영향을 주는 감쇠 가중치를 적용했습니다."
  );
}

function buildOverdueGames(data: LottoDraw[], count: number): GeneratedGame[] {
  const weights = calculateOverdueNumbers(data).map((item) => ({
    number: item.number,
    weight: item.overdueBy + 1
  }));
  return buildWeightedGames(
    weights,
    count,
    "overdue",
    "장기 미출현 번호일수록 상대적으로 높은 가중치를 적용했습니다."
  );
}

function isBalanced(numbers: number[], historicalSums: number[]) {
  const odd = numbers.filter((number) => number % 2 === 1).length;
  const low = numbers.filter((number) => number <= 22).length;
  const sum = sumNumbers(numbers);
  const sortedSums = [...historicalSums].sort((a, b) => a - b);
  const lower = sortedSums[Math.floor(sortedSums.length * 0.2)] ?? 90;
  const upper = sortedSums[Math.floor(sortedSums.length * 0.8)] ?? 170;

  return (
    odd >= 2 &&
    odd <= 4 &&
    low >= 2 &&
    low <= 4 &&
    sum >= lower &&
    sum <= upper
  );
}

function buildBalancedGames(data: LottoDraw[], count: number): GeneratedGame[] {
  const historicalSums = data.map((draw) => sumNumbers(draw.numbers));
  const games: GeneratedGame[] = [];

  while (games.length < count) {
    const candidate = buildRandomGames(1)[0]!.numbers;
    if (isBalanced(candidate, historicalSums)) {
      games.push({
        strategy: "balanced",
        numbers: candidate,
        explanation: "홀짝, 고저, 합계 구간이 과거 중앙 분포와 비슷한 조합을 선별했습니다."
      });
    }
  }

  return games;
}

function buildPairBasedGames(data: LottoDraw[], count: number): GeneratedGame[] {
  const pairs = calculatePairFrequency(recentSubset(data, 200)).slice(0, 40);
  const baseWeights = makeUniformWeights();
  const pairBoosts = new Map<number, number>();

  pairs.forEach((pair, index) => {
    const weight = Math.max(1, 10 - Math.floor(index / 5));
    pair.key.split("-").map(Number).forEach((number) => {
      pairBoosts.set(number, (pairBoosts.get(number) ?? 0) + weight);
    });
  });

  const weights = baseWeights.map((item) => ({
    number: item.number,
    weight: item.weight + (pairBoosts.get(item.number) ?? 0)
  }));

  return buildWeightedGames(
    weights,
    count,
    "pairBased",
    "최근 자주 같이 나온 번호쌍을 일부 반영하되, 기본 랜덤성도 함께 유지했습니다."
  );
}

function buildAnomalyWeightedGames(data: LottoDraw[], count: number): GeneratedGame[] {
  const frequencies = calculateNumberFrequency(data);
  const overdue = new Map(
    calculateOverdueNumbers(data).map((item) => [item.number, item.overdueBy])
  );
  const expected = data.length ? (data.length * 6) / 45 : 0;
  const weights = makeUniformWeights().map((item) => {
    const signal = frequencies.find((entry) => entry.number === item.number);
    const zScore = expected ? ((signal?.count ?? 0) - expected) / Math.sqrt(expected) : 0;
    return {
      number: item.number,
      weight: 1 + Math.abs(zScore) + (overdue.get(item.number) ?? 0) / 12
    };
  });

  return buildWeightedGames(
    weights,
    count,
    "anomalyWeighted",
    "빈도 편차와 이상 신호 점수가 상대적으로 큰 번호를 가중치에 반영했습니다."
  );
}

function buildMixedGames(
  data: LottoDraw[],
  count: number,
  recentWindow: number
): GeneratedGame[] {
  const strategies: StrategyKey[] = [
    "hot",
    "cold",
    "recentWeighted",
    "overdue",
    "balanced",
    "pairBased",
    "anomalyWeighted"
  ];

  return Array.from({ length: count }, (_, index) => {
    const strategy = strategies[index % strategies.length]!;
    const result = generateNumbers(data, {
      strategy,
      count: 1,
      recentWindow
    })[0]!;

    return {
      ...result,
      strategy: "mixed",
      explanation: `혼합 전략: ${strategy} 기반 후보를 차례로 섞어 추출했습니다.`
    };
  });
}

export function generateNumbers(
  data: LottoDraw[],
  options: { strategy: StrategyKey; count: number; recentWindow?: number }
): GeneratedGame[] {
  const count = clamp(options.count, 1, 10);
  const recentWindow = clamp(options.recentWindow ?? 100, 20, 300);

  switch (options.strategy) {
    case "random":
      return buildRandomGames(count);
    case "hot":
      return buildHotGames(data, count, recentWindow);
    case "cold":
      return buildColdGames(data, count, recentWindow);
    case "recentWeighted":
      return buildRecentWeightedGames(data, count);
    case "overdue":
      return buildOverdueGames(data, count);
    case "balanced":
      return buildBalancedGames(data, count);
    case "pairBased":
      return buildPairBasedGames(data, count);
    case "anomalyWeighted":
      return buildAnomalyWeightedGames(data, count);
    case "mixed":
      return buildMixedGames(data, count, recentWindow);
    default:
      return buildRandomGames(count);
  }
}
