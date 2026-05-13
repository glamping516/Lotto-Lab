import { NextResponse } from "next/server";

import { getLatestDraw } from "@/lib/lotto-data";

export async function GET() {
  const latest = await getLatestDraw();
  return NextResponse.json({
    latest
  });
}
