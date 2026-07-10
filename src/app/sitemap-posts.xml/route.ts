import { findSitemapDocument, getSitemapBundle, xmlResponse } from "@/lib/sitemap/service";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  const bundle = await getSitemapBundle();
  const document = findSitemapDocument(bundle.documents, "posts");
  return document ? xmlResponse(document.xml) : new Response("Not found", { status: 404 });
}
