import { AdSlot } from "@/components/AdSlot";
import { LabTabs } from "@/components/LabTabs";
import { LatestDrawCard } from "@/components/LatestDrawCard";
import { NumberGenerator } from "@/components/NumberGenerator";
import {
  buildStatsSnapshot,
  detectAnomalies,
  loadLottoData,
  runBacktest
} from "@/lib/lotto-analysis";

export default async function HomePage() {
  const data = await loadLottoData();
  const latest = data[0];
  const snapshots = {
    "50": buildStatsSnapshot(data, 50),
    "100": buildStatsSnapshot(data, 100),
    all: buildStatsSnapshot(data, "all")
  };
  const anomalyReport = detectAnomalies(data);
  const backtests = [
    runBacktest(data, "random"),
    runBacktest(data, "hot"),
    runBacktest(data, "overdue"),
    runBacktest(data, "balanced"),
    runBacktest(data, "mixed")
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <AdSlot title="상단 배너 광고 영역" envKey="NEXT_PUBLIC_AD_SLOT_TOP" />

      <section className="panel-gold relative overflow-hidden px-6 py-10 lg:px-10">
        <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-gold-300/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.45em] text-gold-300/80">Lotto Signal Lab</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            <span className="gold-text">Lotto Signal Lab</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            로또6/45 역대 당첨번호 통계 분석 · 이상징후 탐지 · 번호 조합 추출
          </p>
        </div>
      </section>

      {latest ? <LatestDrawCard draw={latest} /> : null}

      <NumberGenerator />

      <AdSlot title="본문 중간 광고 영역" envKey="NEXT_PUBLIC_AD_SLOT_MIDDLE" />

      <LabTabs snapshots={snapshots} anomalyReport={anomalyReport} backtests={backtests} />

      <AdSlot title="하단 광고 영역" envKey="NEXT_PUBLIC_AD_SLOT_BOTTOM" />

      <footer className="panel p-6 text-center text-sm text-white/60">
        본 서비스는 통계/오락 목적이며 당첨을 보장하지 않습니다. 동행복권과 무관한 개인 프로젝트입니다.
      </footer>
    </main>
  );
}
