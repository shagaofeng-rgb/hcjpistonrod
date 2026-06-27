import { NextResponse } from "next/server";
import { emailConfig, getEmailTransporter } from "@/lib/email";

export const runtime = "nodejs";

const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const product = getString(formData, "product");
  const message = getString(formData, "message");
  const drawing = formData.get("drawing");

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and specification are required." },
      { status: 400 },
    );
  }

  const attachments = [];

  if (drawing instanceof File && drawing.size > 0) {
    if (drawing.size > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json(
        { ok: false, error: "Attachment must be smaller than 8 MB." },
        { status: 400 },
      );
    }

    attachments.push({
      filename: drawing.name,
      content: Buffer.from(await drawing.arrayBuffer()),
      contentType: drawing.type || undefined,
    });
  }

  const receivedAt = new Date();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeProduct = escapeHtml(product || "Not specified");
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const subject = `New RFQ from ${name} - ${product || "Website inquiry"}`;

  await getEmailTransporter().sendMail({
    from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
    to: emailConfig.toEmail,
    replyTo: email,
    subject,
    text: [
      "New RFQ from hcjpistonrod.com",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Product: ${product || "Not specified"}`,
      `Received at: ${receivedAt.toISOString()}`,
      "",
      "Specification:",
      message,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111411">
        <h2>New RFQ from hcjpistonrod.com</h2>
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #d9ded6">
          <tr><th align="left" style="background:#eef1ec;border:1px solid #d9ded6">Name</th><td style="border:1px solid #d9ded6">${safeName}</td></tr>
          <tr><th align="left" style="background:#eef1ec;border:1px solid #d9ded6">Email</th><td style="border:1px solid #d9ded6">${safeEmail}</td></tr>
          <tr><th align="left" style="background:#eef1ec;border:1px solid #d9ded6">Product</th><td style="border:1px solid #d9ded6">${safeProduct}</td></tr>
          <tr><th align="left" style="background:#eef1ec;border:1px solid #d9ded6">Received</th><td style="border:1px solid #d9ded6">${receivedAt.toISOString()}</td></tr>
        </table>
        <h3>Specification</h3>
        <p>${safeMessage}</p>
      </div>
    `,
    attachments,
  });

  return NextResponse.json({
    ok: true,
    receivedAt: receivedAt.toISOString(),
    name,
    product,
  });
}
