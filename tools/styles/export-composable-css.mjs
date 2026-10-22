import { readFile, writeFile } from 'node:fs/promises';
import postcss from 'postcss';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  throw new Error('Usage: export-composable-css.mjs <input.css> <output.css>');
}

const root = postcss.parse(await readFile(input, 'utf8'), { from: input });
// The opt-in export delegates resets and layer ordering to the consuming app.
root.walkAtRules('layer', (layer) => {
  if (layer.params.trim() === 'base') layer.remove();
});
const layers = [];
root.walkAtRules('layer', (layer) => layers.push(layer));
for (const layer of layers.reverse()) {
  if (layer.nodes) layer.replaceWith(...layer.nodes);
  else layer.remove();
}
root.walkDecls((declaration) => {
  declaration.important = false;
});
await writeFile(output, `${root.toString().trimEnd()}\n`);
