#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const OVERVIEW_FILE = 'dist/component-overview.json';
const OUTPUT_FILE = 'dist/component-overviews.json';

const collectOverviews = async () => {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
  const dependencyNames = Object.keys(packageJson.dependencies ?? {}).filter((name) =>
    /^@rijkshuisstijl-community\/.+-css$/.test(name),
  );

  const require = createRequire(path.resolve('package.json'));
  const overviews = {};

  for (const dependencyName of dependencyNames) {
    let packagePath;
    try {
      packagePath = require.resolve(`${dependencyName}/package.json`);
    } catch {
      console.warn(`⚠️ Could not resolve ${dependencyName}, skipping.`);
      continue;
    }

    const overviewPath = path.join(path.dirname(packagePath), OVERVIEW_FILE);
    if (!existsSync(overviewPath)) {
      continue;
    }

    const overview = JSON.parse(await readFile(overviewPath, 'utf8'));
    overviews[overview.component] = overview;
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(overviews, null, 2)}\n`);

  console.log(`✨ Collected ${Object.keys(overviews).length} component overviews into ${OUTPUT_FILE}`);
};

await collectOverviews();
