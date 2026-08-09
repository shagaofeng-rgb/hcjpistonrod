import { createHash } from "node:crypto";

type GithubConfig = { owner: string; repo: string; branch: string; token: string };

export async function createGithubContentCommit(config: GithubConfig, path: string, content: string, message: string, fetchImpl: typeof fetch = fetch) {
  if (!config.owner || !config.repo || !config.token) {
    return { ok: false as const, reason: "GitHub publishing is not configured" };
  }
  const endpoint = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
  const existing = await fetchImpl(`${endpoint}?ref=${encodeURIComponent(config.branch)}`, { headers: { authorization: `Bearer ${config.token}`, accept: "application/vnd.github+json" } });
  const existingBody = existing.ok ? await existing.json() as { sha?: string } : {};
  if (!existing.ok && existing.status !== 404) return { ok: false as const, reason: `GitHub read failed with ${existing.status}` };
  const response = await fetchImpl(endpoint, {
    method: "PUT",
    headers: { authorization: `Bearer ${config.token}`, accept: "application/vnd.github+json", "content-type": "application/json" },
    body: JSON.stringify({ message, branch: config.branch, sha: existingBody.sha, content: Buffer.from(content).toString("base64"), idempotency_key: createHash("sha256").update(`${path}:${content}`).digest("hex") }),
  });
  if (!response.ok) return { ok: false as const, reason: `GitHub write failed with ${response.status}` };
  const body = await response.json() as { commit?: { sha?: string } };
  return { ok: true as const, commitSha: body.commit?.sha ?? null };
}
