"use client";

import { useState, useTransition } from "react";

import { LottoDraw, SyncLogEntry } from "@/lib/types";

type AdminConsoleProps = {
  latest: LottoDraw | null;
  logs: SyncLogEntry[];
  secret: string;
  hasSheetId: boolean;
};

export function AdminConsole({
  latest,
  logs,
  secret,
  hasSheetId
}: AdminConsoleProps) {
  const [manualRound, setManualRound] = useState("");
  const [manualNumbers, setManualNumbers] = useState("");
  const [manualBonus, setManualBonus] = useState("");
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  async function callSync(body: Record<string, unknown>) {
    const response = await fetch(`/api/sync-lotto?secret=${encodeURIComponent(secret)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": secret
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    setStatus(JSON.stringify(payload, null, 2));
  }

  return (
    <div className="grid gap-6">
      <section className="panel-gold p-6">
        <h1 className="section-title">관리자 콘솔</h1>
        <p className="mt-2 text-sm text-white/60">
          최신 회차: {latest ? `${latest.round}회` : "없음"} / Sheets 상태:{" "}
          {hasSheetId ? "원본 spreadsheetId 설정됨" : "원본 spreadsheetId 필요"}
        </p>
      </section>

      <section className="panel-gold p-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                void callSync({ mode: "sync" });
              })
            }
            className="rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-stone-900"
          >
            수동 동기화
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                void callSync({ mode: "sheetTest" });
              })
            }
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80"
          >
            Google Sheets 동기화 테스트
          </button>
          <a
            href={`/api/sync-lotto?secret=${encodeURIComponent(secret)}&download=1`}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80"
          >
            lotto.json 다운로드
          </a>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <input
            value={manualRound}
            onChange={(event) => setManualRound(event.target.value)}
            placeholder="회차"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
          />
          <input
            value={manualBonus}
            onChange={(event) => setManualBonus(event.target.value)}
            placeholder="보너스"
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"
          />
          <textarea
            value={manualNumbers}
            onChange={(event) => setManualNumbers(event.target.value)}
            placeholder="당첨번호 6개를 쉼표로 입력"
            className="min-h-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm lg:col-span-2"
          />
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              const numbers = manualNumbers
                .split(",")
                .map((item) => Number(item.trim()))
                .filter(Boolean);
              void callSync({
                mode: "manual",
                draw: {
                  round: Number(manualRound),
                  numbers,
                  bonus: Number(manualBonus)
                }
              });
            })
          }
          className="mt-4 rounded-full border border-gold-300/30 bg-gold-300/10 px-5 py-3 text-sm font-semibold text-gold-200"
        >
          특정 회차 직접 입력
        </button>

        <pre className="mt-6 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
          {status || "실행 결과가 여기에 표시됩니다."}
        </pre>
      </section>

      <section className="panel-gold p-6">
        <h2 className="text-lg font-semibold text-white/90">최근 동기화 로그</h2>
        <div className="mt-4 space-y-3">
          {logs.map((log) => (
            <div key={`${log.timestamp}-${log.message}`} className="rounded-2xl bg-black/20 p-4 text-sm text-white/70">
              <p className="font-semibold text-white/85">
                [{log.status}] {log.message}
              </p>
              <p className="mt-1 text-xs text-white/45">{log.timestamp}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
