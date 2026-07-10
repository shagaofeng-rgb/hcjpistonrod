import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { hasDatabaseConfig, query } from "@/lib/admin/db";
import { emailConfig, getEmailTransporter } from "@/lib/email";

export const runtime = "nodejs";

const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "jpg", "jpeg", "png", "dwg", "dxf"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "application/acad",
  "application/x-acad",
  "application/dwg",
  "image/vnd.dwg",
  "application/dxf",
  "image/vnd.dxf",
  "text/plain",
  "application/octet-stream",
]);

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

function clientMeta(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  const userAgent = request.headers.get("user-agent") || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  const ipHash = ip && secret ? createHash("sha256").update(`${secret}:${ip}`).digest("hex") : null;
  const device = /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop";
  return { ipHash, userAgent: userAgent.slice(0, 1000), device };
}

function sourceMeta(request: Request) {
  const referrer = request.headers.get("referer") || "";
  let url: URL | null = null;
  try {
    url = referrer ? new URL(referrer) : null;
  } catch {
    url = null;
  }
  const ownHost = new URL(request.url).hostname;
  const sourceChannel = url?.searchParams.get("utm_source") ? "campaign" : url && url.hostname !== ownHost ? "referral" : "direct";
  return {
    sourcePage: url?.pathname || "/contact",
    pageUrl: url?.toString() || null,
    referrer: referrer || null,
    sourceChannel,
    utmSource: url?.searchParams.get("utm_source") || null,
    utmMedium: url?.searchParams.get("utm_medium") || null,
    utmCampaign: url?.searchParams.get("utm_campaign") || null,
    utmContent: url?.searchParams.get("utm_content") || null,
    utmTerm: url?.searchParams.get("utm_term") || null,
  };
}

function formNumber(receivedAt: Date) {
  const date = receivedAt.toISOString().slice(0, 10).replaceAll("-", "");
  return `RFQ-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const company = getString(formData, "company");
  const country = getString(formData, "country");
  const profile = getString(formData, "profile");
  const product = getString(formData, "product");
  const message = getString(formData, "message");
  const drawing = formData.get("drawing");
  const privacyConsent = formData.get("privacy") === "on";

  if (getString(formData, "website")) {
    return NextResponse.json({ ok: true });
  }
  if (!name || !email || !message || !privacyConsent) {
    return NextResponse.json(
      { ok: false, error: "Name, email, specification, and privacy consent are required." },
      { status: 400 },
    );
  }

  const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];
  const attachmentMetadata: Array<{ filename: string; size: number; contentType: string }> = [];
  if (drawing instanceof File && drawing.size > 0) {
    const extension = drawing.name.split(".").pop()?.toLowerCase() || "";
    if (drawing.size > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json({ ok: false, error: "Attachment must be smaller than 8 MB." }, { status: 400 });
    }
    if (!ALLOWED_EXTENSIONS.has(extension) || (drawing.type && !ALLOWED_MIME_TYPES.has(drawing.type))) {
      return NextResponse.json({ ok: false, error: "Attachment must be a PDF, Word, JPG, PNG, DWG, or DXF file." }, { status: 400 });
    }
    attachments.push({ filename: drawing.name, content: Buffer.from(await drawing.arrayBuffer()), contentType: drawing.type || undefined });
    attachmentMetadata.push({ filename: drawing.name, size: drawing.size, contentType: drawing.type || "application/octet-stream" });
  }

  const receivedAt = new Date();
  const number = formNumber(receivedAt);
  const { ipHash, userAgent, device } = clientMeta(request);
  const source = sourceMeta(request);
  let submissionId: string | null = null;

  if (hasDatabaseConfig()) {
    try {
      if (ipHash) {
        const recent = await query<{ count: string }>(
          "select count(*)::text as count from form_submissions where ip_hash=$1 and submitted_at > now() - interval '10 minutes'",
          [ipHash],
        );
        if (Number(recent.rows[0]?.count || 0) >= 5) {
          return NextResponse.json({ ok: false, error: "Too many inquiries. Please try again later." }, { status: 429 });
        }
      }
      const stored = await query<{ id: string }>(
        `insert into form_submissions
          (form_number, form_type, name, company_name, email, phone, country, buyer_profile, message,
           related_product, source_page, page_url, source_channel, utm_source, utm_medium, utm_campaign,
           utm_content, utm_term, referrer, ip_hash, browser, device_type, submit_language,
           privacy_consent, status, email_status, attachment_metadata, submitted_at)
         values ($1,'rfq',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'en',true,'new','pending',$22::jsonb,$23)
         returning id`,
        [number, name, company || null, email, phone || null, country || null, profile || null, message,
          product || null, source.sourcePage, source.pageUrl, source.sourceChannel, source.utmSource,
          source.utmMedium, source.utmCampaign, source.utmContent, source.utmTerm, source.referrer,
          ipHash, userAgent, device, JSON.stringify(attachmentMetadata), receivedAt],
      );
      submissionId = stored.rows[0]?.id || null;
    } catch (error) {
      console.error("[rfq] database storage failed", { message: error instanceof Error ? error.message : "unknown error" });
    }
  }

  const fields = { name, email, phone: phone || "Not specified", company: company || "Not specified", country: country || "Not specified", profile: profile || "Not specified", product: product || "Not specified" };
  const subject = `New RFQ ${number} from ${name} - ${product || "Website inquiry"}`;
  try {
    await getEmailTransporter().sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: emailConfig.toEmail,
      replyTo: email,
      subject,
      text: [
        `New RFQ ${number} from hcjpistonrod.com`, "", `Name: ${fields.name}`, `Email: ${fields.email}`,
        `Phone: ${fields.phone}`, `Company: ${fields.company}`, `Country: ${fields.country}`,
        `Buyer profile: ${fields.profile}`, `Product: ${fields.product}`, `Received at: ${receivedAt.toISOString()}`,
        "", "Specification:", message,
      ].join("\n"),
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111411"><h2>New RFQ ${escapeHtml(number)}</h2><table cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #d9ded6">${Object.entries(fields).map(([label, value]) => `<tr><th align="left" style="background:#eef1ec;border:1px solid #d9ded6">${escapeHtml(label)}</th><td style="border:1px solid #d9ded6">${escapeHtml(value)}</td></tr>`).join("")}<tr><th align="left" style="background:#eef1ec;border:1px solid #d9ded6">Received</th><td style="border:1px solid #d9ded6">${receivedAt.toISOString()}</td></tr></table><h3>Specification</h3><p>${escapeHtml(message).replaceAll("\n", "<br />")}</p></div>`,
      attachments,
    });
  } catch (error) {
    if (submissionId) {
      await query("update form_submissions set email_status='failed', internal_notes=$2, updated_at=now() where id=$1", [submissionId, "Automatic email delivery failed; inquiry retained in admin."]).catch(() => undefined);
    }
    console.error("[rfq] email delivery failed", { submissionId, message: error instanceof Error ? error.message : "unknown error" });
    return NextResponse.json({ ok: false, error: "Your inquiry was saved, but the email notification failed. Please email us directly." }, { status: 502 });
  }

  if (submissionId) {
    await query("update form_submissions set email_status='sent', email_sent_at=now(), updated_at=now() where id=$1", [submissionId]).catch(() => undefined);
  }
  return NextResponse.json({ ok: true, receivedAt: receivedAt.toISOString(), reference: number });
}
