"use client";

import { useState } from "react";

import { AnomalyPanel } from "@/components/AnomalyPanel";
import { BacktestPanel } from "@/components/BacktestPanel";
import { StatsDashboard } from "@/components/StatsDashboard";
import { AnomalyReport, BacktestSummary, DashboardSnapshot } from "@/lib/types";

type LabTabsProps = {
  snapshots: Record<string, DashboardSnapshot>;
  anomalyReport: AnomalyReport;
  backtests: BacktestSummary[];
};

export function LabTabs({ snapshots, anomalyReport, backtests }: LabTabsProps) {
  const [tab, setTab] = useState<"stats" | "anomaly" | "backtest">("stats");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["stats", "통계 대시보드"],
          ["anomaly", "이상징후 탐지"],
          ["backtest", "패턴 실험"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as typeof tab)}
            className={`rounded-full border px-4 py-2 text-sm ${
              tab === value
                ? "border-white/20 bg-black text-white"
                : "border-white/10 bg-white/5 text-white/75"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "stats" ? <StatsDashboard snapshots={snapshots} /> : null}
      {tab === "anomaly" ? <AnomalyPanel report={anomalyReport} /> : null}
      {tab === "backtest" ? <BacktestPanel results={backtests} /> : null}
    </div>
  );
}
