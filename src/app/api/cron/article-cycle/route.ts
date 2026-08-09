import { validateCronRequest } from "@/lib/content-ops/cron";
import { runArticleCycle } from "@/lib/content-ops/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authorization = validateCronRequest(request);
  if (!authorization.ok) return authorization.response;
  const result = await runArticleCycle();
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
