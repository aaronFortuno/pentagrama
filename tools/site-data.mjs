import { readFileSync } from 'node:fs';
import { lightningDetails } from './lightning.mjs';
import { parseVersion } from './release-version.mjs';

const root = new URL('../', import.meta.url);
const read = file => JSON.parse(readFileSync(new URL(file, root), 'utf8'));
const { version } = read('package.json'), release = read('src/release.json');
parseVersion(version);
if (!/^\d{4}-\d{2}-\d{2}$/.test(release.date) || !Number.isFinite(Date.parse(release.date)) || !Array.isArray(release.changes) || !release.changes.length) throw new Error('Invalid release metadata');
const history = release.history || [];
const versions = new Set([version]);
for (const entry of history) {
  parseVersion(entry.version);
  if (versions.has(entry.version) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !Number.isFinite(Date.parse(entry.date)) || !Array.isArray(entry.changes) || !entry.changes.length) throw new Error('Invalid release history');
  versions.add(entry.version);
}
export const RELEASE = Object.freeze({ version, date: release.date, changes: Object.freeze(release.changes), history: Object.freeze(history.map(entry => Object.freeze({ ...entry, changes: Object.freeze(entry.changes) }))) });
export const SUPPORT = Object.freeze(lightningDetails(read('src/support.json').lightningAddress));
export function releaseDate(locale, date = RELEASE.date) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}
