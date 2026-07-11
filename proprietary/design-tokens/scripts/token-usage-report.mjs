/**
 * Report-only analysis of which design tokens are actually consumed, as groundwork for pruning.
 *
 * "Used" means one of:
 * - the token's CSS custom property (--rhc-*, --utrecht-*, --nl-*, --todo-*) occurs in consumer
 *   code: this monorepo's components-css / components-react / storybook sources, or the CSS of
 *   the @utrecht / @nl-design-system-candidate / @amsterdam packages that our component CSS
 *   builds on (they read the --utrecht- and --nl- properties our tokens set);
 * - the token's camelCase JavaScript export name occurs in this monorepo's TS/TSX sources
 *   (e.g. Storybook importing named exports from dist/index.js);
 * - a used token's value references it, transitively (a component token that is used keeps the
 *   common/brand tokens behind it alive).
 *
 * Everything else is a *candidate* for pruning — this script never deletes anything. Run a
 * build first (`pnpm build`), then `pnpm report:usage`. The report is written to
 * dist/token-usage.report.md and dist/token-usage.report.json.
 */

import { existsSync } from 'node:fs';
import { readdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const PACKAGE_ROOT = resolve(import.meta.dirname, '..');
const REPO_ROOT = resolve(PACKAGE_ROOT, '../..');
const DIST = join(PACKAGE_ROOT, 'dist');

const SOURCE_SCAN_ROOTS = [
  { root: join(REPO_ROOT, 'packages/components-css'), extensions: ['.scss', '.css'] },
  { root: join(REPO_ROOT, 'packages/components-react'), extensions: ['.ts', '.tsx', '.scss', '.css'] },
  { root: join(REPO_ROOT, 'packages/storybook'), extensions: ['.ts', '.tsx', '.mdx', '.scss', '.css'] },
];

// The vendor CSS that consumes the --utrecht-*/--nl-* properties our component tokens set.
// pnpm gives these packages their own node_modules with symlinks to the real packages.
const VENDOR_SCAN_ROOTS = [
  join(REPO_ROOT, 'packages/components-css/library-css/node_modules/@utrecht'),
  join(REPO_ROOT, 'packages/components-css/library-css/node_modules/@nl-design-system-candidate'),
  join(REPO_ROOT, 'packages/components-css/library-css/node_modules/@amsterdam'),
  join(REPO_ROOT, 'packages/storybook/node_modules/@utrecht'),
  join(REPO_ROOT, 'packages/storybook/node_modules/@nl-design-system-candidate'),
  join(REPO_ROOT, 'packages/storybook/node_modules/@amsterdam'),
];

const CUSTOM_PROPERTY = /--[\w-]+/g;
const WHITESPACE = new Set([' ', '\t', '\n', '\r']);

/**
 * Yields `[property, value]` for every `--property: value` declaration. A custom-property
 * occurrence only counts as a declaration when the next non-whitespace character is a colon,
 * which distinguishes definitions from `var(--x)` usages and `@property --x` rules.
 */
function* customPropertyDeclarations(css) {
  for (const match of css.matchAll(CUSTOM_PROPERTY)) {
    let index = match.index + match[0].length;
    while (index < css.length && WHITESPACE.has(css[index])) index += 1;
    if (css[index] !== ':') continue;
    let end = index + 1;
    while (end < css.length && css[end] !== ';' && css[end] !== '}') end += 1;
    yield [match[0], css.slice(index + 1, end)];
  }
}

/** JS export names are the camelCase of the kebab property: --rhc-color-zwart -> rhcColorZwart. */
const toCamel = (property) =>
  property
    .slice(2)
    .split('-')
    .filter(Boolean)
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');

/** Recursively collects file paths, following symlinks (pnpm node_modules), guarding cycles. */
async function collectFiles(root, extensions, seenRealPaths = new Set()) {
  if (!existsSync(root)) return [];
  const real = await realpath(root);
  if (seenRealPaths.has(real)) return [];
  seenRealPaths.add(real);

  const files = [];
  for (const entry of await readdir(real, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const path = join(real, entry.name);
    if (entry.isDirectory() || entry.isSymbolicLink()) {
      files.push(...(await collectFiles(path, extensions, seenRealPaths)));
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      files.push(path);
    }
  }
  return files;
}

/** All defined tokens + the alias graph (property -> properties its value references). */
async function readDefinedTokens() {
  const indexCSS = await readFile(join(DIST, 'index.css'), 'utf8');
  const references = new Map();
  for (const [property, value] of customPropertyDeclarations(indexCSS)) {
    const existing = references.get(property) ?? new Set();
    for (const referenced of value.match(CUSTOM_PROPERTY) ?? []) existing.add(referenced);
    references.set(property, existing);
  }
  return references;
}

/** Which chunk defines which property, for grouping the report. */
async function readPropertyChunks() {
  const propertyChunk = new Map();
  const manifest = JSON.parse(await readFile(join(DIST, 'tokens/manifest.json'), 'utf8'));
  for (const chunk of manifest.chunks) {
    const chunkCSS = await readFile(join(DIST, 'tokens', `${chunk}.css`), 'utf8');
    for (const [property] of customPropertyDeclarations(chunkCSS)) {
      if (!propertyChunk.has(property)) propertyChunk.set(property, chunk);
    }
  }
  return propertyChunk;
}

/** Scans consumers for custom-property occurrences; TS/TSX/MDX sources are kept for JS-name checks. */
async function scanConsumers() {
  const usedProperties = new Set();
  const scriptSources = [];
  let scannedFileCount = 0;

  const scanRoots = [
    ...SOURCE_SCAN_ROOTS,
    ...VENDOR_SCAN_ROOTS.map((root) => ({ root, extensions: ['.css', '.scss'] })),
  ];
  for (const { root, extensions } of scanRoots) {
    for (const file of await collectFiles(root, extensions)) {
      // dist/generated token output inside the scanned trees is the producer, not a consumer
      if (file.includes('/design-tokens/')) continue;
      const content = await readFile(file, 'utf8');
      scannedFileCount += 1;
      for (const property of content.match(CUSTOM_PROPERTY) ?? []) usedProperties.add(property);
      if (['.ts', '.tsx', '.mdx'].some((extension) => file.endsWith(extension))) {
        scriptSources.push(content);
      }
    }
  }
  return { usedProperties, scriptSource: scriptSources.join('\n'), scannedFileCount };
}

/** Directly used tokens, then transitive closure over the alias graph. */
function computeUsedTokens(references, usedProperties, scriptSource) {
  const used = new Set(
    [...references.keys()].filter(
      (property) => usedProperties.has(property) || scriptSource.includes(toCamel(property)),
    ),
  );
  const queue = [...used];
  while (queue.length > 0) {
    for (const referenced of references.get(queue.pop()) ?? []) {
      if (references.has(referenced) && !used.has(referenced)) {
        used.add(referenced);
        queue.push(referenced);
      }
    }
  }
  return used;
}

function groupByChunk(properties, propertyChunk) {
  const byChunk = {};
  for (const property of properties) {
    const chunk = propertyChunk.get(property) ?? 'unknown';
    byChunk[chunk] ??= [];
    byChunk[chunk].push(property);
  }
  return byChunk;
}

function renderMarkdown(report) {
  return [
    '# Design-token usage report',
    '',
    `Generated ${report.generatedAt} from ${report.scannedFileCount} consumer files.`,
    '',
    `- defined custom properties: **${report.totals.defined}**`,
    `- used (directly or via alias chain): **${report.totals.used}**`,
    `- candidates for pruning: **${report.totals.candidateUnused}**`,
    '',
    '> Candidates only — verify before removing. This scan cannot see external consumers of the',
    '> published package, and Storybook documentation pages render the full token JSON regardless.',
    '',
    ...Object.entries(report.candidateUnusedByChunk).flatMap(([chunk, properties]) => [
      `## ${chunk} (${properties.length})`,
      '',
      ...properties.map((property) => `- \`${property}\``),
      '',
    ]),
  ].join('\n');
}

async function main() {
  if (!existsSync(join(DIST, 'index.css'))) {
    console.error('dist/index.css not found — run `pnpm build` first.');
    process.exitCode = 1;
    return;
  }

  const references = await readDefinedTokens();
  const propertyChunk = await readPropertyChunks();
  const { usedProperties, scriptSource, scannedFileCount } = await scanConsumers();
  const used = computeUsedTokens(references, usedProperties, scriptSource);

  const unused = [...references.keys()].filter((property) => !used.has(property)).sort();
  const byChunk = groupByChunk(unused, propertyChunk);

  const report = {
    generatedAt: new Date().toISOString(),
    scannedFileCount,
    totals: { defined: references.size, used: used.size, candidateUnused: unused.length },
    candidateUnusedByChunk: Object.fromEntries(Object.entries(byChunk).sort(([a], [b]) => a.localeCompare(b))),
  };

  await writeFile(join(DIST, 'token-usage.report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(join(DIST, 'token-usage.report.md'), `${renderMarkdown(report)}\n`);

  console.log(
    `Scanned ${scannedFileCount} files: ${report.totals.used}/${report.totals.defined} tokens used, ` +
      `${report.totals.candidateUnused} pruning candidates.`,
  );
  console.log('Report written to dist/token-usage.report.md and dist/token-usage.report.json');
  const summary = Object.entries(report.candidateUnusedByChunk)
    .map(([chunk, properties]) => `${chunk}: ${properties.length}`)
    .join(', ');
  if (summary) console.log(`Candidates per chunk — ${summary}`);
}

await main();
