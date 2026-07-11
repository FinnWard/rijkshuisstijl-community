import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';

import type { ChunkManifest } from './src/transforms/splitTokens/chunk-map.mts';

/**
 * Integration tests over the built dist/ output. They guard the chunked token files:
 * - the chunks together contain exactly the custom properties of the monolithic index.css
 * - every var() referenced inside a chunk resolves within brand + common + the chunk itself +
 *   its manifest-declared dependencies, so loading those files is always enough. When a new
 *   Figma export introduces a cross-component alias, this fails until the manifest (generated
 *   from the token sets by chunk-map.mts) knows about it.
 */

const DIST = new URL('./dist/', import.meta.url);

const definedProperties = (css: string): Set<string> => new Set(css.match(/--[\w-]+(?=\s*:)/g) ?? []);
const referencedProperties = (css: string): Set<string> => new Set(css.match(/(?<=var\(\s*)--[\w-]+/g) ?? []);

describe.skipIf(!existsSync(DIST))('dist token chunks (requires a completed build)', () => {
  test('chunks add up to the monolith and stay reference-closed', async () => {
    const manifest: ChunkManifest = JSON.parse(await readFile(new URL('tokens/manifest.json', DIST), 'utf8'));
    expect(manifest.chunks.length).toBeGreaterThan(2);
    expect(manifest.prerequisites).toEqual(['brand', 'common']);

    const chunkCSS = new Map<string, string>();
    for (const chunk of manifest.chunks) {
      chunkCSS.set(chunk, await readFile(new URL(`tokens/${chunk}.css`, DIST), 'utf8'));
    }

    // Union of chunk properties == index.css properties (both include the dark-mode/fluid partials).
    const monolithCSS = await readFile(new URL('index.css', DIST), 'utf8');
    const monolithProperties = definedProperties(monolithCSS);
    const allChunkProperties = new Set([...chunkCSS.values()].flatMap((css) => [...definedProperties(css)]));
    expect([...allChunkProperties].filter((property) => !monolithProperties.has(property))).toEqual([]);
    expect([...monolithProperties].filter((property) => !allChunkProperties.has(property))).toEqual([]);

    // References that already dangle in the monolith (e.g. dark-mode.css remapping a ramp stop
    // that no token defines) are pre-existing issues, not chunking regressions — ignore those.
    const danglingInMonolith = new Set(
      [...referencedProperties(monolithCSS)].filter((property) => !monolithProperties.has(property)),
    );

    // Reference closure per chunk.
    const prerequisiteProperties = new Set(
      manifest.prerequisites.flatMap((chunk) => [...definedProperties(chunkCSS.get(chunk) ?? '')]),
    );
    for (const [chunk, css] of chunkCSS) {
      const available = new Set([
        ...prerequisiteProperties,
        ...definedProperties(css),
        ...(manifest.dependencies[chunk] ?? []).flatMap((dependency) => [
          ...definedProperties(chunkCSS.get(dependency) ?? ''),
        ]),
      ]);
      const unresolved = [...referencedProperties(css)].filter(
        (property) => !available.has(property) && !danglingInMonolith.has(property),
      );
      expect(unresolved, `chunk "${chunk}" references tokens outside its declared dependencies`).toEqual([]);
    }
  });
});
