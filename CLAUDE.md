# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Rijkshuisstijl Community: a design system for the central government of the Netherlands, built on the [NL Design System](https://nldesignsystem.nl) architecture. It is a pnpm workspace monorepo (Node >=24, pnpm ^11) using lerna-lite and changesets for versioning/publishing. Documentation and commit messages are often written in Dutch.

Use of the Rijkshuisstijl brand (logo, official fonts) is legally restricted; placeholder assets are used in development (Tabler Icons, the `nederland-map` icon as logo, the `@rijkshuisstijl-community/font` package as font fallback). Licensed assets live in `proprietary/` and are excluded from the EUPL-1.2 license via LICENSE.md/NOTICE.md.

## Commands

All commands run from the repo root unless noted.

```bash
pnpm install                 # install dependencies
pnpm run storybook           # dev server on localhost:6006 (builds design tokens first)
pnpm run build               # build all packages (recursively)
pnpm run lint                # all linters: eslint, stylelint, markdownlint, npmPkgJsonLint
pnpm run lint-fix            # autofix + prettier
pnpm run typecheck           # tsc --noEmit in all packages
pnpm run test                # run tests in all workspaces
pnpm run test:e2e            # Playwright e2e tests (apps/examples/react-vite)
```

Scope to a single package with `--filter` (package names, not directories):

```bash
pnpm --filter @rijkshuisstijl-community/components-react run test
# Single test file / test name (vitest):
pnpm --filter @rijkshuisstijl-community/components-react exec vitest run src/... -t 'name'
```

- React library tests: vitest + @testing-library/react, colocated as `src/*.test.tsx` in each `packages/components-react/*-react` package and in `library-react`.
- Angular package (`packages/components-angular`) uses jest instead of vitest.
- Storybook interaction/a11y tests: `pnpm run test-storybook:ci` (installs Playwright Chromium, runs the vitest `storybook` project).
- Husky pre-commit runs lint-staged (eslint, stylelint, markdownlint, prettier --check, npmPkgJsonLint) — run `pnpm run lint-fix` before committing to avoid failures.

## Architecture

CSS-first, layered component architecture. Each component exists as its own publishable npm package, aggregated by a library package per technology:

- **`packages/components-css/<name>-css`** — the source of truth for styling. Each package has `src/index.scss` (+ `tokens.json` documenting its design tokens) and is built with `build-css-package` from `packages/build-utils-css`. All are aggregated by **`packages/components-css/library-css`** (published as `@rijkshuisstijl-community/components-css`) via `@use` statements in its `index.scss`; a few compound components (form, table, wrapper…) live directly in `library-css/src/`. **A new CSS component needs its own package AND an entry in `library-css/index.scss` + `library-css` devDependencies.**
- **`packages/components-react/<name>-react`** — React wrappers, one package per component, aggregated by **`components-react/library-react`** (published as `@rijkshuisstijl-community/components-react`, built with Rollup). Many components simply re-export from upstream NL Design System packages (`@utrecht/component-library-react`, `@nl-design-system-candidate/*`) — check for an upstream component before implementing from scratch. Each package exposes an `index.ts` and a `noSideEffects.ts` entry.
- **`packages/web-components`** — custom elements (`rhc-*` tags) that wrap the React components using Preact and render into shadow DOM with the component CSS inlined (`?inline` imports). See `src/components/BaseComponent.tsx`.
- **`packages/components-twig`** and **`packages/components-angular`** — Twig and Angular wrappers.
- **`proprietary/design-tokens`** — design tokens: Figma Tokens Studio JSON (`figma/`) is split by `token-transformer`, then built with Style Dictionary into CSS custom properties. Themes are applied via the `rhc-theme` class. Consumers import `dist/index.css` (or `dist/<theme>/index.css` for alternate themes).
- **`packages/storybook`** — Storybook 9 (react-vite) documenting all technologies. Stories and docs live in `src/components-react/`, `src/components-css/`, `src/components-twig/`, `src/web-components/` — a new component also needs stories here. Deployed to Vercel and visually tested with Chromatic.
- **`apps/rhc-templates`** — Next.js app with page templates; run with `pnpm run start:rhc-templates`.
- **`apps/examples/react-vite`** — example app, hosts the Playwright e2e tests.

Internal dependencies use the `workspace:*` protocol. Watch mode across the monorepo: `pnpm run watch:packages` (or `pnpm run storybook`, which runs all watchers in parallel).

## Conventions

- Source files carry a license header: `@license EUPL-1.2` in code, `<!-- @license CC0-1.0 -->` in markdown.
- Publishable package changes need a changeset (`pnpm changeset`, files in `.changeset/`); releases are handled via changesets/lerna-lite.
- Component CSS uses design-token custom properties rather than hard-coded values; per-component tokens are declared in the package's `tokens.json`.
- Never commit proprietary Rijkshuisstijl assets (logo, official fonts) outside `proprietary/`.
