import { LabTabs } from "@/components/LabTabs";
import { LatestDrawCard } from "@/components/LatestDrawCard";
import { NumberGenerator } from "@/components/NumberGenerator";
import {
  buildStatsSnapshot,
  detectAnomalies,
  loadLottoData,
  runBacktest
} from "@/lib/lotto-analysis";

export const dynamic = "force-dynamic";

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
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="/"><span className="brand-mark">6</span>LOTTO LAB</a>
        <nav aria-label="주 메뉴"><a href="#studio">추첨 스튜디오</a><a href="#analysis">데이터 분석</a></nav>
      </header>
      <section className="hero">
        <div>
          <p className="eyebrow">A LITTLE CHANCE, A NEW POSSIBILITY</p>
          <h1>여섯 개의 숫자.<br/>새로운 가능성.</h1>
          <p className="section-copy">차분하게 살펴보고, 나만의 행운을 추첨하세요.</p>
        </div>
        <p className="hero-note">OFFICIAL DRAW DATA<br/>매주 일요일 09:00 · 한국시간 갱신</p>
      </section>
      <NumberGenerator />
      {latest ? <LatestDrawCard draw={latest} /> : null}
      <div id="analysis" className="analysis-heading"><div><p className="eyebrow">02 / THE NUMBERS BEHIND</p><h2>숫자에 담긴 흐름</h2></div><span className="section-copy">{data.length.toLocaleString()}개 회차 분석</span></div>
      <LabTabs snapshots={snapshots} anomalyReport={anomalyReport} backtests={backtests} />
      <footer className="site-footer">
        <span>LOTTO LAB · 작은 가능성을 위한 공간</span>
        <span>통계·오락 목적의 서비스입니다. 모든 조합의 당첨 확률은 동일하며, 당첨을 보장하지 않습니다.<br/>동행복권과 무관한 개인 프로젝트입니다.</span>
        <a href="/privacy">개인정보 처리방침</a>
      </footer>
    </main>
  );
}
