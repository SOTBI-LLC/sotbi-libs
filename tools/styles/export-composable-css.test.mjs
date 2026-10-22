import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import postcss from 'postcss';

const script = fileURLToPath(
  new URL('./export-composable-css.mjs', import.meta.url),
);

test('opt-in CSS drops reset and priority constraints while retaining usable styles', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sotbi-css-'));
  try {
    const input = join(directory, 'styles.css');
    const output = join(directory, 'styles-composable.css');
    const legacy = `/*! library license */
      @layer theme, base, components, utilities;
      @layer base { *,::before { margin: 0; padding: 0; } }
      @layer theme { :root { --spacing: .25rem; } }
      @layer components {
        .control { height: 1rem !important; --label: "!important"; }
        @media (width > 40rem) {
          @layer compact { .control { height: 2rem !important; } }
        }
      }
      @layer utilities { .flex { display: flex; } }
      @layer properties { @supports (color: red) { * { --tw-border-style: solid; } } }
      @property --tw-border-style { syntax: "*"; inherits: false; initial-value: solid; }
    `;
    await writeFile(input, legacy);
    execFileSync(process.execPath, [script, input, output]);
    const css = postcss.parse(await readFile(output, 'utf8'));
    const selectors = [];
    css.walkRules((rule) => selectors.push(rule.selector));
    assert.deepEqual(selectors, [
      ':root',
      '.control',
      '.control',
      '.flex',
      '*',
    ]);
    const remainingLayers = [];
    css.walkAtRules('layer', (layer) => remainingLayers.push(layer));
    assert.equal(remainingLayers.length, 0);
    css.walkDecls((declaration) => assert.ok(!declaration.important));
    const values = [];
    css.walkDecls('height', (declaration) => values.push(declaration.value));
    assert.deepEqual(values, ['1rem', '2rem']);
    assert.match(css.toString(), /--label: "!important"/);
    assert.match(css.toString(), /@property --tw-border-style/);
    assert.match(css.toString(), /@media/);
    assert.match(css.toString(), /@supports/);
    assert.match(css.toString(), /library license/);
    assert.equal(await readFile(input, 'utf8'), legacy);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
