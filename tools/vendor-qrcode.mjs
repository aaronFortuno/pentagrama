import { mkdir, writeFile } from 'node:fs/promises';

const repository = 'kazuhikoarase/qrcode-generator';
const response = await fetch(`https://api.github.com/repos/${repository}/commits/master`, { headers: { 'User-Agent': 'Pentagrama' } });
if (!response.ok) throw new Error(`GitHub: ${response.status}`);
const { sha } = await response.json();
if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid revision');
const raw = `https://raw.githubusercontent.com/${repository}/${sha}`;
const files = [['js/dist/qrcode.js', 'tools/vendor/qrcode.cjs'], ['LICENSE', 'docs/vendor/qrcode-LICENSE.txt']];
for (const [source, target] of files) {
  const result = await fetch(`${raw}/${source}`);
  if (!result.ok) throw new Error(`${source}: ${result.status}`);
  const path = new URL(`../${target}`, import.meta.url);
  await mkdir(new URL('./', path), { recursive: true });
  await writeFile(path, await result.text());
}
await writeFile(new URL('./vendor/qrcode-source.json', import.meta.url), JSON.stringify({ repository: `https://github.com/${repository}`, revision: sha, file: 'js/dist/qrcode.js', license: 'MIT', use: 'Build-time generation only; no library is loaded in the browser' }, null, 2) + '\n');
console.log(`Vendored build-time QR encoder from ${sha}`);
