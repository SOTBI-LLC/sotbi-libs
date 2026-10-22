/**
 * Generates ui/src/lucide-icons.css: the presentation Clarity gave to its
 * clr-icon/cds-icon elements, re-targeted at Lucide SVGs (`svg.lucide`).
 *
 * - Base host styles of the former ClrIcon (16px, vertical-align, size,
 *   status, direction) at zero specificity in the components layer, so
 *   /ui, application rules and Tailwind utilities all win.
 * - Every @clr/ui rule whose subject is an icon element, with the element
 *   replaced by `svg:where(.lucide)` (same specificity) and `fill` re-emitted
 *   as `color`, because Lucide strokes with currentColor.
 * - @clr/ui rules that set `fill` on a Clarity icon class (nav-icon, …),
 *   re-emitted as `color` for SVGs carrying that class.
 * Clarity attributes become data-* (`size` → `data-size`, …) and `[shape=…]`
 * becomes the Lucide icon class.
 *
 * Usage: node tools/generate-lucide-icon-styles.cjs && npx prettier --write ui/src/lucide-icons.css
 */
const fs = require('fs');
const postcss = require(require.resolve('postcss', { paths: [process.cwd()] }));
const parser = require(
  require.resolve('postcss-selector-parser', { paths: [process.cwd()] }),
);

const SOURCE = process.argv[2] ?? 'node_modules/@clr/ui/clr-ui.css';
const TARGET = process.argv[3] ?? 'ui/src/lucide-icons.css';
const ICON_TAGS = /^(cds-icon|clr-icon)$/;
const ICON_CLASSES = new Set([
  'nav-icon',
  'clr-validate-icon',
  'stack-block-caret',
  'clr-password-eye-icon',
]);
const DATA_ATTRS = new Set(['size', 'direction', 'status', 'inverse', 'flip']);
/** Clarity shapes addressed by @clr/ui selectors → Lucide icon classes. */
const SHAPE_CLASSES = {
  angle: ['chevron-up'],
  'angle-double': ['chevrons-up'],
  'window-close': ['x'],
  circle: ['circle'],
  'success-standard': ['circle-check'],
  'error-standard': ['circle-alert'],
};
const NUMERIC_SIZES = Array.from({ length: 57 }, (_, i) => i + 8);

const shapeClasses = (attr) => {
  if (attr.operator === '=') return SHAPE_CLASSES[attr.value] ?? null;
  if (attr.operator === '^=') {
    const found = Object.entries(SHAPE_CLASSES)
      .filter(([shape]) => shape.startsWith(attr.value))
      .flatMap(([, classes]) => classes);
    return found.length ? found : null;
  }
  return null;
};

/** Rewrites one compound selector; returns false when it cannot match Lucide. */
const rewriteCompound = (nodes, iconTag) => {
  let ok = true;
  for (const node of nodes) {
    node.walk?.((inner) => {
      if (inner.type === 'attribute') ok = rewriteAttribute(inner) && ok;
    });
    if (node.type === 'attribute') ok = rewriteAttribute(node) && ok;
  }
  if (iconTag) {
    iconTag.replaceWith(
      parser.tag({ value: 'svg' }),
      parser.pseudo({
        value: ':where',
        nodes: [
          parser.selector({ nodes: [parser.className({ value: 'lucide' })] }),
        ],
      }),
    );
  }
  return ok;
};

const rewriteAttribute = (attr) => {
  if (DATA_ATTRS.has(attr.attribute)) {
    attr.attribute = `data-${attr.attribute}`;
    return true;
  }
  if (attr.attribute !== 'shape') return true;
  const classes = shapeClasses(attr);
  if (!classes) return false;
  attr.replaceWith(
    parser.pseudo({
      value: ':is',
      nodes: classes.map((c) =>
        parser.selector({
          nodes: [parser.className({ value: `lucide-${c}` })],
        }),
      ),
    }),
  );
  return true;
};

const translateSelector = (selector) => {
  const kept = [];
  parser((sels) => {
    sels.each((sel) => {
      const nodes = sel.nodes;
      let i = nodes.length - 1;
      while (i >= 0 && nodes[i].type !== 'combinator') i--;
      const subject = nodes.slice(i + 1);
      const iconTag = subject.find(
        (n) => n.type === 'tag' && ICON_TAGS.test(n.value),
      );
      if (!iconTag) return;
      const ancestorsHaveIcon = nodes
        .slice(0, i + 1)
        .some((n) => n.type === 'tag' && ICON_TAGS.test(n.value));
      if (ancestorsHaveIcon) return;
      if (rewriteCompound(subject, iconTag)) kept.push(sel.toString().trim());
    });
  }).processSync(selector);
  return [...new Set(kept)];
};

