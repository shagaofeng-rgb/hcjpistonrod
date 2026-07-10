import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { runSitemapMaintenance, getSitemapBundle } from "../src/lib/sitemap/service";
import { validateSitemapXml } from "../src/lib/sitemap/core";

export async function writeXmlAtomically(filePath: string, xml: string) {
  validateSitemapXml(xml);
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(tempPath, xml, "utf8");
    validateSitemapXml(await readFile(tempPath, "utf8"));
    await rename(tempPath, filePath);
  } catch (error) {
    await rm(tempPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

function hasFlag(name: string) {
  return process.argv.includes(name);
}

async function main() {
  const dryRun = hasFlag("--dry-run");
  const verbose = hasFlag("--verbose");
  const result = await runSitemapMaintenance({
    trigger: "manual",
    force: hasFlag("--force"),
    dryRun,
    submit: hasFlag("--submit"),
    verbose,
  });
  if (!result.ok) throw new Error("message" in result ? result.message : "Sitemap maintenance failed");

  if (!dryRun) {
    const outputDir = path.resolve(process.cwd(), ".sitemap-cache");
    const bundle = await getSitemapBundle();
    await writeXmlAtomically(path.join(outputDir, "sitemap.xml"), bundle.indexXml);
    for (const document of bundle.documents) {
      await writeXmlAtomically(path.join(outputDir, document.fileName), document.xml);
    }
  }
  console.log(JSON.stringify(result, null, verbose ? 2 : 0));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
