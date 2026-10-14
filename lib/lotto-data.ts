import { promises as fs } from "fs";
import path from "path";
import * as XLSX from "xlsx";

import { LottoDraw, SyncLogEntry } from "@/lib/types";
import { validateDraw } from "@/lib/validators";

const DATA_DIR = path.join(process.cwd(), "data");
const JSON_PATH = path.join(DATA_DIR, "lotto.json");
const XLSX_PATH = path.join(DATA_DIR, "lotto.xlsx");
const LOG_PATH = path.join(DATA_DIR, "sync-log.json");

type RawRow = {
  회차?: number | string;
  번호1?: number | string;
  번호2?: number | string;
  번호3?: number | string;
  번호4?: number | string;
  번호5?: number | string;
  번호6?: number | string;
  보너스?: number | string;
};

function toInt(value: number | string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

export async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function convertXlsxToJson() {
  const workbook = XLSX.readFile(XLSX_PATH);
  const sheetName = workbook.SheetNames.includes("Lotto")
    ? "Lotto"
    : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(worksheet, { defval: "" });

  const data = rows
    .map((row) => ({
      round: toInt(row.회차),
      numbers: [
        toInt(row.번호1),
        toInt(row.번호2),
        toInt(row.번호3),
        toInt(row.번호4),
        toInt(row.번호5),
        toInt(row.번호6)
      ] as LottoDraw["numbers"],
      bonus: toInt(row.보너스),
      source: "xlsx",
      updatedAt: new Date().toISOString()
    }))
    .filter((draw) => draw.round > 0);

  for (const draw of data) {
    validateDraw(draw);
  }

  const sorted = data.sort((a, b) => b.round - a.round);
  await saveLottoData(sorted);
  return sorted;
}

export async function loadLottoData() {
  let local: LottoDraw[];
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    local = JSON.parse(raw) as LottoDraw[];
  } catch {
    local = await convertXlsxToJson();
  }
  local.sort((a,b)=>b.round-a.round);
  // Read the durable weekly update without depending on a redeploy.
  if (process.env.VERCEL || process.env.LOTTO_DATA_URL) {
    try {
      const response = await fetch(process.env.LOTTO_DATA_URL ??
        "https://raw.githubusercontent.com/glamping516/Lotto-Lab/main/data/lotto.json",
        { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error("데이터 조회 실패");
      const remote = await response.json() as LottoDraw[];
      if (!Array.isArray(remote) || !remote.length) throw new Error("빈 데이터");
      remote.forEach(validateDraw);
      remote.sort((a,b)=>b.round-a.round);
      if (remote[0].round >= (local[0]?.round ?? 0)) return remote;
    } catch (error) {
      console.warn("Using bundled lotto data:", error instanceof Error ? error.message : error);
    }
  }
  return local;
}

export async function saveLottoData(data: LottoDraw[]) {
  await ensureDataDir();
  const sorted = [...data].sort((a, b) => b.round - a.round);
  await fs.writeFile(JSON_PATH, JSON.stringify(sorted, null, 2), "utf8");
}

export async function getLatestDraw() {
  const data = await loadLottoData();
  return data[0] ?? null;
}

export async function upsertLatestDraw(draw: LottoDraw) {
  validateDraw(draw);
  const data = await loadLottoData();
  const exists = data.some((item) => item.round === draw.round);

  if (exists) {
    return { inserted: false, data };
  }

  const next = [{ ...draw, updatedAt: new Date().toISOString() }, ...data].sort(
    (a, b) => b.round - a.round
  );
  await saveLottoData(next);
  return { inserted: true, data: next };
}

export async function loadSyncLogs() {
  try {
    const raw = await fs.readFile(LOG_PATH, "utf8");
    return JSON.parse(raw) as SyncLogEntry[];
  } catch {
    return [];
  }
}

export async function writeSyncLog(entry: SyncLogEntry) {
  const logs = await loadSyncLogs();
  const next = [entry, ...logs].slice(0, 50);
  await fs.writeFile(LOG_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function getJsonPath() {
  return JSON_PATH;
}

export function getWorkbookPath() {
  return XLSX_PATH;
}
