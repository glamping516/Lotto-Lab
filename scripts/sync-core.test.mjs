import test from "node:test";
import assert from "node:assert/strict";
import { expectedRound, normalizeOfficialRows, mergeDraws } from "./sync-core.mjs";
test("KST Saturday draw boundary", () => {
  assert.equal(expectedRound(new Date("2026-09-26T11:59:59Z")), 1242);
  assert.equal(expectedRound(new Date("2026-09-27T00:00:00Z")), 1243);
});
test("reject duplicate/out-of-range official balls", () => {
  assert.throws(() => normalizeOfficialRows({data:{list:[{ltEpsd:1243,tm1WnNo:9,tm2WnNo:9}]}}));
  assert.throws(() => normalizeOfficialRows({}));
});
test("backfills every missing draw and is idempotent", () => {
  const existing = [{round:1}];
  const incoming = [{round:3},{round:2}];
  const merged = mergeDraws(existing, incoming, 3);
  assert.deepEqual(merged.map(d=>d.round), [3,2,1]);
  assert.deepEqual(mergeDraws(merged, incoming, 3), merged);
  assert.throws(() => mergeDraws(existing, [{round:3}], 3));
});
