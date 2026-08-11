import { validateCronRequest } from "@/lib/news-automation/cron";
import { runNewsPublish } from "@/lib/news-automation/service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authorization = validateCronRequest(request);
  if (!authorization.ok) return authorization.response;
  const result = await runNewsPublish();
  return Response.json(result, { status: result.ok ? 200 : result.skipped ? 409 : 500 });
}
