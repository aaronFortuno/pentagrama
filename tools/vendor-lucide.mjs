import { mkdir, writeFile } from 'node:fs/promises';

// Download only official static SVG paths, pinned to one upstream commit.
const repository = 'https://api.github.com/repos/lucide-icons/lucide';
let sha = process.argv[2];
if (!sha) {
  const commitResponse = await fetch(`${repository}/commits/main`, { headers: { 'User-Agent': 'Pentagrama' } });
  if (!commitResponse.ok) throw new Error(`Lucide commit: ${commitResponse.status}`);
  ({ sha } = await commitResponse.json());
}
if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid upstream commit');
const raw = `https://raw.githubusercontent.com/lucide-icons/lucide/${sha}`;
const names = ['printer', 'copy', 'plus', 'minus', 'fullscreen', 'chevron-left', 'chevron-down', 'x', 'arrow-up', 'arrow-down', 'trash', 'share-2', 'save', 'rotate-ccw', 'external-link', 'rectangle-vertical', 'rectangle-horizontal', 'languages', 'check', 'undo-2', 'redo-2'];
const entries = await Promise.all(names.map(async name => {
  const response = await fetch(`${raw}/icons/${name}.svg`);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  const svg = await response.text(), body = /<svg\b[^>]*>([\s\S]*?)<\/svg>/.exec(svg)?.[1]?.trim();
  if (!body || /<(?!\/?(?:path|rect|circle|line|polyline|polygon|ellipse)\b)|\bon\w+\s*=|href\s*=/i.test(body)) throw new Error(`Unexpected SVG: ${name}`);
  return [name, body.replace(/\s*\n\s*/g, '')];
}));
const licenseResponse = await fetch(`${raw}/LICENSE`);
if (!licenseResponse.ok) throw new Error(`License: ${licenseResponse.status}`);
const directory = new URL('../docs/vendor/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('lucide.js', directory), `// Lucide static SVG subset. ISC / MIT; see lucide-LICENSE.txt.\n// Source: https://github.com/lucide-icons/lucide/tree/${sha}/icons\nexport const icons = Object.freeze(${JSON.stringify(Object.fromEntries(entries), null, 2)});\n`);
await writeFile(new URL('lucide-LICENSE.txt', directory), await licenseResponse.text());
console.log(`Vendored ${entries.length} Lucide icons from ${sha}`);
