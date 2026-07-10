import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

type FetchLike = typeof fetch;

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function loadServiceAccount(): Promise<ServiceAccount | null> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) as ServiceAccount;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH) {
    return JSON.parse(await readFile(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH, "utf8")) as ServiceAccount;
  }
  if (process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY) {
    return { client_email: process.env.GSC_CLIENT_EMAIL, private_key: process.env.GSC_PRIVATE_KEY.replace(/\\n/g, "\n") };
  }
  return null;
}

async function getAccessToken(credentials: ServiceAccount, fetchImpl: FetchLike, timeoutMs: number) {
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = credentials.token_uri || "https://oauth2.googleapis.com/token";
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${base64Url(signer.sign(credentials.private_key))}`;
  const response = await fetchImpl(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`Google OAuth failed (${response.status})`);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Google OAuth did not return an access token");
  return payload.access_token;
}

export type SearchConsoleResult = { attempted: boolean; success: boolean; status?: number; message: string };

export async function submitSitemapToSearchConsole(options: {
  enabled?: boolean;
  siteUrl?: string;
  sitemapUrl?: string;
  fetchImpl?: FetchLike;
  accessToken?: string;
  timeoutMs?: number;
} = {}): Promise<SearchConsoleResult> {
  const enabled = options.enabled ?? process.env.GOOGLE_SEARCH_CONSOLE_ENABLED === "true";
  if (!enabled) return { attempted: false, success: false, message: "Search Console submission is disabled" };
  const siteUrl = options.siteUrl || process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
  const sitemapUrl = options.sitemapUrl || process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL;
  if (!siteUrl || !sitemapUrl) return { attempted: false, success: false, message: "Search Console site or sitemap URL is missing" };
  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || 10_000;

  try {
    const sitemapResponse = await fetchImpl(sitemapUrl, { method: "GET", signal: AbortSignal.timeout(timeoutMs) });
    if (!sitemapResponse.ok) return { attempted: false, success: false, status: sitemapResponse.status, message: `Sitemap is not publicly accessible (${sitemapResponse.status})` };
    const credentials = options.accessToken ? null : await loadServiceAccount();
    if (!options.accessToken && !credentials) return { attempted: false, success: false, message: "Google service account credentials are missing" };
    const token = options.accessToken || await getAccessToken(credentials!, fetchImpl, timeoutMs);
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
    const response = await fetchImpl(endpoint, {
      method: "PUT",
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return { attempted: true, success: false, status: response.status, message: `Search Console API returned ${response.status}` };
    return { attempted: true, success: true, status: response.status, message: "Sitemap submitted to Search Console" };
  } catch (error) {
    return { attempted: true, success: false, message: error instanceof Error ? error.message : "Search Console submission failed" };
  }
}
