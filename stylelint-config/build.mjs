import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const dest = new URL('../dist/stylelint-config/', root);
await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(new URL('src/index.mjs', root), new URL('index.mjs', dest));
await cp(new URL('README.md', root), new URL('README.md', dest));
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
pkg.exports = { '.': './index.mjs' };
pkg.files = ['index.mjs', 'README.md'];
await writeFile(
  new URL('package.json', dest),
  JSON.stringify(pkg, null, 2) + '\n',
);