const classFillSelector = (selector) => {
  const kept = [];
  parser((sels) => {
    sels.each((sel) => {
      const nodes = sel.nodes;
      let i = nodes.length - 1;
      while (i >= 0 && nodes[i].type !== 'combinator') i--;
      const subject = nodes.slice(i + 1);
      if (subject.some((n) => n.type === 'tag')) return;
      if (subject.some((n) => n.type === 'class' && ICON_CLASSES.has(n.value)))
        kept.push(`${sel.toString().trim()}:where(svg.lucide)`);
    });
  }).processSync(selector);
  return kept;
};

const base = `
@layer components {
:where(svg.lucide) {
  display: inline-block;
  box-sizing: border-box;
  height: var(--cds-global-space-7);
  width: var(--cds-global-space-7);
  min-height: var(--cds-global-space-7);
  min-width: var(--cds-global-space-7);
  margin: 0;
  vertical-align: middle;
  color: var(--sotbi-icon-color, currentColor);
  /* @clr/ui fills icons by class (.nav-icon, .clr-validate-icon, …); Lucide
     glyphs are outlines, so a filled <svg> turns them into solid shapes.
     Layered !important outranks every unlayered @clr/ui and app rule. */
  fill: none !important;
}
${['xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl']
  .map((size) => {
    const token = { sm: 's', md: 'm', lg: 'l', xxl: '2xl' }[size] ?? size;
    const value = `var(--clr-base-icon-size-${token})`;
    return `:where(svg.lucide[data-size*='${size}']) { height: ${value}; width: ${value}; min-height: ${value}; min-width: ${value}; }`;
  })
  .join('\n')}
${NUMERIC_SIZES.map((px) => {
  const value = `calc((${px} / var(--cds-global-base)) * 1rem)`;
  return `:where(svg.lucide[data-size='${px}']) { height: ${value}; width: ${value}; min-height: ${value}; min-width: ${value}; }`;
}).join('\n')}
:where(svg.lucide[data-status='success']) { --sotbi-icon-color: var(--cds-alias-status-success); }
:where(svg.lucide[data-status='danger']) { --sotbi-icon-color: var(--cds-alias-status-danger); }
:where(svg.lucide[data-status='warning']) { --sotbi-icon-color: var(--cds-alias-status-warning-dark); }
:where(svg.lucide[data-status='info']) { --sotbi-icon-color: var(--cds-alias-status-info); }
:where(svg.lucide[data-status='neutral']) { --sotbi-icon-color: var(--cds-alias-status-neutral); }
:where(svg.lucide[data-direction='down']) { transform: rotate(180deg); }
:where(svg.lucide[data-direction='right']) { transform: rotate(90deg); }
:where(svg.lucide[data-direction='left']) { transform: rotate(270deg); }
}
`;

const root = postcss.parse(fs.readFileSync(SOURCE, 'utf8'));
const out = postcss.root();
root.walkRules((rule) => {
  const parents = [];
  for (let p = rule.parent; p && p.type === 'atrule'; p = p.parent)
    parents.unshift(p);
  if (parents.some((p) => p.name === 'keyframes')) return;
  const fill = rule.nodes
    .filter((n) => n.type === 'decl' && n.prop === 'fill')
    .pop();
  const translated = translateSelector(rule.selector);
  const copies = [];
  if (translated.length) {
    const copy = postcss.rule({ selector: translated.join(',\n') });
    for (const decl of rule.nodes.filter((n) => n.type === 'decl')) {
      copy.append(
        decl.prop === 'fill'
          ? { prop: 'color', value: decl.value, important: decl.important }
          : decl.clone(),
      );
    }
    copies.push(copy);
  }
  if (fill) {
    const byClass = classFillSelector(rule.selector);
    if (byClass.length) {
      const copy = postcss.rule({ selector: byClass.join(',\n') });
      copy.append({
        prop: 'color',
        value: fill.value,
        important: fill.important,
      });
      copies.push(copy);
    }
  }
  if (!copies.length) return;
  let target = out;
  for (const p of parents) {
    let at = target.nodes.find(
      (n) => n.type === 'atrule' && n.name === p.name && n.params === p.params,
    );
    if (!at) {
      at = postcss.atRule({ name: p.name, params: p.params });
      target.append(at);
    }
    target = at;
  }
  copies.forEach((c) => target.append(c));
});

fs.writeFileSync(
  TARGET,
  `/* Generated by tools/generate-lucide-icon-styles.cjs from @clr/ui — do not edit. */\n${base}\n${out.toString()}\n`,
);
