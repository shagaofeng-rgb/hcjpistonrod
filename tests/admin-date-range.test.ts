import assert from "node:assert/strict";
import test from "node:test";
import { parseAdminListParams, resolveAdminDateRange } from "../src/lib/admin/date-range";

test("admin data defaults to the current month instead of an unbounded range", () => {
  const range = resolveAdminDateRange({});
  assert.equal(range.preset, "month");
  assert.match(range.startDate || "", /^\d{4}-\d{2}-01$/);
  assert.match(range.endDate || "", /^\d{4}-\d{2}-\d{2}$/);
});

test("admin date presets and custom dates retain bounded ranges", () => {
  assert.equal(resolveAdminDateRange({ range: "today" }).preset, "today");
  assert.equal(resolveAdminDateRange({ range: "week" }).preset, "week");
  assert.deepEqual(resolveAdminDateRange({ range: "custom", from: "2026-09-01", to: "2026-09-08" }), {
    preset: "custom", startDate: "2026-09-01", endDate: "2026-09-08", label: "2026-09-01 至 2026-09-08",
  });
});

test("admin list pagination has bounded page sizes and an escaped query value", () => {
  assert.deepEqual(parseAdminListParams({ page: "3", pageSize: "50", q: "  chrome rod  " }), { page: 3, pageSize: 50, keyword: "chrome rod" });
  assert.deepEqual(parseAdminListParams({ page: "0", pageSize: "999" }), { page: 1, pageSize: 20, keyword: "" });
});
