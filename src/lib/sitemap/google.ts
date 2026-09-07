import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

type FetchLike = typeof fetch;

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

export type SearchConsoleCredentialSource = "environment-json" | "environment-fields" | "filesystem-path" | "missing" | "invalid";

export type SearchConsoleConfiguration = {
  enabled: boolean;
  siteUrl: string | null;
  sitemapUrl: string | null;
  credentialSource: SearchConsoleCredentialSource;
  ready: boolean;
  productionSafe: boolean;
  message: string;
};

function hasServiceAccountFields(value: unknown): value is ServiceAccount {
  return Boolean(
    value
      && typeof value === "object"
      && typeof (value as ServiceAccount).client_email === "string"
      && typeof (value as ServiceAccount).private_key === "string",
  );
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function getSearchConsoleConfiguration(): SearchConsoleConfiguration {
  const enabled = process.env.GOOGLE_SEARCH_CONSOLE_ENABLED === "true";
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim() || null;
  const sitemapUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL?.trim() || null;
  let credentialSource: SearchConsoleCredentialSource = "missing";

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentialSource = hasServiceAccountFields(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)) ? "environment-json" : "invalid";
    } catch {
      credentialSource = "invalid";
    }
  } else if (process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY) {
    credentialSource = "environment-fields";
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH) {
    credentialSource = "filesystem-path";
  }

  if (!enabled) {
    return { enabled, siteUrl, sitemapUrl, credentialSource, ready: false, productionSafe: credentialSource !== "filesystem-path", message: "Search Console submission is disabled" };
  }
  if (!siteUrl || !sitemapUrl) {
    return { enabled, siteUrl, sitemapUrl, credentialSource, ready: false, productionSafe: credentialSource !== "filesystem-path", message: "Search Console site or sitemap URL is missing" };
  }
  if (credentialSource === "missing" || credentialSource === "invalid") {
    return { enabled, siteUrl, sitemapUrl, credentialSource, ready: false, productionSafe: true, message: "Google service-account credentials are missing or invalid" };
  }
  if (credentialSource === "filesystem-path" && isProductionRuntime()) {
    return { enabled, siteUrl, sitemapUrl, credentialSource, ready: false, productionSafe: false, message: "Production requires GOOGLE_SERVICE_ACCOUNT_JSON or split GSC credentials; filesystem credential paths are not durable" };
  }
  return { enabled, siteUrl, sitemapUrl, credentialSource, ready: true, productionSafe: credentialSource !== "filesystem-path", message: "Search Console configuration is ready" };
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function loadServiceAccount(): Promise<ServiceAccount | null> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) as unknown;
    if (!hasServiceAccountFields(parsed)) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is incomplete");
    return parsed;
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH) {
    if (isProductionRuntime()) throw new Error("Filesystem service-account credentials are disabled in production");
    const parsed = JSON.parse(await readFile(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH, "utf8")) as unknown;
    if (!hasServiceAccountFields(parsed)) throw new Error("Service-account credential file is incomplete");
    return parsed;
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
  const configuration = getSearchConsoleConfiguration();
  const enabled = options.enabled ?? configuration.enabled;
  if (!enabled) return { attempted: false, success: false, message: "Search Console submission is disabled" };
  const siteUrl = options.siteUrl || configuration.siteUrl || undefined;
  const sitemapUrl = options.sitemapUrl || configuration.sitemapUrl || undefined;
  if (!siteUrl || !sitemapUrl) return { attempted: false, success: false, message: "Search Console site or sitemap URL is missing" };
  if (!options.accessToken && !configuration.ready) return { attempted: false, success: false, message: configuration.message };
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
