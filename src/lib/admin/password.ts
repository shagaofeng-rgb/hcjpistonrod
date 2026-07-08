import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, key] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !key) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  const storedKey = Buffer.from(key, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}
