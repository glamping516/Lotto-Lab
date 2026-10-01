"use client";
import { useEffect, useRef, useState } from "react";
import { LottoMachine } from "./LottoMachine";
import { LottoBall } from "./LottoBall";
import { RepeatDrawExperiment } from "./RepeatDrawExperiment";
type Game = {numbers:number[]; explanation:string};
export function NumberGenerator() {
  const [count,setCount]=useState(1);
  const [pending,setPending]=useState(false);
  const [games,setGames]=useState<Game[]>([]);
  const [shown,setShown]=useState(0);
  const [error,setError]=useState("");
  const [round,setRound]=useState<number>();
  const [copied,setCopied]=useState(false);
  const [experimentBusy,setExperimentBusy]=useState(false);
  const controller=useRef<AbortController | null>(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  useEffect(()=>{
    if(!games.length) return;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers=Array.from({length:games.length*6},(_,i)=>setTimeout(()=>setShown(i+1),reduce?0:1400+i*300));
    return ()=>timers.forEach(clearTimeout);
  },[games]);
  const drawing= experimentBusy || pending || (games.length>0 && shown<games.length*6);
  const current=Math.min(Math.floor(Math.max(0,shown-1)/6),games.length-1);
  const drawn=current>=0?games[current].numbers.slice(0,shown-current*6):[];
  async function generate() {
    setPending(true);setError("");setGames([]);setShown(0);setCopied(false);
    controller.current=new AbortController();
    try {
      const response=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({count}),signal:controller.current.signal});
      if(!response.ok) throw new Error("번호를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      const payload=await response.json();
      if(!Array.isArray(payload.games)||!payload.games.length) throw new Error("추첨 결과를 확인할 수 없습니다.");
      setGames(payload.games);setRound(payload.dataRound);
    } catch(e) {
      if(e instanceof Error && e.name!=="AbortError") setError(e.message);
    } finally {setPending(false);}
  }
  return <section id="studio" className="studio panel">
    <div className="studio-visual">
      <div className="studio-label"><span>01 / DRAW STUDIO</span><span className="live-label">45 BALLS · 6 PICKS</span></div>
      <LottoMachine active={drawing} drawn={drawn}/>
      <div className="draw-slots" aria-hidden="true">{Array.from({length:6},(_,i)=>drawn[i]?<LottoBall key={i} number={drawn[i]}/>:<span key={i} className="empty-ball">{String(i+1).padStart(2,"0")}</span>)}</div>
    </div>
    <div className="studio-controls">
      <p className="eyebrow">YOUR NEXT SIX</p>
      <h2>가능성을 돌려보세요.</h2>
      <p className="section-copy">공을 섞고, 하나씩 꺼내고.<br/>최신 당첨 데이터를 바탕으로 나만의 조합을 만듭니다.</p>
      <p className="fixed-strategy">최근 200회 기준 · 검증 결과에 따라 자동 추첨</p>
      <label>게임 수<div className="count-options">{[1,5,10].map(n=><button key={n} disabled={drawing} className={count===n?"selected":""} onClick={()=>setCount(n)} aria-pressed={count===n}>{n} 게임</button>)}</div></label>
      <button className="generate-button" disabled={drawing} onClick={generate}>{drawing?"추첨 진행 중…":"추첨 시작하기"}<span>↗</span></button>
      <p className="control-note">중복 없는 6개 번호 · 통계 기반 조합</p>
      <RepeatDrawExperiment disabled={drawing && !experimentBusy} onBusy={setExperimentBusy}
        onStart={()=>{setGames([]);setShown(0);setError("");setCopied(false);}}
        onResult={(numbers,dataRound,attempts)=>{setRound(dataRound);setGames([{numbers,explanation:`과거 당첨 조합과 ${attempts.toLocaleString("ko-KR")}번째에 일치한 뒤, 새로 ${attempts.toLocaleString("ko-KR")}번 추첨한 마지막 조합입니다.`}]);}}/>
      {error&&<p role="alert" className="error-message">{error}</p>}
    </div>
    {games.length>0&&<div className="results" aria-live="polite">
      <div className="results-heading"><h3>나의 번호 조합</h3><span>{round}회 데이터 기준</span><button disabled={drawing} onClick={async()=>{try {await navigator.clipboard.writeText(games.map((g,i)=>`게임 ${i+1}: ${g.numbers.join(", ")}`).join("\n"));setCopied(true);}catch{setError("번호 복사를 사용할 수 없습니다.");}}}>{copied?"복사 완료":"번호 복사"}</button></div>
      {games.map((game,index)=>shown>index*6&&<div className="result-row" key={index}><div><span className="eyebrow">GAME {String(index+1).padStart(2,"0")}</span><p>{game.explanation}</p></div><div className="result-balls">{game.numbers.map((n,i)=>shown>index*6+i?<LottoBall key={n} number={n}/>:<span key={n} className="empty-ball">·</span>)}</div></div>)}
    </div>}
  </section>;
}
