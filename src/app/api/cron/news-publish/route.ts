export const runtime = "nodejs";

export async function GET() {
  return Response.json({ ok: false, error: "News publishing is disabled." }, { status: 410 });
}
