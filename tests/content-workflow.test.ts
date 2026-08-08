import assert from "node:assert/strict";
import test from "node:test";
import { validateManualPublication } from "../src/lib/content-workflow";

test("manual publication is blocked until technical and marketing reviews are both named and dated", () => {
  const result = validateManualPublication({
    technicalReviewedAt: "2026-08-08T06:00:00.000Z",
    technicalReviewer: "Engineering",
    marketingReviewedAt: null,
    marketingReviewer: null,
  });

  assert.equal(result.canPublish, false);
  assert.deepEqual(result.missing, ["marketing review"]);
});

test("manual publication is allowed only after both review gates are complete", () => {
  const result = validateManualPublication({
    technicalReviewedAt: "2026-08-08T06:00:00.000Z",
    technicalReviewer: "Engineering",
    marketingReviewedAt: "2026-08-08T07:00:00.000Z",
    marketingReviewer: "Marketing",
  });

  assert.equal(result.canPublish, true);
  assert.deepEqual(result.missing, []);
});
