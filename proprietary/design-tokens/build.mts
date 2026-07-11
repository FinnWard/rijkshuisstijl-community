import { existsSync, mkdirSync } from 'node:fs';
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { posix } from 'node:path';
import StyleDictionary from 'style-dictionary';
import type { TransformedToken } from 'style-dictionary';

import { fixCSSFile } from './src/transforms/css/cssFixers.mts';
import {
  buildChunkManifest,
  buildChunkMap,
  chunkForTokenPath,
  type ChunkManifest,
  type ChunkMap,
  type TokenSets,
} from './src/transforms/splitTokens/chunk-map.mts';
import { registerTokenStudioTransformGroup } from './src/transforms/styleDictonary/styleDictionaryTransforms.mts';

// Will take the theme name and remove all spaces and make it lowercase
const normalizeThemeName = (name: string): string => {
  return name.toLowerCase().replaceAll(/\s+/g, '');
};

const removeUnitlessLineHeightTransform = () => {
  // During update to W3C DTCG format, we found that the tokens-studio transformGroup
  // includes the transform "ts/size/lineheight" which transforms line-height token values declared with % into a unitless value.
  // This caused minor UI changes in many of our components. We decided that this is not something we want to have happen automatically.
  // Therefore we remove this specific transform from the transformGroup before building.
  const indexOfLineHeightTransform =
    StyleDictionary.hooks.transformGroups['tokens-studio'].indexOf('ts/size/lineheight');
  if (indexOfLineHeightTransform !== -1) {
    StyleDictionary.hooks.transformGroups['tokens-studio'].splice(indexOfLineHeightTransform, 1);
  }
};

StyleDictionary.registerAction({
  name: 'fixCSSTokens',
  do: async function (_dictionary, config) {
    const buildPath = config.buildPath || 'dist/';
    const files = config.files || [];
    // TS allows roundTo(), exponentiation (^) and basic calculations (without `calc()`) in their values, but these are not valid CSS.
    for (const file of files) {
      if (!file.destination) {
        throw new Error(`Expected a destination for build file in "${buildPath}".`);
      }

      const filePath = posix.join(buildPath, file.destination);
      console.log('🔧 fixing css:', filePath);
      await fixCSSFile(filePath);
    }
  },
  // No undo action available - files are deleted during cleanup.
  undo: function () {},
});

// Custom header to add generation date
StyleDictionary.registerFileHeader({
  name: 'nlds-rhc-header',
  fileHeader: function (defaultMessage = []) {
    return [...defaultMessage, `Generated on ${new Date().toUTCString()}`];
  },
});

// register token-studio transforms
registerTokenStudioTransformGroup(StyleDictionary);

// Get the platforms config
const getPlatformsConfig = (buildPath: string, themeName: string, chunks: ChunkInfo) => {
  return {
    javascript: {
      transformGroup: 'tokens-studio',
      transforms: ['name/camel'],
      buildPath,
      options: {
        fileHeader: 'nlds-rhc-header',
      },
      files: [
        {
          format: 'typescript/es6-declarations',
          destination: 'index.d.ts',
        },
        {
          format: 'typescript/module-declarations',
          destination: 'tokens.d.ts',
        },
        {
          destination: 'index.js',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.js',
          format: 'javascript/module',
        },
        {
          destination: 'index.tokens.json',
          format: 'json/nested',
        },
        {
          destination: 'index.json',
          format: 'json/flat',
        },
      ],
    },
    web: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      buildPath,
      actions: ['fixCSSTokens'],
      options: {
        fileHeader: 'nlds-rhc-header',
        outputReferences: true,
      },
      files: [
        {
          destination: 'root.css',
          format: 'css/variables',
        },
        {
          destination: 'index.css',
          format: 'css/variables',
          options: {
            selector: `.${themeName}`,
          },
        },
        {
          destination: '_variables.scss',
          format: 'scss/variables',
        },
        // Chunked token files: brand, common, and one file per component. Together they contain
        // the same custom properties as index.css, so consumers can load only what they use.
        ...chunks.manifest.chunks.map((chunk) => ({
          destination: `tokens/${chunk}.css`,
          format: 'css/variables',
          filter: (token: TransformedToken) => chunkForTokenPath(chunks.map, token.path) === chunk,
          options: {
            selector: `.${themeName}`,
          },
        })),
      ],
    },
  };
};

interface ChunkInfo {
  map: ChunkMap;
  manifest: ChunkManifest;
}

const getChunkInfo = (tokensBySet: TokenSets): ChunkInfo => ({
  map: buildChunkMap(tokensBySet),
  manifest: buildChunkManifest(tokensBySet),
});

const CUSTOM_PROPERTY_PATTERN = /--[\w-]+(?=\s*:)/g;

/**
 * Guards the "chunks are the monolith, split up" invariant: every custom property in index.css
 * must appear in exactly one tokens/*.css chunk, and chunks must not contain extras. Fails the
 * build loudly instead of silently dropping tokens that fall outside the chunk map.
 */
