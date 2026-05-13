import { AnomalyReport } from "@/lib/types";

type AnomalyPanelProps = {
  report: AnomalyReport;
};

function getChiSquareSummary(pValue: number) {
  if (pValue < 0.05) {
    return "전체 흐름이 평소보다 조금 튀는 편입니다.";
  }
  if (pValue < 0.2) {
    return "약한 편차는 보이지만 큰 이상으로 보긴 어렵습니다.";
  }
  return "전체 번호 흐름은 전반적으로 안정적인 편입니다.";
}

function describeDelta(observed: number, expected: number) {
  if (observed > expected) {
    return "평균보다 조금 더 나온 편";
  }
  if (observed < expected) {
    return "평균보다 조금 덜 나온 편";
  }
  return "평균과 비슷한 편";
}

export function AnomalyPanel({ report }: AnomalyPanelProps) {
  return (
    <section className="panel-gold p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-gold-300/80">Anomaly Signals</p>
      <h2 className="section-title mt-3">이상징후 탐지</h2>
      <p className="section-copy mt-2 text-sm">
        어려운 통계 용어보다, 지금 보이는 흐름이 평소와 얼마나 다른지만 짧게 정리합니다.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="chart-card">
          <p className="text-sm font-semibold text-white/85">카이제곱 검정</p>
          <p className="mt-3 text-2xl font-semibold text-gold-300">{report.chiSquare.statistic}</p>
          <p className="mt-2 text-sm text-white/70">{getChiSquareSummary(report.chiSquare.approximatePValue)}</p>
          <p className="mt-3 text-xs text-white/45">
            p-value {report.chiSquare.approximatePValue} / df {report.chiSquare.degreesOfFreedom}
          </p>
          <p className="mt-1 text-xs text-white/45">{report.chiSquare.note}</p>
        </div>

        <div className="chart-card">
          <p className="text-sm font-semibold text-white/85">연속번호 신호</p>
          <p className="mt-3 text-sm text-white/70">
            실제 비율 {Math.round(report.consecutiveSignal.actualShare * 100)}% / 비교 기준{" "}
            {Math.round(report.consecutiveSignal.expectedShare * 100)}%
          </p>
          <p className="mt-2 text-sm text-white/60">
            {report.consecutiveSignal.overRepresented
              ? "연속번호가 평소보다 약간 자주 보입니다."
              : "연속번호는 평소 범위에서 크게 벗어나지 않았습니다."}
          </p>
        </div>

        <div className="chart-card">
          <p className="text-sm font-semibold text-white/85">빈도 편차 상위 번호</p>
          <div className="mt-3 space-y-2 text-sm">
            {report.expectedVsObserved.slice(0, 8).map((item) => (
              <div key={item.number} className="rounded-xl bg-black/20 px-3 py-2 text-white/70">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-white">{item.number}번</span>
                  <span>{describeDelta(item.observed, item.expected)}</span>
                </div>
                <p className="mt-1 text-xs text-white/45">
                  실제 {item.observed}회 / 평균 약 {item.expected.toFixed(1)}회 / z {item.zScore}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <p className="text-sm font-semibold text-white/85">장기 미출현 번호</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {report.overdueHighlights.map((item) => (
              <span key={item.number} className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70">
                {item.number}번 · 최근 {item.overdueBy}회 미출현
              </span>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <p className="text-sm font-semibold text-white/85">번호쌍 상위</p>
          <div className="mt-3 grid gap-2 text-sm">
            {report.topPairs.slice(0, 6).map((item) => (
              <div key={item.key} className="rounded-xl bg-black/20 px-3 py-2 text-white/70">
                {item.key} · 함께 나온 횟수 {item.count}회
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <p className="text-sm font-semibold text-white/85">번호삼쌍 상위</p>
          <div className="mt-3 grid gap-2 text-sm">
            {report.topTriples.slice(0, 6).map((item) => (
              <div key={item.key} className="rounded-xl bg-black/20 px-3 py-2 text-white/70">
                {item.key} · 함께 나온 횟수 {item.count}회
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
