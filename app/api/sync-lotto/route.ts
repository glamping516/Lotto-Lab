import { promises as fs } from "fs";

import { NextRequest, NextResponse } from "next/server";

import { fetchLatestAvailableDraw } from "@/lib/dhlottery-client";
import { insertDrawIntoSheet } from "@/lib/google-sheets";
import {
  getJsonPath,
  getLatestDraw,
  loadLottoData,
  loadSyncLogs,
  upsertLatestDraw,
  writeSyncLog
} from "@/lib/lotto-data";
import { LottoDraw } from "@/lib/types";
import { sortNumbers } from "@/lib/utils";
import { validateDraw } from "@/lib/validators";

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return false;
  }
  const querySecret = request.nextUrl.searchParams.get("secret");
  const headerSecret = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  return [querySecret, headerSecret, bearerSecret].includes(expected);
}

async function logAndRespond(
  entry: Parameters<typeof writeSyncLog>[0],
  init?: ResponseInit,
  extra?: Record<string, unknown>
) {
  const logs = await writeSyncLog(entry);
  return NextResponse.json(
    {
      ...extra,
      log: entry,
      logs
    },
    init
  );
}

function normalizeManualDraw(input: {
  round: number;
  numbers: number[];
  bonus: number;
}): LottoDraw {
  const numbers = sortNumbers(input.numbers.map((value) => Number(value)));
  const draw: LottoDraw = {
    round: Number(input.round),
    numbers: numbers as LottoDraw["numbers"],
    bonus: Number(input.bonus),
    source: "admin-manual",
    updatedAt: new Date().toISOString()
  };
  validateDraw(draw);
  return draw;
}

async function performSync() {
  const latest = await getLatestDraw();
  const remote = await fetchLatestAvailableDraw(latest?.round);

  if (!remote) {
    return logAndRespond(
      {
        timestamp: new Date().toISOString(),
        status: "skipped",
        message: "공식 최신 회차를 확인하지 못했습니다."
      },
      undefined,
      { ok: false }
    );
  }

  if (latest && remote.round <= latest.round) {
    return logAndRespond(
      {
        timestamp: new Date().toISOString(),
        status: "skipped",
        round: remote.round,
        message: "이미 최신 회차가 반영되어 있습니다."
      },
      undefined,
      { ok: true, inserted: false, latest: remote }
    );
  }

  const result = await upsertLatestDraw(remote);
  const sheet = await insertDrawIntoSheet(remote);

  return logAndRespond(
    {
      timestamp: new Date().toISOString(),
      status: "success",
      round: remote.round,
      message: "신규 회차를 동기화했습니다.",
      details: {
        inserted: result.inserted,
        sheet
      }
    },
    undefined,
    { ok: true, inserted: result.inserted, latest: remote, sheet }
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (request.nextUrl.searchParams.get("download") === "1") {
    const raw = await fs.readFile(getJsonPath(), "utf8");
    return new NextResponse(raw, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="lotto.json"'
      }
    });
  }

  if (request.nextUrl.searchParams.get("logs") === "1") {
    return NextResponse.json({
      ok: true,
      logs: await loadSyncLogs()
    });
  }

  return performSync();
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    mode?: "sync" | "manual" | "sheetTest";
    draw?: {
      round: number;
      numbers: number[];
      bonus: number;
    };
  };

  if (body.mode === "manual" && body.draw) {
    try {
      const draw = normalizeManualDraw(body.draw);
      const result = await upsertLatestDraw(draw);
      const sheet = await insertDrawIntoSheet(draw);
      return logAndRespond(
        {
          timestamp: new Date().toISOString(),
          status: "success",
          round: draw.round,
          message: "관리자 수동 입력 회차를 저장했습니다.",
          details: { inserted: result.inserted, sheet }
        },
        undefined,
        { ok: true, inserted: result.inserted, draw, sheet }
      );
    } catch (error) {
      return logAndRespond(
        {
          timestamp: new Date().toISOString(),
          status: "error",
          message: error instanceof Error ? error.message : "수동 입력 저장 실패"
        },
        { status: 400 },
        { ok: false }
      );
    }
  }

  if (body.mode === "sheetTest") {
    const latest = await getLatestDraw();
    if (!latest) {
      return NextResponse.json({ ok: false, message: "최신 회차 데이터가 없습니다." }, { status: 400 });
    }
    const sheet = await insertDrawIntoSheet(latest);
    return logAndRespond(
      {
        timestamp: new Date().toISOString(),
        status: sheet.ok ? "success" : "skipped",
        round: latest.round,
        message: sheet.message
      },
      undefined,
      { ok: sheet.ok, sheet }
    );
  }

  return performSync();
}
