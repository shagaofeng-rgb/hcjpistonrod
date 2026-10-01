export const runtime = "nodejs";

export async function GET() {
  return Response.json({ ok: false, error: "News collection is disabled." }, { status: 410 });
}
