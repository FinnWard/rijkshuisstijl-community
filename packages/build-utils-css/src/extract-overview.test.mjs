import { describe, expect, it } from 'vitest';
import { componentNameFromPackageName, extractOverview } from './extract-overview.mjs';

const packageName = '@rijkshuisstijl-community/example-css';

describe('componentNameFromPackageName', () => {
  it('strips the scope and the -css suffix', () => {
    expect(componentNameFromPackageName('@rijkshuisstijl-community/button-css')).toBe('button');
    expect(componentNameFromPackageName('@rijkshuisstijl-community/navigation-bar-css')).toBe('navigation-bar');
  });
});

describe('extractOverview', () => {
  it('collects classes and consumed tokens', () => {
    const overview = extractOverview(
      `.rhc-example {
        color: var(--rhc-example-color);
      }`,
      { packageName },
    );

    expect(overview.component).toBe('example');
    expect(overview.packageName).toBe(packageName);
    expect(overview.classes).toEqual([
      { className: 'rhc-example', selectors: ['.rhc-example'], tokens: ['--rhc-example-color'] },
    ]);
    expect(overview.tokens).toEqual([
      { name: '--rhc-example-color', usedIn: ['rhc-example'], fallbacks: [], isSet: false },
    ]);
  });

  it('collects nested fallback tokens and literal fallbacks', () => {
    const overview = extractOverview(
      `.rhc-example {
        gap: var(--rhc-example-gap, var(--rhc-space-md, 12px));
      }`,
      { packageName },
    );

    expect(overview.tokens.map(({ name }) => name)).toEqual(['--rhc-example-gap', '--rhc-space-md']);
    const [gap, space] = overview.tokens;
    // The fallback of --rhc-example-gap is itself a var() and is not recorded as a literal.
    expect(gap.fallbacks).toEqual([]);
    expect(space.fallbacks).toEqual(['12px']);
  });

  it('attributes tokens to every class of a multi-selector rule', () => {
    const overview = extractOverview(
      `.rhc-example, .rhc-example__label {
        color: var(--rhc-example-color);
      }`,
      { packageName },
    );

    expect(overview.classes.map(({ className }) => className)).toEqual(['rhc-example', 'rhc-example__label']);
    expect(overview.tokens[0].usedIn).toEqual(['rhc-example', 'rhc-example__label']);
  });

  it('includes rules nested in at-rules such as @media', () => {
    const overview = extractOverview(
      `@media (min-width: 768px) {
        .rhc-example {
          inline-size: var(--rhc-example-inline-size);
        }
      }`,
      { packageName },
    );

    expect(overview.classes.map(({ className }) => className)).toEqual(['rhc-example']);
    expect(overview.tokens.map(({ name }) => name)).toEqual(['--rhc-example-inline-size']);
  });

  it('attributes tokens of class-less rules to the raw selector', () => {
    const overview = extractOverview(
      `:root {
        font-size: var(--rhc-root-font-size);
      }`,
      { packageName },
    );

    expect(overview.classes).toEqual([]);
    expect(overview.tokens).toEqual([{ name: '--rhc-root-font-size', usedIn: [':root'], fallbacks: [], isSet: false }]);
  });

  it('ignores rules inside @keyframes', () => {
    const overview = extractOverview(
      `@keyframes rhc-example-spin {
        from {
          rotate: var(--rhc-example-rotate-from);
        }
      }`,
      { packageName },
    );

    expect(overview.classes).toEqual([]);
    expect(overview.tokens).toEqual([]);
  });

  it('marks custom properties that are set as well as consumed', () => {
    const overview = extractOverview(
      `.rhc-example {
        --utrecht-button-color: var(--rhc-example-color, inherit);
      }`,
      { packageName },
    );

    expect(overview.tokens).toEqual([
      { name: '--rhc-example-color', usedIn: ['rhc-example'], fallbacks: ['inherit'], isSet: false },
      { name: '--utrecht-button-color', usedIn: [], fallbacks: [], isSet: true },
    ]);
  });

  it('produces deterministic, sorted and deduplicated output', () => {
    const css = `.rhc-b { color: var(--rhc-b-color); }
      .rhc-a { color: var(--rhc-a-color); background-color: var(--rhc-b-color); }
      .rhc-a { border-color: var(--rhc-a-color); }`;

    const overview = extractOverview(css, { packageName });

    expect(overview).toEqual(extractOverview(css, { packageName }));
    expect(overview.classes.map(({ className }) => className)).toEqual(['rhc-a', 'rhc-b']);
    expect(overview.classes[0].tokens).toEqual(['--rhc-a-color', '--rhc-b-color']);
    expect(overview.classes[0].selectors).toEqual(['.rhc-a']);
    expect(overview.tokens.map(({ name }) => name)).toEqual(['--rhc-a-color', '--rhc-b-color']);
  });

  it('accepts an explicit component name', () => {
    const overview = extractOverview('.rhc-example { color: red; }', {
      component: 'custom-name',
      packageName,
    });

    expect(overview.component).toBe('custom-name');
  });
});
