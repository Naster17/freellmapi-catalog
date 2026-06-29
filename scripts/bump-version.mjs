#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_DIR = resolve(__dirname, '..');
const LATEST_PATH = resolve(CATALOG_DIR, 'v1', 'latest');
const LATEST_JSON_PATH = resolve(CATALOG_DIR, 'latest.json');

function bumpVersion(current) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const todayPrefix = `${y}.${m}.${d}`;

  const match = current.match(/^(\d+\.\d+\.\d+)\.(\d+)$/);
  if (match) {
    const [, datePart, patchStr] = match;
    if (datePart === todayPrefix) {
      return `${todayPrefix}.${Number(patchStr) + 1}`;
    }
  }
  return `${todayPrefix}.1`;
}

function updateCatalog(raw, newVersion) {
  const catalog = JSON.parse(raw);
  catalog.version = newVersion;
  catalog.generatedAt = new Date().toISOString();
  return JSON.stringify(catalog, null, 2) + '\n';
}

const raw = readFileSync(LATEST_PATH, 'utf8');
const catalog = JSON.parse(raw);
const oldVersion = catalog.version;
const newVersion = bumpVersion(oldVersion);

console.log(`version: ${oldVersion} -> ${newVersion}`);

const updated = updateCatalog(raw, newVersion);
writeFileSync(LATEST_PATH, updated, 'utf8');
writeFileSync(LATEST_JSON_PATH, updated, 'utf8');

const push = process.argv.includes('--push');
if (push) {
  process.chdir(CATALOG_DIR);
  execSync('git add v1/latest latest.json', { stdio: 'inherit' });
  execSync(`git commit -m "catalog: bump to v${newVersion}"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log(`pushed v${newVersion}`);
}
