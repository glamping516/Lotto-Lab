"use client";

import * as React from "react";

import { DashboardSnapshot } from "@/lib/types";

type StatsDashboardProps = {
  snapshots: Record<string, DashboardSnapshot>;
};

export function StatsDashboard({ snapshots }: StatsDashboardProps) {
  const [selected, setSelected] = React.useState<"50" | "100" | "all">("100");
  const snapshot = snapshots[selected];

  return (
    <section className="panel-gold p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold-300/80">Dashboard</p>
          <h2 className="section-title mt-3">통계 대시보드</h2>
          <p className="section-copy mt-2 text-sm">
            끝수, 보너스 번호, 연속번호 흐름만 간단하게 확인합니다.
          </p>
        </div>
        <div className="flex gap-2">
          {(["50", "100", "all"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`rounded-full border px-4 py-2 text-sm ${
                selected === key
                  ? "border-white/20 bg-black text-white"
                  : "border-white/10 bg-white/5 text-white/75"
              }`}
            >
              {key === "all" ? "전체" : `최근 ${key}회`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="chart-card grid gap-4">
          <div>
            <p className="text-sm font-semibold text-white/85">연속번호 출현</p>
            <p className="mt-2 text-sm text-white/65">
              연속번호 포함: {snapshot.consecutive.drawsWithConsecutive}회 / 미포함:{" "}
              {snapshot.consecutive.drawsWithoutConsecutive}회
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/85">끝수 분포</p>
            <div className="mt-3 grid grid-cols-5 gap-2 text-center">
              {snapshot.lastDigit.map((item) => (
                <div key={item.digit} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-white/50">{item.digit}끝</p>
                  <p className="mt-1 text-lg font-semibold text-gold-300">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/85">보너스 번호 빈도 상위 6</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/70">
              {snapshot.bonusFrequency
                .slice()
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((item) => (
                  <span key={item.number} className="rounded-full border border-white/10 px-3 py-1">
                    {item.number}번 {item.count}회
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
