import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  return NextResponse.json({
    ok: true,
    receivedAt: new Date().toISOString(),
    name: formData.get("name"),
    product: formData.get("product"),
  });
}
