export function validateCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return { ok: false as const, response: Response.json({ ok: false, error: "Cron secret is not configured" }, { status: 503 }) };
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return { ok: false as const, response: Response.json({ ok: false, error: "Unauthorized cron request" }, { status: 401 }) };
  }
  return { ok: true as const };
}
