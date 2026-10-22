import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

// A pinned, integrity-checked browser build. No runtime CDN requests.
const version = '0.8.2', integrity = 'cPJU47OaAoCbg0pBvzsgpTPhmhqI5eJjh/JIu8tPj5q+T7iLvW/JAYUqmE7KOB4R1ZyEhzBaIQpQpardBF5z8A==';
const response = await fetch(`https://registry.npmjs.org/fflate/-/fflate-${version}.tgz`, { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error('Unable to fetch fflate');
const archive = Buffer.from(await response.arrayBuffer());
if (createHash('sha512').update(archive).digest('base64') !== integrity) throw new Error('fflate integrity mismatch');
const tar = gunzipSync(archive), files = new Map();
for (let offset = 0; offset + 512 <= tar.length;) {
  const name = tar.toString('utf8', offset, offset + 100).replace(/\0.*/, '');
  if (!name) break;
  const size = parseInt(tar.toString('ascii', offset + 124, offset + 136).replace(/\0.*/, '').trim(), 8);
  files.set(name, tar.subarray(offset + 512, offset + 512 + size));
  offset += 512 + Math.ceil(size / 512) * 512;
}
for (const [name, output] of [['package/esm/browser.js', 'fflate.js'], ['package/LICENSE', 'fflate-LICENSE.txt']]) {
  if (!files.has(name)) throw new Error('Missing fflate file');
  await writeFile(new URL('../docs/vendor/' + output, import.meta.url), files.get(name));
}
console.log(`Vendored fflate ${version}, verified SHA-512`);
