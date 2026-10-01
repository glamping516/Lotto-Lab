import { NextRequest, NextResponse } from "next/server";

import { loadLottoData } from "@/lib/lotto-analysis";
import { generateNumbers } from "@/lib/number-generators";
import { StrategyKey } from "@/lib/types";

const allowedStrategies = new Set<StrategyKey>([
  "random",
  "hot",
  "cold",
  "recentWeighted",
  "overdue",
  "balanced",
  "pairBased",
  "anomalyWeighted",
  "mixed"
]);

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    strategy?: StrategyKey;
    count?: number;
    recentWindow?: number;
  };
  const strategy = body.strategy && allowedStrategies.has(body.strategy) ? body.strategy : "mixed";
  const count = typeof body.count === "number" ? body.count : 5;
  const recentWindow = typeof body.recentWindow === "number" ? body.recentWindow : 100;

  const data = await loadLottoData();
  const games = generateNumbers(data, {
    strategy,
    count,
    recentWindow
  });

  return NextResponse.json({ games, dataRound: data[0]?.round });
}
