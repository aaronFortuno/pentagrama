import { readFileSync } from 'node:fs';
import { lightningDetails } from './lightning.mjs';

const root = new URL('../', import.meta.url);
const read = file => JSON.parse(readFileSync(new URL(file, root), 'utf8'));
const { version } = read('package.json'), release = read('src/release.json');
if (!/^\d+\.\d+\.\d+$/.test(version) || !/^\d{4}-\d{2}-\d{2}$/.test(release.date) || !Number.isFinite(Date.parse(release.date)) || !Array.isArray(release.changes) || !release.changes.length) throw new Error('Invalid release metadata');
export const RELEASE = Object.freeze({ version, date: release.date, changes: Object.freeze(release.changes) });
export const SUPPORT = Object.freeze(lightningDetails(read('src/support.json').lightningAddress));
export function releaseDate(locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${RELEASE.date}T12:00:00Z`));
}
