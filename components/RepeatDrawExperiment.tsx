"use client";
import { useEffect, useRef, useState } from "react";
import type { ExperimentState, TargetDraw } from "@/lib/repeat-draw";

type Props = {
  disabled: boolean;
  onBusy: (busy:boolean)=>void;
  onStart: ()=>void;
  onResult: (numbers:number[],round:number,attempts:number)=>void;
};
const format=(n:number)=>n.toLocaleString("ko-KR");
export function RepeatDrawExperiment({disabled,onBusy,onStart,onResult}:Props) {
  const worker=useRef<Worker|null>(null);
  const request=useRef<AbortController|null>(null);
  const running=useRef(false);
  const [status,setStatus]=useState<"idle"|"loading"|"running"|"complete"|"cancelled"|"error">("idle");
  const [state,setState]=useState<ExperimentState|null>(null);
  const [round,setRound]=useState(0);
  const [targetCount,setTargetCount]=useState(100);
  const [uniqueCount,setUniqueCount]=useState(100);
  const [error,setError]=useState("");
  useEffect(()=>()=>{request.current?.abort();worker.current?.terminate();},[]);
  const busy=status==="loading"||status==="running";
  function stop() {
    running.current=false;
    request.current?.abort();worker.current?.terminate();worker.current=null;
    setStatus("cancelled");onBusy(false);
  }
  async function start() {
    if(disabled||running.current) return;
    running.current=true;onBusy(true);onStart();
    setStatus("loading");setState(null);setError("");
    request.current=new AbortController();
    try {
      const response=await fetch("/api/repeat-draw",{cache:"no-store",signal:request.current.signal});
      if(!response.ok) throw new Error("최근 당첨 데이터를 불러오지 못했습니다. 다시 시도해 주세요.");
      const payload=await response.json() as {targets:TargetDraw[];dataRound:number;uniqueCombinations:number};
      if(!running.current) return;
      setRound(payload.dataRound);setTargetCount(payload.targets.length);setUniqueCount(payload.uniqueCombinations);
      const instance=new Worker(new URL("../lib/repeat-draw.worker.ts",import.meta.url));
      worker.current=instance;
      const fail=(message:string)=>{
        if(worker.current!==instance) return;
        instance.terminate();worker.current=null;running.current=false;
        setStatus("error");setError(message);onBusy(false);
      };
      instance.onerror=()=>fail("반복 추첨을 실행하지 못했습니다. 다시 시도해 주세요.");
      instance.onmessage=(event:MessageEvent<ExperimentState & {type:string;message?:string}>)=>{
        if(worker.current!==instance) return;
        if(event.data.type==="error") {fail(event.data.message??"반복 추첨 실패");return;}
        const result=event.data;setState(result);
        if(result.phase==="complete") {
          instance.terminate();worker.current=null;running.current=false;
          setStatus("complete");onBusy(false);onResult(result.finalNumbers,payload.dataRound,result.attempts);
        }
      };
      setStatus("running");instance.postMessage({targets:payload.targets});
    } catch(e) {
      if(!running.current) return;
      running.current=false;onBusy(false);setStatus("error");
      setError(e instanceof Error?e.message:"반복 추첨 실패");
    }
  }
  const matched=state&&state.matchedRounds.length>0;
  return <div className="repeat-experiment">
    <button type="button" className="repeat-button" disabled={disabled||busy} onClick={start}>당첨번호 나올 때까지 뽑기 <span>↻</span></button>
    <p className="experiment-note">최근 100회 당첨 조합과 비교하는 완전 랜덤 실험입니다.<br/>일치까지 실제로 반복하고, 같은 횟수만큼 다시 뽑아 마지막 조합을 표시합니다.</p>
    {status!=="idle"&&<div className="experiment-status" role="status" aria-live="polite">
      {status==="loading"&&<p>최근 당첨번호를 불러오고 있습니다…</p>}
      {state?.phase==="search"&&<p>{format(state.attempts)}회 추첨 · {status==="cancelled"?"중단":"과거 당첨 조합 찾는 중"}</p>}
      {matched&&<><strong>{format(state.attempts)}번째에 당첨되셨습니다!</strong>
        <p>{state.matchedRounds.map(format).join("·")}회 과거 당첨번호와 6개 번호가 일치했습니다.</p>
        {status!=="cancelled"&&<p>{status==="complete"?`다시 ${format(state.attempts)}번 추첨했습니다. 마지막 번호를 확인하세요.`:`다시 ${format(state.attempts)}번 추첨해서 번호를 뽑겠습니다!`}</p>}
      </>}
      {state?.phase==="replay"&&busy&&<><progress aria-label="다시 추첨 진행률" max={state.attempts} value={state.repeated}/><p>{format(state.repeated)} / {format(state.attempts)}회 재추첨</p></>}
      {status==="cancelled"&&<p>추첨을 중단했습니다. 다시 실행하면 1회부터 시작합니다.</p>}
      {status==="error"&&<p className="error-message">{error}</p>}
      {round>0&&<p className="experiment-meta">{round}회 기준 최근 {targetCount}회 · 서로 다른 조합 {uniqueCount}개<br/>일치까지 평균 약 {format(Math.round(8145060/uniqueCount))}회 · 실제 당첨을 의미하지 않습니다.</p>}
    </div>}
    {busy&&<button type="button" className="cancel-experiment" onClick={stop}>추첨 중단</button>}
  </div>;
}
