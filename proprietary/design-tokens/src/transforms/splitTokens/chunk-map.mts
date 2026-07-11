/**
 * Utilities to assign every design token to a CSS "chunk", so that Style Dictionary can emit
 * per-layer (brand, common) and per-component token files next to the monolithic index.css.
 *
 * Chunk membership is derived from the Tokens Studio set names (the top-level keys in
 * figma.tokens.json / themes.json / base.tokens.json), because the tokens-studio preprocessor
 * runs with `excludeParentKeys: true` and strips the set names before Style Dictionary sees
 * the tokens.
 */

export const BRAND_CHUNK = 'brand';
export const COMMON_CHUNK = 'common';

/** Chunks that every other chunk may reference without declaring a dependency. */
export const PREREQUISITE_CHUNKS = [BRAND_CHUNK, COMMON_CHUNK];

export type TokenSets = Record<string, unknown>;

/** Maps a flattened token path ("utrecht.button.font-family") to its chunk name ("button"). */
export type ChunkMap = Record<string, string>;

export interface ChunkManifest {
  chunks: string[];
  /** Chunks that must always be loaded; every chunk may reference tokens defined in these. */
  prerequisites: string[];
  /** Cross-component references: chunk name -> other component chunks it references. */
  dependencies: Record<string, string[]>;
}

/**
 * Maps a Tokens Studio set name to its chunk:
 * - brand/*                -> "brand"
 * - common/*, overrides/*  -> "common" (overrides re-define common-layer tokens)
 * - components/<name>/**   -> "<name>"
 * Unknown set names return null so callers can fail loudly.
 */
export const chunkNameForSet = (setName: string): string | null => {
  const [layer, name] = setName.split('/');
  if (layer === 'brand') return BRAND_CHUNK;
  if (layer === 'common' || layer === 'overrides') return COMMON_CHUNK;
  if (layer === 'components' && name) return name;
  return null;
};

const isToken = (node: unknown): node is Record<string, unknown> =>
  typeof node === 'object' && node !== null && ('$value' in node || 'value' in node);

/** Flattens a token set body into ["utrecht.button.font-family", ...] dot-paths. */
export const flattenTokenPaths = (body: unknown, prefix: string[] = []): string[] => {
  if (typeof body !== 'object' || body === null) return [];
  if (isToken(body)) return [prefix.join('.')];

  return Object.entries(body).flatMap(([key, child]) =>
    key.startsWith('$') ? [] : flattenTokenPaths(child, [...prefix, key]),
  );
};

/**
 * Builds the token-path -> chunk map for one theme, from its ordered `{ setName: setBody }`
 * object. Iteration order mirrors the token merge order, so when multiple sets define the same
 * token (e.g. overrides/type-scale re-defining common tokens) the last set wins — exactly like
 * the tokens-studio merge.
 */
export const buildChunkMap = (tokensBySet: TokenSets): ChunkMap => {
  const chunkMap: ChunkMap = {};
  for (const [setName, body] of Object.entries(tokensBySet)) {
    const chunk = chunkNameForSet(setName);
    if (!chunk) {
      throw new Error(`Cannot determine chunk for token set "${setName}". Extend chunkNameForSet().`);
    }
    for (const tokenPath of flattenTokenPaths(body)) {
      chunkMap[tokenPath] = chunk;
    }
  }
  return chunkMap;
};

/**
 * Finds the chunk for a Style Dictionary token path, using the longest matching prefix so that
 * tokens expanded by sd-transforms (path segments appended below the source token) still resolve.
 */
export const chunkForTokenPath = (chunkMap: ChunkMap, path: readonly string[]): string | null => {
  for (let length = path.length; length > 0; length--) {
    const chunk = chunkMap[path.slice(0, length).join('.')];
    if (chunk) return chunk;
  }
  return null;
};

const REFERENCE_PATTERN = /\{([^{}]+)\}/g;

/** Collects every string inside a token value (composite values nest strings in objects/arrays). */
const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(collectStrings);
};

/**
 * Computes the manifest for one theme: all chunk names plus the cross-component dependency
 * graph, by scanning token values for `{token.path}` references that resolve to a different
 * component chunk. References to the prerequisite chunks (brand, common) are implicit and
 * not recorded.
 */
export const buildChunkManifest = (tokensBySet: TokenSets): ChunkManifest => {
  const chunkMap = buildChunkMap(tokensBySet);
  const chunks = new Set<string>(PREREQUISITE_CHUNKS);
  const dependencies: Record<string, Set<string>> = {};

  const visit = (chunk: string, node: unknown): void => {
    if (typeof node !== 'object' || node === null) return;
    if (isToken(node)) {
      const strings = collectStrings('$value' in node ? node['$value'] : node['value']);
      for (const [, reference] of strings.flatMap((str) => [...str.matchAll(REFERENCE_PATTERN)])) {
        const referencedChunk = chunkForTokenPath(chunkMap, reference.trim().split('.'));
        if (
          referencedChunk &&
          referencedChunk !== chunk &&
          !PREREQUISITE_CHUNKS.includes(referencedChunk) &&
          !PREREQUISITE_CHUNKS.includes(chunk)
        ) {
          (dependencies[chunk] ??= new Set()).add(referencedChunk);
        }
      }
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith('$')) visit(chunk, child);
    }
  };

  for (const [setName, body] of Object.entries(tokensBySet)) {
    const chunk = chunkNameForSet(setName);
    if (!chunk) {
      throw new Error(`Cannot determine chunk for token set "${setName}". Extend chunkNameForSet().`);
    }
    chunks.add(chunk);
    visit(chunk, body);
  }

  return {
    chunks: [...chunks].sort(),
    prerequisites: [...PREREQUISITE_CHUNKS],
    dependencies: Object.fromEntries(
      Object.entries(dependencies)
        .map(([chunk, deps]): [string, string[]] => [chunk, [...deps].sort()])
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  };
};
