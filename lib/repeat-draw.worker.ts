import { DrawExperiment, TargetDraw, createCryptoRandom } from "./repeat-draw";
import { createStrategySampler } from "./strategy-sampler";
import type { StrategyKey } from "./types";

// Keep both real loops off the UI thread. Only counters and final balls are sent.
const worker = self as unknown as {
  onmessage: ((event: MessageEvent<{targets:TargetDraw[];training:{numbers:number[]}[];policy:{strategy:StrategyKey;analysisWindow:number}}>)=>void) | null;
  postMessage: (message:unknown)=>void;
};
worker.onmessage = event => {
  try {
    const {targets,training,policy}=event.data;
    const draw=createStrategySampler(training,policy.strategy,policy.analysisWindow,createCryptoRandom());
    const experiment = new DrawExperiment(targets,draw);
    const run = () => {
      try {
        const state=experiment.step();
        worker.postMessage({type:"progress",...state});
        if (state.phase === "matched") {
          setTimeout(()=>{experiment.startReplay();run();},1800);
        } else if (state.phase !== "complete") {
          setTimeout(run,0);
        }
      } catch (error) {
        worker.postMessage({type:"error",message:error instanceof Error?error.message:"반복 추첨 실패"});
      }
    };
    run();
  } catch(error) {
    worker.postMessage({type:"error",message:error instanceof Error?error.message:"반복 추첨 실패"});
  }
};
