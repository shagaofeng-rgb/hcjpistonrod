export const newsToBlogRedirects: Record<string, string> = {
  "choose-hard-chrome-plated-rod-for-mobile-machinery": "/blog/choose-hard-chrome-plated-rod-for-mobile-machinery",
  "piston-rod-surface-quality-and-sealing-risk": "/blog/piston-rod-surface-quality-and-sealing-risk",
  "buyers-check-before-custom-piston-rods": "/blog/buyers-check-before-custom-piston-rods",
};

export const historicalNoindexNewsSlugs = new Set([
  "2026-07-22-apg-joins-flow-control-platform-expanding-industrial-component-offerings",
  "2026-07-20-fire-resistant-hydraulic-fluids-safety-considerations-for-industrial-operations",
  "2026-07-14-hydraulic-system-efficiency-gains-drive-industrial-equipment-advancements",
]);

export function isIndexableNewsSlug(slug: string) {
  return !newsToBlogRedirects[slug] && !historicalNoindexNewsSlugs.has(slug);
}
