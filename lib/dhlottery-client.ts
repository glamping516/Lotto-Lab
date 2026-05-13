import { LottoDraw } from "@/lib/types";
import { sortNumbers } from "@/lib/utils";
import { validateDraw } from "@/lib/validators";

const JSON_ENDPOINT =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";
const RESULT_PAGE = "https://www.dhlottery.co.kr/lt645/result";

type LottoApiResponse = {
  returnValue?: string;
  drwNo?: number;
  drwtNo1?: number;
  drwtNo2?: number;
  drwtNo3?: number;
  drwtNo4?: number;
  drwtNo5?: number;
  drwtNo6?: number;
  bnusNo?: number;
};

async function fetchWithRetry(url: string, init?: RequestInit, retries = 3) {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        next: { revalidate: 0 }
      });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("외부 요청 실패");
}

function mapResponseToDraw(payload: LottoApiResponse): LottoDraw | null {
  if (payload.returnValue !== "success" || !payload.drwNo || !payload.bnusNo) {
    return null;
  }

  const numbers = sortNumbers([
    Number(payload.drwtNo1),
    Number(payload.drwtNo2),
    Number(payload.drwtNo3),
    Number(payload.drwtNo4),
    Number(payload.drwtNo5),
    Number(payload.drwtNo6)
  ]);

  const draw: LottoDraw = {
    round: Number(payload.drwNo),
    numbers: numbers as LottoDraw["numbers"],
    bonus: Number(payload.bnusNo),
    source: "dhlottery",
    updatedAt: new Date().toISOString()
  };

  validateDraw(draw);
  return draw;
}

export async function fetchDrawByRound(round: number) {
  const response = await fetchWithRetry(`${JSON_ENDPOINT}${round}`);
  const payload = (await response.json()) as LottoApiResponse;
  return mapResponseToDraw(payload);
}

async function scrapeLatestRoundHint() {
  const response = await fetchWithRetry(RESULT_PAGE, undefined, 2);
  const html = await response.text();
  const match = html.match(/(\d+)\s*회/);
  return match ? Number(match[1]) : null;
}

export async function fetchLatestAvailableDraw(currentLatestRound?: number) {
  const probeStart = currentLatestRound ? currentLatestRound + 1 : null;

  if (probeStart) {
    for (let round = probeStart; round <= probeStart + 3; round += 1) {
      const draw = await fetchDrawByRound(round).catch(() => null);
      if (draw) {
        return draw;
      }
    }
  }

  const latestHint = await scrapeLatestRoundHint().catch(() => null);
  if (latestHint) {
    return fetchDrawByRound(latestHint);
  }

  return null;
}
