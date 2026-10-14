import type { StrategyKey } from "./types";
export const strategyLabels: Record<StrategyKey,string> = {
  random:"완전 랜덤",hot:"많이 나온 번호",cold:"적게 나온 번호",
  recentWeighted:"최근 회차 가중치",overdue:"장기 미출현",balanced:"균형 조합",
  pairBased:"번호쌍 기반",anomalyWeighted:"통계 편차 가중치",mixed:"혼합 전략"
};
export const strategyKeys = Object.keys(strategyLabels) as StrategyKey[];

export function prepareStrategy(data: {numbers:number[]}[], strategy:StrategyKey, recentWindow=200) {
  const frequency=(draws:typeof data)=>{
    const counts=Array<number>(45).fill(0);
    draws.forEach(draw=>draw.numbers.forEach(n=>counts[n-1]++));
    return counts;
  };
  const overdue=Array.from({length:45},(_,i)=>{
    const index=data.findIndex(d=>d.numbers.includes(i+1));return index<0?data.length:index;
  });
  let weights=Array<number>(45).fill(1);
  let bounds:[number,number]|null=null;
  if(strategy==="hot"||strategy==="mixed") weights=frequency(data.slice(0,recentWindow)).map(n=>n+1);
  if(strategy==="cold") {
    const counts=frequency(data.slice(0,recentWindow)),max=Math.max(...counts,1);
    weights=counts.map(n=>max-n+1);
  }
  if(strategy==="recentWeighted") data.forEach((d,i)=>d.numbers.forEach(n=>weights[n-1]+=Math.max(1,data.length-i)));
  if(strategy==="overdue") weights=overdue.map(n=>n+1);
  if(strategy==="pairBased") {
    const pairs=new Map<string,number>();
    data.slice(0,200).forEach(d=>{for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){
      const key=d.numbers[i]+"-"+d.numbers[j];pairs.set(key,(pairs.get(key)??0)+1);
    }});
    [...pairs.entries()].sort((a,b)=>b[1]-a[1]).slice(0,40).forEach(([key],i)=>{
      key.split("-").map(Number).forEach(n=>weights[n-1]+=Math.max(1,10-Math.floor(i/5)));
    });
  }
  if(strategy==="anomalyWeighted"){
    const counts=frequency(data),expected=data.length*6/45;
    weights=counts.map((n,i)=>1+(expected?Math.abs((n-expected)/Math.sqrt(expected)):0)+overdue[i]/12);
  }
  if(strategy==="balanced") {
    const sums=data.map(d=>d.numbers.reduce((a,b)=>a+b,0)).sort((a,b)=>a-b);
    bounds=[sums[Math.floor(sums.length*.2)]??90,sums[Math.floor(sums.length*.8)]??170];
  }
  return {weights,bounds};
}
export function meetsBalance(numbers:number[],bounds:[number,number]){
  let odd=0,low=0,sum=0;
  for(const n of numbers){odd+=n%2;low+=n<=22?1:0;sum+=n;}
  return odd>=2&&odd<=4&&low>=2&&low<=4&&sum>=bounds[0]&&sum<=bounds[1];
}
export function createStrategySampler(
  data:{numbers:number[]}[],strategy:StrategyKey,recentWindow=200,random:()=>number=Math.random,
  sorted=true
) {
  const {weights,bounds}=prepareStrategy(data,strategy,recentWindow);
  return createWeightedSampler(weights,bounds,random,sorted);
}
export function createWeightedSampler(weights:number[],bounds:[number,number]|null=null,random:()=>number=Math.random,sorted=true) {
  // Alias sampling plus rejecting already selected balls is equivalent to
  // the existing weighted-without-replacement rule, without rebuilding pools.
  const total=weights.reduce((a,b)=>a+b,0);
  const scaled=weights.map(w=>w*45/total),prob=Array<number>(45).fill(1),alias=Array<number>(45).fill(0);
  const small:number[]=[],large:number[]=[];
  scaled.forEach((p,i)=>(p<1?small:large).push(i));
  while(small.length&&large.length) {
    const a=small.pop()!,b=large.pop()!;prob[a]=scaled[a];alias[a]=b;
    scaled[b]-=1-scaled[a];(scaled[b]<1?small:large).push(b);
  }
  return () => {
    let numbers:number[];
    do {
      numbers=[];
      while(numbers.length<6){
        const column=Math.floor(random()*45);
        const n=(random()<prob[column]?column:alias[column])+1;
        if(!numbers.includes(n)) numbers.push(n);
      }
    }while(bounds&&!meetsBalance(numbers,bounds));
    return sorted?numbers.sort((a,b)=>a-b):numbers;
  };
}
