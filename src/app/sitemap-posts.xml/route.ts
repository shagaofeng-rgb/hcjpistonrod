export async function GET(request: Request) {
  return Response.redirect(new URL("/blog-sitemap.xml", request.url), 308);
}
