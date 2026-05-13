import { AdminConsole } from "@/components/AdminConsole";
import { getLatestDraw, loadSyncLogs } from "@/lib/lotto-data";

type AdminPageProps = {
  searchParams: Promise<{ secret?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const secret = params.secret ?? "";
  const valid = !!process.env.CRON_SECRET && secret === process.env.CRON_SECRET;

  if (!valid) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="panel-gold p-6">
          <h1 className="section-title">관리자 페이지</h1>
          <p className="mt-4 text-sm text-white/70">
            `?secret=CRON_SECRET` 쿼리로 접근해야 합니다. 서버에서 검증하며, 일치하지 않으면 기능을 노출하지 않습니다.
          </p>
        </section>
      </main>
    );
  }

  const latest = await getLatestDraw();
  const logs = await loadSyncLogs();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <AdminConsole
        latest={latest}
        logs={logs}
        secret={secret}
        hasSheetId={Boolean(process.env.GOOGLE_SHEET_ID)}
      />
    </main>
  );
}
