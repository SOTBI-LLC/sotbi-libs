import assert from 'node:assert/strict';
import test from 'node:test';
import stylelint from 'stylelint';
import config from '../../dist/stylelint-config/index.mjs';

async function lint(code, extra = {}) {
  return (
    await stylelint.lint({
      code,
      config: { ...config, ...extra },
      codeFilename: 'consumer/new-feature.css',
    })
  ).results[0].warnings;
}

test('portable package enforces strict rules in a new consumer', async () => {
  const warnings = await lint(
    '.sample {\n  color: #fff;\n  display: block !important;\n}\n',
  );
  for (const rule of ['color-no-hex', 'declaration-no-important']) {
    assert.ok(warnings.some((w) => w.rule === rule && w.severity === 'error'));
  }
});

test('Tailwind and Angular syntax are understood without allowing apply or deep overrides', async () => {
  const valid = await lint(
    '@theme {\n  --spacing-control: 1rem;\n}\n\n:host {\n  display: block;\n}\n',
  );
  assert.deepEqual(valid, []);
  for (const [code, rule] of [
    ['.sample {\n  @apply flex;\n}\n', 'at-rule-disallowed-list'],
    [
      ':host ::ng-deep .sample {\n  display: block;\n}\n',
      'selector-pseudo-element-disallowed-list',
    ],
  ]) {
    assert.ok(
      (await lint(code)).some((w) => w.rule === rule && w.severity === 'error'),
    );
  }
});

test('consumer can allow color literals specifically for its token source', async () => {
  const warnings = await lint(':root {\n  --color-brand: #fff;\n}\n', {
    rules: { ...config.rules, 'color-no-hex': null },
  });
  assert.deepEqual(warnings, []);
});
