import { NextResponse } from "next/server";

import { buildStatsSnapshot, detectAnomalies, loadLottoData } from "@/lib/lotto-analysis";

export async function GET() {
  const data = await loadLottoData();
  return NextResponse.json({
    latest: data[0] ?? null,
    count: data.length,
    snapshots: {
      "50": buildStatsSnapshot(data, 50),
      "100": buildStatsSnapshot(data, 100),
      all: buildStatsSnapshot(data, "all")
    },
    anomalies: detectAnomalies(data)
  });
}
