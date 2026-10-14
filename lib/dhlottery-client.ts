import { LottoDraw } from "@/lib/types";
import { validateDraw } from "@/lib/validators";
const ENDPOINT = "https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do";
export async function fetchDraws(start:number,end:number):Promise<LottoDraw[]> {
  const url=new URL(ENDPOINT);
  url.searchParams.set("srchStrLtEpsd",String(start));
  url.searchParams.set("srchEndLtEpsd",String(end));
  let lastError:unknown;
  for(let attempt=0;attempt<3;attempt++) {
    try {
      const response=await fetch(url,{signal:AbortSignal.timeout(8000),cache:"no-store"});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload=await response.json();
      if(!Array.isArray(payload?.data?.list)) throw new Error("공식 API 형식 변경");
      return payload.data.list.map((row:Record<string,unknown>)=>{
        const draw:LottoDraw={round:Number(row.ltEpsd),numbers:Array.from({length:6},(_,i)=>Number(row[`tm${i+1}WnNo`])).sort((a,b)=>a-b) as LottoDraw["numbers"],bonus:Number(row.bnsWnNo),source:"dhlottery",updatedAt:new Date().toISOString()};
        validateDraw(draw);return draw;
      }).sort((a:LottoDraw,b:LottoDraw)=>b.round-a.round);
    } catch(error) {lastError=error;}
  }
  throw lastError;
}
export async function fetchDrawByRound(round:number) {
  return (await fetchDraws(round,round))[0]??null;
}
export async function fetchLatestAvailableDraw(currentLatestRound=1) {
  const target=Math.floor((Date.now()-Date.parse("2002-12-07T12:00:00Z"))/604800000)+1;
  return (await fetchDraws(Math.min(currentLatestRound,target),target))[0]??null;
}
