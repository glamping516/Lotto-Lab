import { NextRequest, NextResponse } from "next/server";

import { loadLottoData } from "@/lib/lotto-analysis";
import { generateNumbers } from "@/lib/number-generators";
import { StrategyKey } from "@/lib/types";
import policy from "@/data/draw-policy.json";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    count?: number;
  };
  const strategy = policy.strategy as StrategyKey;
  const count = typeof body.count === "number" ? body.count : 5;
  const recentWindow = policy.analysisWindow;

  const data = await loadLottoData();
  const games = generateNumbers(data, {
    strategy,
    count,
    recentWindow
  });

  return NextResponse.json({ games, dataRound: data[0]?.round });
}
