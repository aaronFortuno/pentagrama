import { readFile, writeFile, readdir } from 'node:fs/promises';

// Keep the buildless site deployable as files, while invalidating cached module graphs.
const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Expected a release version');
for (const file of await readdir(new URL('docs/', root))) {
  if (!/\.(html|js)$/.test(file)) continue;
  const path = new URL(`docs/${file}`, root), source = await readFile(path, 'utf8');
  const updated = source.replace(/(['"])(\.\/[\w./-]+\.(?:js|css))(?:\?v=[\w.-]+)?\1/g,
    (_, quote, asset) => `${quote}${asset}?v=${version}${quote}`);
  if (source !== updated) await writeFile(path, updated);
}
console.log(`Static assets versioned for ${version}`);
