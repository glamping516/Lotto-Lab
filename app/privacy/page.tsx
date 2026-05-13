export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="panel-gold p-6">
        <h1 className="section-title">개인정보처리방침</h1>
        <div className="mt-4 space-y-4 text-sm leading-7 text-white/70">
          <p>본 서비스는 통계/오락 목적의 개인 프로젝트입니다.</p>
          <p>기본적으로 회원가입 기능을 제공하지 않으며, 서버는 필수 운영 로그 외의 민감한 개인정보를 수집하지 않도록 설계합니다.</p>
          <p>광고 또는 트래픽 분석 도구가 연동될 경우, 해당 도구의 정책에 따라 쿠키 또는 익명화된 식별자가 처리될 수 있습니다.</p>
          <p>문의가 필요한 경우 운영자는 추후 별도 연락 수단을 공개할 수 있습니다.</p>
        </div>
      </section>
    </main>
  );
}
