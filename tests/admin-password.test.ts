import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, validateAdminPassword, verifyPassword } from "../src/lib/admin/password";

test("accepts strong admin passwords and verifies their hashes", () => {
  const password = "Secure-Admin-2026!";
  assert.equal(validateAdminPassword(password), null);
  const hash = hashPassword(password);
  assert.equal(verifyPassword(password, hash), true);
  assert.equal(verifyPassword("wrong-password", hash), false);
});

test("rejects short or incomplete admin passwords", () => {
  assert.ok(validateAdminPassword("Short1!"));
  assert.ok(validateAdminPassword("lowercase-only-password"));
  assert.ok(validateAdminPassword("NO-SYMBOL-OR-LOWERCASE-2026"));
});
