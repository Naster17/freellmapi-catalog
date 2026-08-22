import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_DIR = resolve(__dirname, '..');
const LATEST_PATH = resolve(CATALOG_DIR, 'v1', 'latest');

const MUSE_QUIRK = {
  slug: 'zen-muse-contributor',
  title: 'Contributor tier, hidden reasoning tokens',
  body: "Muse Spark 1.2 free is served as the contributor roster alias muse-spark-1.2-contributor-free (paid muse-spark-1.2 also exists on Zen) and self-identifies as a Meta model. It burns hidden reasoning tokens before visible output (300+ completion tokens observed for a one-line answer), so avoid tiny max_tokens values or replies can finish by length with empty content.",
  severity: 'info',
};

const ZEN_PROMO_QUIRK = {
  slug: 'zen-promo-roster',
  title: 'Limited-time promo, roster rotates',
  body: 'OpenCode Zen free models are explicitly limited-time promotional access ("available for a limited time" per the docs), not a recurring quota. The roster rotates: qwen3.6-plus and minimax-m3 promos already ended. Expect any row here to die without notice; prompts/outputs may be used for model improvement.',
  severity: 'warning',
};

const MUSE_MODELS = [
  {
    platform: 'opencode',
    modelId: 'muse-spark-1.2-contributor-free',
    displayName: 'Muse Spark 1.2 Free (OpenCode Zen)',
    intelligenceRank: 5,
    speedRank: 7,
    sizeLabel: 'Frontier',
    limits: { rpm: 20, rpd: 200, tpm: null, tpd: null },
    monthlyTokenBudget: '~500M',
    contextWindow: 1048576,
    enabled: true,
    supportsVision: true,
    supportsTools: true,
    quirks: [ZEN_PROMO_QUIRK, MUSE_QUIRK],
  },
];

function compareModels(a, b) {
  return (a.intelligenceRank - b.intelligenceRank)
    || a.platform.localeCompare(b.platform)
    || a.modelId.localeCompare(b.modelId);
}

function insertSorted(models, model) {
  const idx = models.findIndex(m => compareModels(m, model) > 0);
  models.splice(idx === -1 ? models.length : idx, 0, model);
}

const raw = readFileSync(LATEST_PATH, 'utf8');
const catalog = JSON.parse(raw);

if (!catalog.platforms.some(p => p.id === 'opencode')) {
  catalog.platforms.push({ id: 'opencode', name: 'OpenCode Zen' });
}

const existing = new Set(catalog.models.filter(m => m.platform === 'opencode').map(m => m.modelId));
const toAdd = MUSE_MODELS.filter(m => !existing.has(m.modelId));
for (const model of toAdd) insertSorted(catalog.models, model);

if (!catalog.quirks.some(q => q.slug === MUSE_QUIRK.slug)) {
  catalog.quirks.push({ ...MUSE_QUIRK, targets: [{ platform: 'opencode', modelGlob: 'muse-spark-*' }] });
}

catalog.counts.platforms = catalog.platforms.length;
catalog.counts.models = catalog.models.length;
catalog.counts.enabledModels = catalog.models.filter(m => m.enabled).length;
catalog.counts.quirks = catalog.quirks.length;

const out = JSON.stringify(catalog, null, 2) + '\n';
writeFileSync(resolve(CATALOG_DIR, 'v1', 'latest'), out, 'utf8');
writeFileSync(resolve(CATALOG_DIR, 'latest.json'), out, 'utf8');

console.log(JSON.stringify({
  addedModels: toAdd.map(m => m.modelId),
  platforms: catalog.counts.platforms,
  models: catalog.counts.models,
  quirks: catalog.counts.quirks,
}, null, 1));
