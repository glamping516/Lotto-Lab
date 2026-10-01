export type TargetDraw = {round: number; numbers: number[]};
export type ExperimentState = {
  phase: "search" | "matched" | "replay" | "complete";
  attempts: number;
  repeated: number;
  matchedNumbers: number[];
  matchedRounds: number[];
  finalNumbers: number[];
};

// Cache crypto samples to avoid a separate browser call for every ball.
export function createUniformDraw() {
  const buffer = new Uint32Array(4096);
  let cursor = buffer.length;
  const bound = Math.floor(0x100000000 / 45) * 45;
  function integer() {
    let sample: number;
    do {
      if (cursor === buffer.length) { crypto.getRandomValues(buffer); cursor = 0; }
      sample = buffer[cursor++];
    } while (sample >= bound);
    return sample % 45 + 1;
  }
  return () => {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const value = integer();
      if (!numbers.includes(value)) numbers.push(value);
    }
    return numbers.sort((a,b) => a-b);
  };
}

export function combinationKey(numbers: number[]) {
  return [...numbers].sort((a,b)=>a-b).join(",");
}

export class DrawExperiment {
  state: ExperimentState = {phase:"search",attempts:0,repeated:0,matchedNumbers:[],matchedRounds:[],finalNumbers:[]};
  targets = new Map<string,number[]>();
  draw: () => number[];
  constructor(targets: TargetDraw[], draw = createUniformDraw()) {
    if (!targets.length || targets.length > 100) throw new Error("최근 100회 이내 데이터가 필요합니다.");
    targets.forEach(target => {
      if (!Number.isInteger(target.round) || target.round < 1 || target.numbers.length !== 6 ||
        new Set(target.numbers).size !== 6 || target.numbers.some(n=>!Number.isInteger(n)||n<1||n>45)) {
        throw new Error("비교할 당첨번호가 올바르지 않습니다.");
      }
      const key=combinationKey(target.numbers);
      this.targets.set(key,[...(this.targets.get(key)??[]),target.round]);
    });
    this.draw = draw;
  }
  step(batchSize = 2000) {
    for (let i=0; i<batchSize; i++) {
      if (this.state.phase === "search") {
        if (this.state.attempts === Number.MAX_SAFE_INTEGER) throw new Error("계산 범위를 초과했습니다.");
        const numbers=this.draw();
        this.state.attempts++;
        const rounds=this.targets.get(combinationKey(numbers));
        if (rounds) {
          this.state.matchedNumbers=[...numbers];
          this.state.matchedRounds=[...rounds];
          this.state.phase="matched";
          break;
        }
      } else if (this.state.phase === "replay") {
        const numbers=this.draw();
        this.state.repeated++;
        if (this.state.repeated === this.state.attempts) {
          this.state.finalNumbers=[...numbers];
          this.state.phase="complete";
          break;
        }
      } else break;
    }
    return {...this.state};
  }
  startReplay() {
    if (this.state.phase !== "matched") throw new Error("과거 당첨 조합 일치 후 다시 추첨할 수 있습니다.");
    this.state.phase="replay";
  }
}
