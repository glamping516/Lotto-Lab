import { NextResponse } from "next/server";
import { loadLottoData } from "@/lib/lotto-data";
export const dynamic = "force-dynamic";
export async function GET() {
  const data=(await loadLottoData()).slice(0,100);
  if(!data.length) return NextResponse.json({message:"비교할 당첨번호가 없습니다."},{status:503});
  return NextResponse.json({
    targets:data.map(({round,numbers})=>({round,numbers})),
    dataRound:data[0].round,
    totalCombinations:8145060,
    uniqueCombinations:new Set(data.map(d=>d.numbers.join(","))).size
  },{headers:{"Cache-Control":"no-store"}});
}
