import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { getPool, hasDatabaseConfig } from "@/lib/admin/db";
import { site } from "@/lib/site";
import { buildSitemapDocuments, dedupeEntries, diffSitemapEntries, renderSitemapIndex, validateSitemapXml, type SitemapDocument, type SitemapEntry, type SitemapKind } from "./core";
import { submitSitemapToSearchConsole } from "./google";
import { getPublicSitemapEntries } from "./source";

const LOCK_ID = 721_907_314;
const globalState = globalThis as typeof globalThis & { __hcjSitemapMaintenance?: boolean };

export function tryAcquireInMemorySitemapLock() {
  if (globalState.__hcjSitemapMaintenance) return false;
  globalState.__hcjSitemapMaintenance = true;
  return true;
}

export function releaseInMemorySitemapLock() {
  globalState.__hcjSitemapMaintenance = false;
}

export async function getSitemapBundle() {
  const source = await getPublicSitemapEntries();
  const entries = dedupeEntries(source.entries);
  const documents = buildSitemapDocuments(entries);
  const indexXml = renderSitemapIndex(site.domain, documents);
  validateSitemapXml(indexXml);
  documents.forEach((document) => validateSitemapXml(document.xml));
  return { ...source, entries, documents, indexXml };
}

export function findSitemapDocument(documents: SitemapDocument[], kind: SitemapKind, part?: number) {
  const matches = documents.filter((document) => document.kind === kind);
  if (matches.length === 1 && !part) return matches[0];
  if (part && matches.length > 1) return matches[part - 1];
  return undefined;
}

function hashManifest(entries: SitemapEntry[]) {
  return createHash("sha256").update(JSON.stringify(entries.map(({ loc, lastmod }) => ({ loc, lastmod })))).digest("hex");
}

async function acquireDatabaseLock() {
  if (!hasDatabaseConfig()) return null;
  const client = await getPool().connect();
  const result = await client.query<{ locked: boolean }>("select pg_try_advisory_lock($1) as locked", [LOCK_ID]);
  if (!result.rows[0]?.locked) {
    client.release();
    return false;
  }
  return client;
}

async function releaseDatabaseLock(client: PoolClient | null) {
  if (!client) return;
  try {
    await client.query("select pg_advisory_unlock($1)", [LOCK_ID]);
  } finally {
    client.release();
  }
}

export type SitemapMaintenanceOptions = {
  trigger: "cron" | "manual" | "content-change" | "test";
  force?: boolean;
  dryRun?: boolean;
  submit?: boolean;
  verbose?: boolean;
};

export async function runSitemapMaintenance(options: SitemapMaintenanceOptions) {
  const startedAt = new Date();
  if (!tryAcquireInMemorySitemapLock()) {
    return { ok: false, skipped: true, reason: "locked", message: "A sitemap maintenance run is already active" };
  }
  let client: PoolClient | null = null;

  try {
    const databaseLock = await acquireDatabaseLock();
    if (databaseLock === false) return { ok: false, skipped: true, reason: "locked", message: "Another sitemap worker holds the database lock" };
    client = databaseLock;
    const bundle = await getSitemapBundle();
    const manifestHash = hashManifest(bundle.entries);
    let previousEntries: Pick<SitemapEntry, "loc" | "lastmod">[] = [];
    let previousHash: string | null = null;

    if (client) {
      try {
        const snapshot = await client.query<{ manifest_hash: string; url_manifest: Pick<SitemapEntry, "loc" | "lastmod">[] }>(
          "select manifest_hash, url_manifest from sitemap_snapshots where id = 1",
        );
        previousHash = snapshot.rows[0]?.manifest_hash || null;
        previousEntries = snapshot.rows[0]?.url_manifest || [];
      } catch (error) {
        bundle.warnings.push(error instanceof Error ? error.message : "Unable to read sitemap snapshot");
      }
    }

    const changes = diffSitemapEntries(previousEntries, bundle.entries);
    const changed = options.force || manifestHash !== previousHash;
    const shouldSubmit = Boolean(options.submit && !options.dryRun && changed && (client || options.force));
    const searchConsole = shouldSubmit
      ? await submitSitemapToSearchConsole({ sitemapUrl: process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL || `${site.domain}/sitemap.xml` })
      : { attempted: false, success: false, message: options.submit ? (changed && !client && !options.force ? "A persistent database snapshot is required for automatic unchanged detection" : "No sitemap changes to submit") : "Submission not requested" };
    const finishedAt = new Date();
    const result = {
      ok: true,
      skipped: !changed,
      dryRun: Boolean(options.dryRun),
      trigger: options.trigger,
      source: bundle.source,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      manifestHash,
      changed,
      urlCount: bundle.entries.length,
      successCount: bundle.entries.length,
      skippedCount: 0,
      errorCount: bundle.warnings.length,
      files: bundle.documents.map((document) => ({ fileName: document.fileName, urlCount: document.entries.length, bytes: Buffer.byteLength(document.xml), lastmod: document.lastmod })),
      split: bundle.documents.some((document) => document.fileName.startsWith("sitemaps/")),
      changes,
      warnings: bundle.warnings,
      searchConsole,
    };

    if (client && !options.dryRun) {
      try {
        await client.query("begin");
        await client.query(
          `insert into sitemap_snapshots (id, manifest_hash, url_manifest, files_manifest, generated_at)
           values (1, $1, $2::jsonb, $3::jsonb, now())
           on conflict (id) do update set manifest_hash = excluded.manifest_hash, url_manifest = excluded.url_manifest,
             files_manifest = excluded.files_manifest, generated_at = excluded.generated_at`,
          [manifestHash, JSON.stringify(bundle.entries.map(({ loc, lastmod }) => ({ loc, lastmod }))), JSON.stringify(result.files)],
        );
        await client.query(
          `insert into sitemap_runs
            (trigger_type, status, started_at, finished_at, duration_ms, url_count, success_count, skipped_count, error_count,
             files, was_split, added_urls, modified_urls, removed_urls, search_console_attempted, search_console_success, search_console_result, warnings)
           values ($1, 'success', $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, $12::jsonb, $13::jsonb, $14, $15, $16, $17::jsonb)`,
          [options.trigger, startedAt, finishedAt, result.durationMs, result.urlCount, result.successCount, result.skippedCount,
            result.errorCount, JSON.stringify(result.files), result.split, JSON.stringify(changes.added), JSON.stringify(changes.modified),
            JSON.stringify(changes.removed), searchConsole.attempted, searchConsole.success, searchConsole.message, JSON.stringify(bundle.warnings)],
        );
        await client.query("update sitemap_refresh_state set processed_at = now() where id = 1");
        await client.query("commit");
      } catch (error) {
        await client.query("rollback").catch(() => undefined);
        result.warnings.push(error instanceof Error ? error.message : "Unable to persist sitemap audit log");
        result.errorCount = result.warnings.length;
      }
    }

    if (options.verbose) console.info(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sitemap maintenance failed";
    console.error("[sitemap] maintenance failed", { trigger: options.trigger, message });
    return { ok: false, skipped: false, trigger: options.trigger, message };
  } finally {
    await releaseDatabaseLock(client);
    releaseInMemorySitemapLock();
  }
}

export function xmlResponse(xml: string, cacheSeconds = 300) {
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
      "x-content-type-options": "nosniff",
    },
  });
}
