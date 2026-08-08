import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "hcj_admin_session";

const newsToBlogRedirects: Record<string, string> = {
  "/news/choose-hard-chrome-plated-rod-for-mobile-machinery": "/blog/choose-hard-chrome-plated-rod-for-mobile-machinery",
  "/news/piston-rod-surface-quality-and-sealing-risk": "/blog/piston-rod-surface-quality-and-sealing-risk",
  "/news/buyers-check-before-custom-piston-rods": "/blog/buyers-check-before-custom-piston-rods",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0].toLowerCase();

  const newsRedirectTarget = newsToBlogRedirects[pathname];
  if (newsRedirectTarget) {
    return NextResponse.redirect(new URL(newsRedirectTarget, request.url), 301);
  }

  if (hostname === "hcjpistonrod.com") {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.hostname = "www.hcjpistonrod.com";
    canonicalUrl.port = "";
    canonicalUrl.protocol = "https:";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  if (!pathname.startsWith("/admin") || pathname === "/admin/login" || pathname === "/admin/setup") return NextResponse.next();

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
