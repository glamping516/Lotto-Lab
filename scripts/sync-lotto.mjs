import fs from "node:fs/promises";
import { expectedRound, normalizeOfficialRows, mergeDraws } from "./sync-core.mjs";
const file = new URL("../data/lotto.json", import.meta.url);
const existing = JSON.parse(await fs.readFile(file, "utf8"));
const latest = Math.max(...existing.map(d=>d.round));
const target = expectedRound();
if (latest >= target) {
  console.log(`Already current: ${latest}`);
} else {
  const incoming = [];
  for (let start = latest+1; start <= target; start += 50) {
    const url = new URL("https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do");
    url.searchParams.set("srchStrLtEpsd", String(start));
    url.searchParams.set("srchEndLtEpsd", String(Math.min(start+49,target)));
    let payload;
    for (let attempt=0; attempt<3; attempt++) {
      try {
        const response = await fetch(url, {signal:AbortSignal.timeout(15000)});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        payload = await response.json();
        break;
      } catch (error) {
        if (attempt===2) throw error;
        await new Promise(r=>setTimeout(r,1000*(attempt+1)));
      }
    }
    incoming.push(...normalizeOfficialRows(payload));
  }
  const merged = mergeDraws(existing, incoming, target);
  await fs.writeFile(new URL("../data/lotto.json.tmp", import.meta.url), JSON.stringify(merged,null,2)+"\n");
  await fs.rename(new URL("../data/lotto.json.tmp", import.meta.url),file);
  console.log(`Updated ${latest} → ${merged[0].round}`);
}
