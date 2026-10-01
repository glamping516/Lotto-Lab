import { DrawExperiment, TargetDraw } from "./repeat-draw";

// Keep both real loops off the UI thread. Only counters and final balls are sent.
const worker = self as unknown as {
  onmessage: ((event: MessageEvent<{targets:TargetDraw[]}>)=>void) | null;
  postMessage: (message:unknown)=>void;
};
worker.onmessage = event => {
  try {
    const experiment = new DrawExperiment(event.data.targets);
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
