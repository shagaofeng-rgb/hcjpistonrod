import assert from "node:assert/strict";
import { createHash } from "node:crypto";

function canonicalizeSourceUrl(value) {
  const url = new URL(value);
  url.hash = "";
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "fbclid", "gclid"].forEach((param) =>
    url.searchParams.delete(param),
  );
  url.hostname = url.hostname.toLowerCase();
  return url.toString().replace(/\/$/, "");
}

function normalizeTitle(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sourceFingerprint(candidate) {
  return hash([normalizeTitle(candidate.title), canonicalizeSourceUrl(candidate.url), candidate.publisher || ""].join("|"));
}

function isWithinLookback(publishedAt, lookbackHours, now) {
  const ageHours = (now.getTime() - new Date(publishedAt).getTime()) / 36e5;
  return ageHours >= 0 && ageHours <= lookbackHours;
}

const now = new Date("2026-07-08T12:00:00Z");

assert.equal(
  canonicalizeSourceUrl("https://Example.com/news/item/?utm_source=x&utm_medium=y&id=10#section"),
  "https://example.com/news/item/?id=10",
);
assert.equal(normalizeTitle("  Hydraulic   Piston-Rod: Market Update!  "), "hydraulic piston rod market update");
assert.equal(isWithinLookback("2026-07-06T12:01:00Z", 72, now), true);
assert.equal(isWithinLookback("2026-07-05T11:59:00Z", 72, now), false);
assert.equal(
  sourceFingerprint({
    title: "Hydraulic Piston Rod Market Update",
    url: "https://example.com/news/item?utm_source=a",
    publisher: "Example",
  }),
  sourceFingerprint({
    title: "hydraulic piston rod market update",
    url: "https://example.com/news/item",
    publisher: "Example",
  }),
);

console.log("News automation rule tests passed.");
