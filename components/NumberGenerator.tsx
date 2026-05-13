"use client";

import { useEffect, useMemo, useState } from "react";

import { LottoBall } from "@/components/LottoBall";
import { StrategyKey } from "@/lib/types";

type ResultGame = {
  strategy: StrategyKey;
  numbers: number[];
  explanation: string;
};

const strategyOptions: Array<{
  value: StrategyKey;
  label: string;
  description: string;
}> = [
  { value: "random", label: "완전 랜덤", description: "1~45에서 균등하게 추출" },
  { value: "hot", label: "많이 나온 번호", description: "최근 자주 나온 번호에 가중치" },
  { value: "cold", label: "적게 나온 번호", description: "최근 덜 나온 번호에 가중치" },
  { value: "recentWeighted", label: "최근 N회 가중치", description: "최신 회차 반영 비중 강화" },
  { value: "overdue", label: "장기 미출현", description: "오래 안 나온 번호 우선 반영" },
  { value: "balanced", label: "균형 조합", description: "홀짝, 고저, 합계 밸런스 중심" },
  { value: "pairBased", label: "번호쌍 기반", description: "자주 같이 나온 조합 일부 반영" },
  { value: "anomalyWeighted", label: "이상징후 가중치", description: "통계 편차 신호 반영" },
  { value: "mixed", label: "혼합 전략", description: "여러 전략을 섞은 실험형 조합" }
];

const selectClassName =
  "mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none";

export function NumberGenerator() {
  const [strategy, setStrategy] = useState<StrategyKey>("mixed");
  const [count, setCount] = useState(5);
  const [recentWindow, setRecentWindow] = useState(100);
  const [pending, setPending] = useState(false);
  const [results, setResults] = useState<ResultGame[]>([]);
  const [revealed, setRevealed] = useState(0);

  const selectedStrategy = useMemo(
    () => strategyOptions.find((option) => option.value === strategy),
    [strategy]
  );

  useEffect(() => {
    if (!results.length) {
      return;
    }

    setRevealed(0);
    const timers = results.map((_, index) =>
      window.setTimeout(() => setRevealed(index + 1), 550 * (index + 1))
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [results]);

  async function handleGenerate() {
    setPending(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          strategy,
          count,
          recentWindow
        })
      });

      const payload = (await response.json()) as { games: ResultGame[] };
      setResults(payload.games);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="panel-gold overflow-hidden p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-gold-300/80">Generator</p>
        <h2 className="section-title mt-3">번호 조합 추출기</h2>
        <p className="section-copy mt-2 text-sm">
          전략을 선택한 뒤 여러 게임을 한 번에 생성합니다.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="chart-card">
            <span className="text-sm font-semibold text-white/85">추출 방식</span>
            <select
              value={strategy}
              onChange={(event) => setStrategy(event.target.value as StrategyKey)}
              className={selectClassName}
              style={{ colorScheme: "dark" }}
            >
              {strategyOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-black text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-white/55">{selectedStrategy?.description}</p>
          </label>

          <label className="chart-card">
            <span className="text-sm font-semibold text-white/85">게임 수</span>
            <select
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className={selectClassName}
              style={{ colorScheme: "dark" }}
            >
              {[1, 5, 10].map((value) => (
                <option key={value} value={value} className="bg-black text-white">
                  {value}게임
                </option>
              ))}
            </select>
          </label>

          <label className="chart-card md:col-span-2">
            <span className="text-sm font-semibold text-white/85">최근 가중치 범위</span>
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={recentWindow}
              onChange={(event) => setRecentWindow(Number(event.target.value))}
              className="mt-4 w-full accent-yellow-400"
            />
            <p className="mt-2 text-xs text-white/55">최근 {recentWindow}회를 기준으로 계산</p>
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="mt-6 rounded-full bg-gradient-to-r from-yellow-300 via-gold-300 to-amber-500 px-6 py-3 text-sm font-bold text-stone-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "번호 계산 중..." : "번호 뽑기"}
        </button>
      </div>

      <div className="mt-8 grid gap-4">
        {results.slice(0, revealed).map((game, index) => (
          <div key={`${game.numbers.join("-")}-${index}`} className="chart-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gold-300/80">
                  Game {index + 1}
                </p>
                <p className="mt-2 text-sm text-white/65">{game.explanation}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {game.numbers.map((number) => (
                  <LottoBall key={`${index}-${number}`} number={number} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
