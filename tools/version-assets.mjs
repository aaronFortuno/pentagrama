import { readFile, writeFile, readdir } from 'node:fs/promises';
import { buildLocalizedPages } from './build-locales.mjs';
import { parseVersion } from './release-version.mjs';

// Keep the buildless site deployable as files, while invalidating cached module graphs.
const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
parseVersion(version);
async function sourceFiles(directory) {
  const entries = await readdir(new URL(directory, root), { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => entry.isDirectory() ? sourceFiles(`${directory}${entry.name}/`) : `${directory}${entry.name}`));
  return files.flat();
}
for (const file of [...await sourceFiles('docs/'), 'src/index.html']) {
  if (!/\.(html|js)$/.test(file)) continue;
  const path = new URL(file, root), source = await readFile(path, 'utf8');
  const updated = source.replace(/(['"])(\.{1,2}\/[\w./-]+\.(?:js|css))(?:\?v=[\w.-]+)?\1/g,
    (_, quote, asset) => `${quote}${asset}?v=${version}${quote}`);
  if (source !== updated) await writeFile(path, updated);
}
await buildLocalizedPages();
console.log(`Static assets versioned for ${version}`);
