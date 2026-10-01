import { NextResponse } from "next/server";
import { loadLottoData } from "@/lib/lotto-data";
import policy from "@/data/draw-policy.json";
export const dynamic = "force-dynamic";
export async function GET() {
  const all=await loadLottoData();
  const data=all.slice(0,policy.targetWindow);
  if(!data.length) return NextResponse.json({message:"비교할 당첨번호가 없습니다."},{status:503});
  return NextResponse.json({
    targets:data.map(({round,numbers})=>({round,numbers})),
    dataRound:data[0].round,
    totalCombinations:8145060,
    uniqueCombinations:new Set(data.map(d=>d.numbers.join(","))).size,
    training:all.map(({numbers})=>({numbers})),policy
  },{headers:{"Cache-Control":"no-store"}});
}
