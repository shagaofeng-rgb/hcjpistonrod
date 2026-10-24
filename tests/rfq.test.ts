import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../src/app/api/rfq/route";

test("inquiry endpoint rejects a non-form request cleanly", async () => {
  const response = await POST(new Request("https://www.hcjpistonrod.com/api/rfq", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "not a form",
  }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).ok, false);
});

test("inquiry endpoint checks required fields before storage", async () => {
  const response = await POST(new Request("https://www.hcjpistonrod.com/api/rfq", {
    method: "POST",
    body: new FormData(),
  }));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /required/);
});
