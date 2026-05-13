import { BacktestSummary } from "@/lib/types";

type BacktestPanelProps = {
  results: BacktestSummary[];
};

export function BacktestPanel({ results }: BacktestPanelProps) {
  return (
    <section className="panel-gold p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-gold-300/80">Backtest</p>
      <h2 className="section-title mt-3">전략 백테스트</h2>
      <p className="section-copy mt-2 text-sm">
        과거 데이터만 사용해 다음 회차를 맞춰보는 전략 검증 화면입니다. 당첨 보장을 의미하지 않습니다.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {results.map((result) => (
          <div key={result.strategy} className="chart-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold-300/90">
              {result.strategy}
            </p>
            <p className="mt-3 text-sm text-white/65">테스트 수 {result.testsRun}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-black/20 p-3">
                <p className="text-white/45">평균 적중</p>
                <p className="mt-1 text-xl font-semibold text-gold-300">{result.averageHits}</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-3">
                <p className="text-white/45">최대 적중</p>
                <p className="mt-1 text-xl font-semibold text-gold-300">{result.maxHits}</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-3">
                <p className="text-white/45">3개 이상</p>
                <p className="mt-1 text-xl font-semibold text-gold-300">{result.hit3OrMore}</p>
              </div>
              <div className="rounded-2xl bg-black/20 p-3">
                <p className="text-white/45">4개 이상</p>
                <p className="mt-1 text-xl font-semibold text-gold-300">{result.hit4OrMore}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-white/60">
              {result.sample.slice(0, 3).map((sample) => (
                <div key={`${result.strategy}-${sample.round}`} className="rounded-xl bg-black/20 px-3 py-2">
                  {sample.round}회 · {sample.hits}개 적중
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
