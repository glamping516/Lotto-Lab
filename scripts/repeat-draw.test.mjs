import test from "node:test";
import assert from "node:assert/strict";
import { DrawExperiment, createUniformDraw } from "../lib/repeat-draw.ts";
const target={round:1243,numbers:[9,18,24,38,43,44]};
test("exact six balls match, then exactly n fresh draws returning only the last",()=>{
  const miss=[1,2,3,4,5,6];
  const final=[7,8,9,10,11,12];
  const queue=[miss,[9,18,24,38,43,45],target.numbers,miss,miss,final];
  let calls=0;
  const experiment=new DrawExperiment([target],()=>{calls++;return queue.shift();});
  assert.throws(()=>experiment.startReplay());
  const matched=experiment.step(100);
  assert.equal(matched.attempts,3);
  assert.equal(calls,3);
  assert.deepEqual(matched.matchedRounds,[1243]);
  experiment.startReplay();
  const result=experiment.step(100);
  assert.equal(result.phase,"complete");
  assert.equal(result.repeated,3);
  assert.equal(calls,6);
  assert.deepEqual(result.finalNumbers,final);
  experiment.step(100);
  assert.equal(calls,6);
});
test("duplicates count once for probability and preserve matching rounds; order irrelevant",()=>{
  const experiment=new DrawExperiment([target,{...target,round:1200}],()=>[44,43,38,24,18,9]);
  assert.equal(experiment.targets.size,1);
  assert.deepEqual(experiment.step().matchedRounds,[1243,1200]);
  assert.equal(experiment.state.attempts,1);
  experiment.startReplay();
  assert.equal(experiment.step().repeated,1);
});
test("search continues across batches without fabricated count",()=>{
  let calls=0;
  const experiment=new DrawExperiment([target],()=>++calls===7?target.numbers:[1,2,3,4,5,6]);
  assert.equal(experiment.step(3).attempts,3);
  assert.equal(experiment.step(3).phase,"search");
  assert.equal(experiment.step(3).attempts,7);
});
test("reject empty and invalid targets; uniform draws are six unique sorted balls",()=>{
  assert.throws(()=>new DrawExperiment([]));
  assert.throws(()=>new DrawExperiment([{round:1,numbers:[1,1,2,3,4,5]}]));
  const draw=createUniformDraw();
  for(let i=0;i<1000;i++){
    const numbers=draw();
    assert.equal(new Set(numbers).size,6);
    assert.ok(numbers.every(n=>Number.isInteger(n)&&n>=1&&n<=45));
    assert.deepEqual(numbers,[...numbers].sort((a,b)=>a-b));
  }
});
