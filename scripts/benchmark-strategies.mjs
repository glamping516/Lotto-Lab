import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { createStrategySampler,strategyKeys,strategyLabels } from "../lib/strategy-sampler.ts";
const input=await fs.readFile(new URL("../data/lotto.json",import.meta.url),"utf8");
const data=JSON.parse(input).sort((a,b)=>b.round-a.round);
const targets=data.slice(0,200);
const powers=Array.from({length:45},(_,i)=>2**i);
const key=numbers=>numbers.reduce((sum,n)=>sum+powers[n-1],0);
const keys=new Set(targets.map(d=>key(d.numbers)));
const hash=createHash("sha256").update(input).digest("hex");
const results=[];
for(const strategy of strategyKeys){
  const seed=createHash("sha256").update(hash+strategy+"benchmark-v1").digest();
  let a=seed.readUInt32LE(0),b=seed.readUInt32LE(4),c=seed.readUInt32LE(8),d=seed.readUInt32LE(12);
  const random=()=>{a>>>=0;b>>>=0;c>>>=0;d>>>=0;const t=(a+b+d)|0;d=(d+1)|0;a=b^(b>>>9);b=(c+(c<<3))|0;c=((c<<21)|(c>>>11));c=(c+t)|0;return(t>>>0)/4294967296;};
  const draw=createStrategySampler(data,strategy,200,random,false);
  const trials=[];
  const start=performance.now();
  for(let trial=0;trial<100;trial++){
    let attempts=0,numbers;
    do{numbers=draw();attempts++;}while(!keys.has(key(numbers)));
    trials.push({attempts,matchedNumbers:[...numbers].sort((a,b)=>a-b),matchedRounds:targets.filter(t=>key(t.numbers)===key(numbers)).map(t=>t.round)});
  }
  const counts=trials.map(t=>t.attempts),total=counts.reduce((a,b)=>a+b,0),mean=total/100;
  const sd=Math.sqrt(counts.reduce((sum,n)=>sum+(n-mean)**2,0)/99);
  const result={strategy,label:strategyLabels[strategy],trials,totalAttempts:total,meanAttempts:mean,
    medianAttempts:[...counts].sort((a,b)=>a-b).slice(49,51).reduce((a,b)=>a+b)/2,
    standardError:sd/10,estimatedMatchRate:100/total,seconds:(performance.now()-start)/1000};
  results.push(result);
  console.log(JSON.stringify({strategy,meanAttempts:mean,totalAttempts:total,seconds:result.seconds}));
}
results.sort((a,b)=>a.meanAttempts-b.meanAttempts);
const report={version:1,createdAt:new Date().toISOString(),dataRound:data[0].round,oldestTargetRound:targets.at(-1).round,
  datasetSha256:hash,targetWindow:200,analysisWindow:200,trialsPerStrategy:100,uniqueTargetCombinations:keys.size,
  selectionMetric:"lowest empirical mean attempts to match any of the latest 200 historical draws",
  selectedStrategy:results[0].strategy,
  notes:["Retrospective in-sample comparison, not evidence of better future lottery odds.",
    "Each attempt counts a generated six-number combination; rejected balanced candidates are not counted.",
    "Existing mixed single-game generation is equivalent to hot; compared with its existing semantics.",
    "100 trials have sampling uncertainty; winner is the observed result of this run."],
  results};
await fs.writeFile(new URL("../data/strategy-benchmark.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
await fs.writeFile(new URL("../data/draw-policy.json",import.meta.url),JSON.stringify({
  strategy:report.selectedStrategy,label:results[0].label,analysisWindow:200,targetWindow:200,
  benchmarkRound:report.dataRound,benchmarkMean:results[0].meanAttempts,trialsPerStrategy:100
},null,2)+"\n");
console.log("SELECTED: "+report.selectedStrategy);
