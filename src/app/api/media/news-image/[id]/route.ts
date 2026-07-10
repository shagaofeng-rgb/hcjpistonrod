import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { query } from "@/lib/admin/db";
import { isSafeExternalUrl } from "@/lib/news-automation";

export const runtime = "nodejs";
export const revalidate = 86_400;

function isPrivateAddress(address: string) {
  if (address === "::1" || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:")) return true;
  if (address.startsWith("127.") || address.startsWith("10.") || address.startsWith("192.168.") || address.startsWith("169.254.")) return true;
  const match = /^172\.(\d+)\./.exec(address);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
}

async function assertPublicHost(url: URL) {
  if (isIP(url.hostname) && isPrivateAddress(url.hostname)) throw new Error("Private image host is not allowed");
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some((item) => isPrivateAddress(item.address))) throw new Error("Image host resolved to a private address");
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const result = await query<{ image_url: string }>(
      `select coalesce(na.cover_image_url, ma.url) as image_url
       from news_articles na left join media_assets ma on ma.id = na.cover_image_id
       where na.id = $1 and na.deleted_at is null and na.status = 'published' and na.published_at <= now()`,
      [id],
    );
    const imageUrl = result.rows[0]?.image_url;
    if (!imageUrl || !isSafeExternalUrl(imageUrl)) return new Response("Not found", { status: 404 });
    const url = new URL(imageUrl);
    await assertPublicHost(url);
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(10_000) });
    const type = response.headers.get("content-type") || "";
    const length = Number(response.headers.get("content-length") || 0);
    if (!response.ok || !type.startsWith("image/") || (length && length > 8 * 1024 * 1024)) return new Response("Invalid image", { status: 415 });
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 8 * 1024 * 1024) return new Response("Image too large", { status: 413 });
    return new Response(bytes, {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[news-image] proxy failed", { id, message: error instanceof Error ? error.message : "unknown error" });
    return new Response("Image unavailable", { status: 502 });
  }
}
