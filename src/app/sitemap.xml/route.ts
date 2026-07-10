import { getSitemapBundle, xmlResponse } from "@/lib/sitemap/service";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  const bundle = await getSitemapBundle();
  return xmlResponse(bundle.indexXml);
}