const verifyChunks = async (buildPath: string, manifest: ChunkManifest) => {
  const monolith = await readFile(posix.join(buildPath, 'index.css'), 'utf8');
  const monolithProperties = new Set(monolith.match(CUSTOM_PROPERTY_PATTERN) ?? []);

  const chunkProperties = new Set<string>();
  const duplicates = new Set<string>();
  for (const chunk of manifest.chunks) {
    const css = await readFile(posix.join(buildPath, 'tokens', `${chunk}.css`), 'utf8');
    for (const property of css.match(CUSTOM_PROPERTY_PATTERN) ?? []) {
      if (chunkProperties.has(property)) duplicates.add(property);
      chunkProperties.add(property);
    }
  }

  const missing = [...monolithProperties].filter((property) => !chunkProperties.has(property));
  const extra = [...chunkProperties].filter((property) => !monolithProperties.has(property));
  if (missing.length > 0 || extra.length > 0 || duplicates.size > 0) {
    throw new Error(
      `Token chunks in "${posix.join(buildPath, 'tokens')}" do not add up to index.css.` +
        (missing.length > 0 ? ` Missing from chunks: ${missing.join(', ')}.` : '') +
        (extra.length > 0 ? ` Not in index.css: ${extra.join(', ')}.` : '') +
        (duplicates.size > 0 ? ` Duplicated across chunks: ${[...duplicates].join(', ')}.` : ''),
    );
  }
};

const writeChunkManifest = async (buildPath: string, manifest: ChunkManifest) => {
  await writeFile(posix.join(buildPath, 'tokens', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
};

const darkModeCSS = await readFile('./src/dark-mode.css', 'utf8');
const fluidCSS = await readFile('./src/fluid.css', 'utf8');

// This will build the base theme lintblauw
async function buildBaseTokens() {
  // The chunk map needs the token-set names, which the tokens-studio preprocessor strips.
  const baseTokensBySet: TokenSets = JSON.parse(await readFile('./src/generated/base.tokens.json', 'utf8'));
  const chunks = getChunkInfo(baseTokensBySet);

  const config = getPlatformsConfig('dist/', 'rhc-theme', chunks);
  const StyleDictionaryBase = new StyleDictionary({
    log: { verbosity: 'verbose' },
    source: ['./src/**/base.tokens.json'],
    preprocessors: ['tokens-studio'],
    platforms: {
      ...config,
    },
  });
  await StyleDictionaryBase.hasInitialized;

  await StyleDictionaryBase.cleanAllPlatforms();
  await StyleDictionaryBase.buildAllPlatforms();

  await verifyChunks('dist/', chunks.manifest);
  await writeChunkManifest('dist/', chunks.manifest);

  await appendFile(`dist/index.css`, darkModeCSS);
  await appendFile(`dist/index.css`, fluidCSS);
  // dark mode remaps the brand color ramps; fluid defines the viewport plumbing common relies on
  await appendFile(`dist/tokens/brand.css`, darkModeCSS);
  await appendFile(`dist/tokens/common.css`, fluidCSS);
}

// This will build the themes
async function buildThemes() {
  const themesJson = await readFile('./src/generated/themes.json', 'utf-8');
  const themes: Record<string, { tokens: unknown }> = JSON.parse(themesJson);

  // Process each theme separately
  for (const [theme, themeData] of Object.entries(themes)) {
    const themeName = normalizeThemeName(theme);
    const themesDir = `./src/generated/${themeName}`;

    // Create the theme directory if it doesn't exist
    if (!existsSync(themesDir)) {
      mkdirSync(themesDir, { recursive: true });
    }

    // Write individual theme tokens
    await writeFile(posix.join(themesDir, `tokens.json`), JSON.stringify(themeData.tokens, null, 2));

    const chunks = getChunkInfo(themeData.tokens as TokenSets);
    const config = getPlatformsConfig(`dist/${themeName}/`, themeName, chunks);
    // Create a separate Style Dictionary instance for each theme
    const StyleDictionaryTheme = new StyleDictionary({
      log: { verbosity: 'verbose' },
      source: [`./src/generated/${themeName}/tokens.json`],
      preprocessors: ['tokens-studio'],
      platforms: {
        ...config,
      },
    });
    await StyleDictionaryTheme.hasInitialized;

    // Build this specific theme
    await StyleDictionaryTheme.cleanAllPlatforms();
    await StyleDictionaryTheme.buildAllPlatforms();

    await verifyChunks(`dist/${themeName}/`, chunks.manifest);
    await writeChunkManifest(`dist/${themeName}/`, chunks.manifest);

    // Append the fluid and dark mode CSS, with the appropriate class name
    await appendFile(
      `dist/${themeName}/index.css`,
      `${darkModeCSS}\n${fluidCSS}`.replaceAll('.rhc-theme', `.${themeName}`),
    );
    // dark mode remaps the brand color ramps; fluid defines the viewport plumbing common relies on
    await appendFile(`dist/${themeName}/tokens/brand.css`, darkModeCSS.replaceAll('.rhc-theme', `.${themeName}`));
    await appendFile(`dist/${themeName}/tokens/common.css`, fluidCSS.replaceAll('.rhc-theme', `.${themeName}`));
  }
}

async function build() {
  removeUnitlessLineHeightTransform(); // This needs to happen before building anything
  await buildBaseTokens();
  await buildThemes();
}

await build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
