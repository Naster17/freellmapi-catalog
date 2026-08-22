import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_DIR = resolve(__dirname, '..');
const LATEST_PATH = resolve(CATALOG_DIR, 'v1', 'latest');

const MODAL_QUIRK = {
  slug: 'modal-endpoint-key',
  title: 'Per-endpoint URL + proxy token, dollar-metered',
  body: 'Modal keys carry their shared-endpoint URL (https://<workspace>--ep-<name>.<region>.modal.direct/v1) plus a workspace proxy token (wk-….ws-… from modal.com/settings/proxy-auth-tokens). Usage meters in dollars against a per-key rolling 30-day budget ($30 default, editable) instead of RPM/RPD limits.',
  severity: 'info',
};

const MODAL_MODELS = [
  {
    platform: 'modal',
    modelId: 'Qwen/Qwen3.8-2.4T-A95B',
    displayName: 'Qwen3.8 2.4T A95B (Modal)',
    intelligenceRank: 1,
    speedRank: 6,
    sizeLabel: 'Frontier',
    limits: { rpm: null, rpd: null, tpm: null, tpd: null },
    monthlyTokenBudget: '$30 / key / 30d',
    contextWindow: 1000000,
    enabled: true,
    supportsVision: false,
    supportsTools: true,
    quirks: [MODAL_QUIRK],
  },
  {
    platform: 'modal',
    modelId: 'moonshotai/Kimi-K3',
    displayName: 'Kimi K3 (Modal)',
    intelligenceRank: 2,
    speedRank: 5,
    sizeLabel: 'Frontier',
    limits: { rpm: null, rpd: null, tpm: null, tpd: null },
    monthlyTokenBudget: '$30 / key / 30d',
    contextWindow: 1048576,
    enabled: true,
    supportsVision: true,
    supportsTools: true,
    quirks: [MODAL_QUIRK],
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

if (!catalog.platforms.some(p => p.id === 'modal')) {
  catalog.platforms.push({ id: 'modal', name: 'Modal' });
}

const existing = new Set(catalog.models.filter(m => m.platform === 'modal').map(m => m.modelId));
const toAdd = MODAL_MODELS.filter(m => !existing.has(m.modelId));
for (const model of toAdd) insertSorted(catalog.models, model);

if (!catalog.quirks.some(q => q.slug === MODAL_QUIRK.slug)) {
  catalog.quirks.push({ ...MODAL_QUIRK, targets: [{ platform: 'modal', modelGlob: null }] });
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
