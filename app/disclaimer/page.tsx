export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="panel-gold p-6">
        <h1 className="section-title">면책 문구</h1>
        <div className="mt-4 space-y-4 text-sm leading-7 text-white/70">
          <p>본 서비스는 통계 분석, 패턴 실험, 번호 조합 추출을 위한 개인 프로젝트입니다.</p>
          <p>어떠한 결과도 당첨을 보장하지 않으며, 조작을 단정하거나 확정하는 표현을 사용하지 않습니다.</p>
          <p>표시되는 이상징후, p-value, 빈도 편차 등은 탐색적 통계 해석이며 반복 검정으로 인해 우연히 낮은 수치가 나타날 수 있습니다.</p>
          <p>본 서비스는 동행복권과 무관하며 공식 로고, 상표 이미지를 사용하지 않습니다.</p>
        </div>
      </section>
    </main>
  );
}
