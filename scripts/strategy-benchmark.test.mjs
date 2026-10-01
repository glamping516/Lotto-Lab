import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createWeightedSampler,prepareStrategy,createStrategySampler,meetsBalance,strategyKeys} from "../lib/strategy-sampler.ts";
const data=JSON.parse(fs.readFileSync(new URL("../data/lotto.json",import.meta.url),"utf8"));
const report=JSON.parse(fs.readFileSync(new URL("../data/strategy-benchmark.json",import.meta.url),"utf8"));
const policy=JSON.parse(fs.readFileSync(new URL("../data/draw-policy.json",import.meta.url),"utf8"));
function seeded(){let state=12345;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
test("all 900 saved trials match the benchmark's actual 200-draw snapshot; policy selects lowest mean",()=>{
  // The snapshot can age as weekly data grows; verify the retained benchmark round.
  const snapshot=data.filter(d=>d.round<=report.dataRound).slice(0,200);
  assert.equal(snapshot.length,200);
  assert.equal(report.results.length,9);
  assert.deepEqual(new Set(report.results.map(r=>r.strategy)),new Set(strategyKeys));
  let trials=0;
  for(const result of report.results){
    assert.equal(result.trials.length,100);
    let total=0;
    for(const trial of result.trials){
      assert.ok(Number.isSafeInteger(trial.attempts)&&trial.attempts>0);
      assert.ok(trial.matchedRounds.length>0);
      for(const round of trial.matchedRounds){
        assert.deepEqual(snapshot.find(d=>d.round===round)?.numbers,trial.matchedNumbers);
      }
      total+=trial.attempts;trials++;
    }
    assert.equal(total,result.totalAttempts);
    assert.equal(total/100,result.meanAttempts);
  }
  assert.equal(trials,900);
  assert.equal(policy.strategy,report.results.reduce((a,b)=>a.meanAttempts<b.meanAttempts?a:b).strategy);
  assert.equal(policy.targetWindow,200);
  assert.equal(policy.analysisWindow,200);
});
test("alias sampler follows weights and emits six distinct valid balls",()=>{
  const weights=Array(45).fill(1);weights[0]=100;
  const draw=createWeightedSampler(weights,null,seeded(),false);
  let first=0;
  for(let i=0;i<30000;i++){
    const numbers=draw();first+=numbers[0]===1?1:0;
    assert.equal(new Set(numbers).size,6);
    assert.ok(numbers.every(n=>n>=1&&n<=45));
  }
  assert.ok(Math.abs(first/30000-100/144)<.015);
});
test("existing mixed single-game and hot weights are equivalent; balanced emits only accepted candidates",()=>{
  assert.deepEqual(prepareStrategy(data,"mixed",200).weights,prepareStrategy(data,"hot",200).weights);
  const bounds=prepareStrategy(data,"balanced").bounds;
  const draw=createStrategySampler(data,"balanced",200,seeded());
  for(let i=0;i<1000;i++) assert.ok(meetsBalance(draw(),bounds));
});
