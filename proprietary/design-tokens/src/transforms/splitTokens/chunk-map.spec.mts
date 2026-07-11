import { describe, expect, test } from 'vitest';

import {
  buildChunkManifest,
  buildChunkMap,
  chunkForTokenPath,
  chunkNameForSet,
  flattenTokenPaths,
} from './chunk-map.mts';

describe('chunk-map', () => {
  describe('chunkNameForSet', () => {
    test('maps brand sets to the brand chunk', () => {
      expect(chunkNameForSet('brand/color')).toBe('brand');
      expect(chunkNameForSet('brand/color-mode/dark')).toBe('brand');
    });

    test('maps common and overrides sets to the common chunk', () => {
      expect(chunkNameForSet('common/base')).toBe('common');
      expect(chunkNameForSet('common/primary-color/groen')).toBe('common');
      expect(chunkNameForSet('overrides/type-scale/default [code-only]')).toBe('common');
    });

    test('maps component sets to their component name', () => {
      expect(chunkNameForSet('components/accordion')).toBe('accordion');
      expect(chunkNameForSet('components/button/nl-color-primary')).toBe('button');
    });

    test('returns null for unknown sets', () => {
      expect(chunkNameForSet('vendor/foo')).toBeNull();
      expect(chunkNameForSet('components')).toBeNull();
    });
  });

  describe('flattenTokenPaths', () => {
    test('flattens nested groups to dot-paths of tokens', () => {
      const body = {
        rhc: {
          color: {
            zwart: { $type: 'color', $value: '#000' },
            wit: { $type: 'color', $value: '#fff' },
          },
        },
      };
      expect(flattenTokenPaths(body)).toEqual(['rhc.color.zwart', 'rhc.color.wit']);
    });

    test('supports legacy "value" tokens and skips $-metadata keys', () => {
      const body = {
        utrecht: {
          focus: {
            'outline-color': { value: '{rhc.color.zwart}' },
            $description: 'should be skipped',
          },
        },
      };
      expect(flattenTokenPaths(body)).toEqual(['utrecht.focus.outline-color']);
    });
  });

  describe('buildChunkMap', () => {
    test('assigns tokens to chunks, later sets winning on collisions', () => {
      const chunkMap = buildChunkMap({
        'common/base': { rhc: { text: { scale: { $value: '1rem' } } } },
        'components/button/nl-base': { nl: { button: { gap: { $value: '{rhc.text.scale}' } } } },
        'overrides/type-scale/default [code-only]': { rhc: { text: { scale: { $value: '1.125rem' } } } },
      });
      expect(chunkMap).toEqual({
        'rhc.text.scale': 'common',
        'nl.button.gap': 'button',
      });
    });

    test('throws on unknown set names', () => {
      expect(() => buildChunkMap({ 'mystery/set': {} })).toThrow(/mystery\/set/);
    });
  });

  describe('chunkForTokenPath', () => {
    const chunkMap = { 'nl.button.gap': 'button' };

    test('matches exact paths and longer (expanded) paths by prefix', () => {
      expect(chunkForTokenPath(chunkMap, ['nl', 'button', 'gap'])).toBe('button');
      expect(chunkForTokenPath(chunkMap, ['nl', 'button', 'gap', 'row'])).toBe('button');
    });

    test('returns null for unmapped paths', () => {
      expect(chunkForTokenPath(chunkMap, ['nl', 'button'])).toBeNull();
      expect(chunkForTokenPath(chunkMap, ['rhc', 'color', 'zwart'])).toBeNull();
    });
  });

  describe('buildChunkManifest', () => {
    test('lists chunks and records only cross-component dependencies', () => {
      const manifest = buildChunkManifest({
        'brand/color': { rhc: { color: { zwart: { $value: '#000' } } } },
        'common/base': { rhc: { text: { scale: { $value: '1rem' } } } },
        'components/link': { utrecht: { link: { 'text-underline-offset': { $value: '2px' } } } },
        'components/skip-link': {
          nl: {
            'skip-link': {
              // references another component chunk -> recorded
              'text-underline-offset': { $value: '{utrecht.link.text-underline-offset}' },
              // references prerequisite chunks -> implicit, not recorded
              color: { $value: '{rhc.color.zwart}' },
            },
          },
        },
      });

      expect(manifest.chunks).toEqual(['brand', 'common', 'link', 'skip-link']);
      expect(manifest.prerequisites).toEqual(['brand', 'common']);
      expect(manifest.dependencies).toEqual({ 'skip-link': ['link'] });
    });

    test('finds references inside composite token values', () => {
      const manifest = buildChunkManifest({
        'components/card': { rhc: { card: { shadow: { $value: '0 0 4px #000' } } } },
        'components/card-as-link': {
          rhc: {
            'card-as-link': {
              shadow: { $value: { blur: '{rhc.card.shadow}' } },
            },
          },
        },
      });
      expect(manifest.dependencies).toEqual({ 'card-as-link': ['card'] });
    });
  });
});
