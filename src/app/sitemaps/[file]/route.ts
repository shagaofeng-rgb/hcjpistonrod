import { findSitemapDocument, getSitemapBundle, xmlResponse } from "@/lib/sitemap/service";
import type { SitemapKind } from "@/lib/sitemap/core";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  const match = /^(pages|categories|products|posts)-(\d+)\.xml$/.exec(file);
  if (!match) return new Response("Not found", { status: 404 });
  const bundle = await getSitemapBundle();
  const document = findSitemapDocument(bundle.documents, match[1] as SitemapKind, Number(match[2]));
  return document ? xmlResponse(document.xml) : new Response("Not found", { status: 404 });
}
