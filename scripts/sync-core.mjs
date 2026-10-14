export function expectedRound(now = new Date()) {
  return Math.floor((now.getTime() - Date.parse("2002-12-07T12:00:00Z")) / 604800000) + 1;
}

export function normalizeOfficialRows(payload) {
  if (!Array.isArray(payload?.data?.list)) throw new Error("공식 API 응답 형식이 변경되었습니다.");
  return payload.data.list.map(row => {
    const draw = {
      round: Number(row.ltEpsd),
      numbers: Array.from({length: 6}, (_, i) => Number(row[`tm${i + 1}WnNo`])).sort((a,b) => a-b),
      bonus: Number(row.bnsWnNo),
      source: "dhlottery",
      updatedAt: new Date().toISOString()
    };
    if (!Number.isInteger(draw.round) || draw.round < 1 ||
      new Set([...draw.numbers, draw.bonus]).size !== 7 ||
      [...draw.numbers, draw.bonus].some(n => !Number.isInteger(n) || n < 1 || n > 45)) {
      throw new Error("공식 당첨번호 검증 실패");
    }
    return draw;
  });
}

export function mergeDraws(existing, incoming, target) {
  const map = new Map(existing.map(d => [d.round, d]));
  for (const draw of incoming) if (!map.has(draw.round)) map.set(draw.round, draw);
  const first = Math.min(...existing.map(d => d.round));
  for (let round = first; round <= target; round++) {
    if (!map.has(round)) throw new Error(`${round}회 데이터 누락: 기존 데이터 유지`);
  }
  return [...map.values()].sort((a,b) => b.round-a.round);
}
