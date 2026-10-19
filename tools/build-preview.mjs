import { cp, mkdir, readFile, writeFile, rm, lstat, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = path.resolve(root, 'dist');
const marker = '.pentagrama-preview.json';
async function htmlFiles(directory) {
  const files = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(files.map(file => file.isDirectory() ? htmlFiles(path.join(directory, file.name)) : file.name.endsWith('.html') ? path.join(directory, file.name) : []))).flat();
}

export async function buildPreview() {
  // Only replace our generated output, never an arbitrary pre-existing folder.
  if (path.dirname(target) !== path.resolve(root) || path.basename(target) !== 'dist') throw new Error('Unsafe preview output');
  const existing = await lstat(target).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (existing) {
    if (!existing.isDirectory() || existing.isSymbolicLink()) throw new Error('Unsafe preview output');
    const previous = JSON.parse(await readFile(path.join(target, marker), 'utf8'));
    if (previous.generator !== 'pentagrama-preview') throw new Error('Preview output is not owned by this builder');
    await rm(target, { recursive: true });
  }
  await mkdir(target);
  await cp(path.join(root, 'docs'), target, { recursive: true });
  await rm(path.join(target, 'CNAME'), { force: true });
  await rm(path.join(target, 'sitemap.xml'), { force: true });
  for (const file of await htmlFiles(target)) {
    let html = await readFile(file, 'utf8');
    html = html.replace('<head>', '<head><meta name="robots" content="noindex, nofollow">');
    html = html.replace(/<meta name="umami-website-id"[^>]*>/g, '');
    html = html.replaceAll('https://github.com/aaronFortuno/pentagrama/blob/main/CHANGELOG.md', 'https://github.com/aaronFortuno/pentagrama/blob/codex/v2-modular-engine/CHANGELOG.md');
    await writeFile(file, html);
  }
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const provenance = { generator: 'pentagrama-preview', version: pkg.version, source: pkg.repository.url, branch: 'codex/v2-modular-engine' };
  await writeFile(path.join(target, marker), JSON.stringify(provenance, null, 2) + '\n');
  await writeFile(path.join(target, '.nojekyll'), '');
  await cp(path.join(root, 'LICENSE'), path.join(target, 'LICENSE'));
  await writeFile(path.join(target, 'README.md'), `# Pentagrama · experimental preview\n\nVersion: ${pkg.version}\n\nPublished artifact from [the v2 source branch](https://github.com/aaronFortuno/pentagrama/tree/codex/v2-modular-engine). Development, issues and contributions belong in the source repository.\n\nProduction remains at https://pentagrama.page/. This preview has no custom domain or production analytics and requests no search indexing.\n\nLicensed under [GNU GPL v3](LICENSE). Third-party notices are preserved in vendor/.\n`);
  await writeFile(path.join(target, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(`Preview package: ${await buildPreview()}`);
