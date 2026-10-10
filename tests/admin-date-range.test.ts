import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdminDateRange } from "../src/lib/admin/date-range";

test("admin date presets resolve to bounded Shanghai dates", () => {
  const today = resolveAdminDateRange({ range: "today" });
  assert.equal(today.label, "今天");
  assert.equal(today.startDate, today.endDate);

  const week = resolveAdminDateRange({ range: "week" });
  const month = resolveAdminDateRange({ range: "month" });
  const ninetyDays = resolveAdminDateRange({ range: "90days" });
  for (const range of [week, month, ninetyDays]) {
    assert.ok(range.startDate && range.endDate);
    assert.equal(range.endDate, today.endDate);
  }
  const start = new Date(`${ninetyDays.startDate}T00:00:00Z`);
  const end = new Date(`${ninetyDays.endDate}T00:00:00Z`);
  assert.equal((end.getTime() - start.getTime()) / 86_400_000 + 1, 90);
});

test("custom range requires valid complete dates", () => {
  const valid = resolveAdminDateRange({ range: "custom", from: "2026-09-01", to: "2026-09-30" });
  assert.equal(valid.preset, "custom");
  assert.equal(valid.startDate, "2026-09-01");
  assert.equal(valid.endDate, "2026-09-30");

  for (const invalid of [
    { range: "custom" },
    { range: "custom", from: "2026-02-31", to: "2026-03-01" },
    { range: "custom", from: "2026-10-02", to: "2026-10-01" },
  ]) {
    const result = resolveAdminDateRange(invalid);
    assert.equal(result.preset, "month");
    assert.ok(result.startDate && result.endDate);
  }
});
