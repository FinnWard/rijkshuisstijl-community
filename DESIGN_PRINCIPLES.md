<!-- @license CC0-1.0 -->

# Design principles

> **Status: first draft, for discussion.**
> These principles were derived by reading the CSS components, React components and design tokens in this repository.
> They describe what the code already does consistently, and name the places where it does not yet.
> Nothing here has been agreed by the community yet: challenge, reword, merge or drop anything.

## How to use these principles

- Use them to settle a design or code review discussion: "which option fits the principles better?"
- Use them when proposing a new component: a proposal should be able to say how it meets each one.
- When two principles conflict, the lower number wins. The order is a proposal too.

Each principle has three parts: **what it means in practice**, **where the code already does this**, and **where we fall short today**.
The last part is the most useful one for planning work.

---

## 1. Everyone can use it

Government services have to work for every resident, whatever their device, ability or situation.
Accessibility is a property of the component itself, not something the consuming team adds afterwards.

**In practice:**

- Start from the native HTML element (`button`, `a`, `section`, `h1`–`h6`) and add ARIA only where HTML has no answer.
- Separate meaning from looks. A heading's level follows the document outline; its size is a separate choice.
- Every interactive element has a visible focus indicator and a pointer target of at least 48 × 48 px.
- An icon-only control always carries a text label.
- State is never communicated by colour alone.

**Already in the code:**

- `Hero` and `Card` take a `headingLevel`, and `Hero` takes a separate `headingAppearanceLevel`; the tests assert that changing the appearance does not change the semantic level.
- Focus is a shared token set (`basis.focus.*`: solid 2 px outline with an offset, plus an inverse variant for dark backgrounds), not a per-component decision. The button deliberately keeps its resting colours on focus and shows only the shared focus ring.
- `basis.pointer-target.min-block-size` and `min-inline-size` are both 48 px.
- `IconButton` takes a `label` next to its icon, which is rendered as visually hidden text.
- Storybook runs the accessibility addon, and the repository has an HTML validation configuration.

**Where we fall short:**

- No component CSS responds to `forced-colors` (Windows high contrast). This is untested rather than known to be fine.
- Only one component stylesheet refers to the pointer-target tokens; the 48 px minimum is not yet applied systematically.
- There is no written rule for when a component must have an automated accessibility test.

## 2. One recognisable government, room for each organisation

A resident should recognise the Rijksoverheid at a glance, and still be able to tell which organisation they are dealing with.
The system offers a small, fixed set of variation points rather than free styling.

**In practice:**

- Variation happens through themes, not through overriding component CSS.
- A theme changes the primary colour, the type scale, corner rounding and colour mode. It does not change layout, behaviour or markup.
- Adding a theme means adding a token set, never forking a component.

**Already in the code:**

- Seven primary-colour themes (groen, hemelblauw, lintblauw, mintgroen, oranje, paars, robijnrood) are built from the same token source by overriding only `rhc.color.primary.*`.
- Two type scales exist: default and information dense.
- Dark mode (`.rhc-theme--dark-mode`) and fluid sizing (`.rhc-theme--fluid`) are opt-in classes on the theme root.
- The Rijkshuisstijl logo and fonts are licensed. The repository ships placeholders (the `nederland-map` icon, Fira Sans) so that the identity is only applied by organisations allowed to use it.

**Where we fall short:**

- The README says some organisation themes have only "partial" support, without saying which components are covered.
- Dark mode remaps the colour palette but there is no statement of which components have been checked in it.

## 3. Tokens are the single source of truth

Every visual decision is a design token. A value that appears in CSS without a token is a decision nobody can find, theme or review.

**In practice:**

- Tokens are layered: **brand** (raw palette, space and type scales) → **common** (meaning: `basis.color.action-1.bg-hover`, `basis.form-control.*`) → **component** (`rhc.card.border-color`).
- Components read component tokens. Component tokens point to common tokens. Only brand tokens hold raw values.
- Spacing, size and type use the shared t-shirt scales (`2xs` … `5xl`); a component does not invent its own steps.
- Figma and code share one token file, so a designer and a developer are looking at the same decision.

**Already in the code:**

- 46 of the 53 CSS component packages style themselves through `var(--rhc-*)` custom properties, usually with a fallback to a common token, for example `var(--rhc-card-padding-block-end, var(--rhc-space-xl))`.
- `proprietary/design-tokens/figma/figma.tokens.json` is the single source, organised as `brand/*`, `common/*` and `components/*` sets.
- Recent commits move common tokens and primary-colour layers onto the `basis` tokens.
- Stylelint restricts custom property names to the known namespaces.

**Where we fall short:**

- The navigation bar has literal values (`24px` paddings and gaps, a `20px` size) and the card-as-link has a `24px` icon fallback.
- Breakpoints are literal `768px` and `1024px` in eight stylesheets. There is no breakpoint token.
- Four component token namespaces coexist (`rhc`, `utrecht`, `nl`, `ams`), and several token sets still carry a `todo` group. Which namespace a new component should use is not written down.
- Some component properties have no fallback (`--rhc-card-background-color`), so a missing token fails silently.

## 4. Build on NL Design System, add only what is missing

This is a community layer on top of NL Design System, not a rival to it.
The less we own, the more we benefit from work done elsewhere, and the easier it is for others to benefit from ours.

**In practice:**

- Before building a component, check whether an NL Design System candidate or a community component (Utrecht, Amsterdam) already exists. If it does, wrap and theme it.
- A wrapper adds the Rijkshuisstijl class name and tokens, and as little else as possible.
- When a component here is generally useful, offer it upstream.
- When upstream replaces something we wrap, migrate, and keep the old API working with a deprecation notice until the next major version.

**Already in the code:**

- `Accordion` is a plain re-export from the Utrecht library. `Button` wraps the NL Design System candidate button and adds only the `rhc-button` class.
- The button's old `appearance` property is still accepted, is mapped to the new `purpose` property, and is marked `@deprecated`.
- The package READMEs describe the CSS package as the place for components "that do not yet exist in the NL Design System community".

**Where we fall short:**

- 46 React source files import from the Utrecht library and 6 from NL Design System candidates. There is no visible plan for which components move when.
- Legacy class names leak into our own selectors (`.utrecht-link-list__link` and `.utrecht-img` are styled from inside `rhc-` components), which ties us to upstream markup.

## 5. CSS first, frameworks second

The design lives in HTML and CSS. Framework packages are a convenience on top, so that a team on any stack gets the same result.

**In practice:**

- A component is complete when it works as a class name on plain HTML. React, Web Component, Angular and Twig versions render that same markup.
- One class per block, element and modifier (`rhc-card`, `rhc-card__heading`, `rhc-hero--text-align-end`), each backed by a Sass mixin so that others can compose it.
- Behaviour that needs JavaScript is the exception, and belongs in the framework layer.

**Already in the code:**

- Every stylesheet is a list of BEM class names that each include one mixin from `_mixin.scss`.
- CSS, React, Web Component, Angular and Twig packages all exist. Only 4 React source files use `useState` or `useEffect`.
- Each React package has a `/no-side-effects` entry point, so that importing a component does not import CSS behind the consumer's back.

**Where we fall short:**

- Coverage is uneven: 68 React packages, 53 CSS packages, and a handful of Twig and Web Components. There is no matrix showing which component exists where.
- Several React components (drawer, column layout, fieldset) have no CSS package here and rely on upstream CSS, so the plain HTML and CSS route for them is undocumented.

## 6. Fit any container, direction and text size

We do not know the screen, the language, the zoom level or the place on the page where a component will end up. Components adapt to their surroundings instead of assuming them.

**In practice:**

- Use logical properties only (`inline-size`, `padding-block-start`, `text-align: start`). No `left`, `right`, `width` or `height`.
- Size with relative units, so that text scales when the user changes their font size.
- Prefer fluid scaling and container queries to viewport breakpoints. A component responds to the space it is given.

**Already in the code:**

- 39 component stylesheets use logical properties and none use physical ones. Stylelint rejects `text-align: left` and `right`.
- The space and type scales are in `rem`, each with a `min` and `max` value that the fluid theme interpolates between.
- `fluid.css` prefers the `vi` unit over `vw` for the same reason.
- The message list and the navigation list use container queries.

**Where we fall short:**

- Most responsive behaviour is still a viewport media query at 768 px (navigation bar, data summary, grid, section).
- Fluid sizing is opt-in and documented separately. It is not clear whether new components are expected to support it.

## 7. Easy to adopt, safe to override

A team should be able to start with one component in an existing application, and stay in control of their own page.

**In practice:**

- Every component is published on its own and as part of a library.
- Components accept what the underlying HTML element accepts: a `className` that is merged with ours, a `ref`, and any other attribute.
- Our CSS can be loaded in a cascade layer, so that the application's own styles always win without a specificity fight.
- No `!important`, except in utilities whose whole purpose is to win (visually hidden).

**Already in the code:**

- 57 React source files merge `className` using `clsx` and 61 pass the remaining properties through to the root element.
- The CSS README recommends importing into `layer(rhc-design-system)`.
- `!important` appears in three stylesheets. One is the visually hidden utility.

**Where we fall short:**

- The other two are workarounds: `text-decoration: none !important` in the card link and an `!important` in the navigation bar. A tripled selector (`.rhc-nav-bar__megamenu__btn-close` three times) in the navigation bar is a third.
- `ref` is handled in two ways: `forwardRef` in some components and a `ref` property in others.

## 8. Calm and content first

The interface stays out of the way. People come for the content and the task, not for the component.

**In practice:**

- Colour carries meaning (action, status, selection). It is not decoration.
- Hover, focus and active states are small and predictable: an underline, a border, a shade.
- Motion is absent unless it explains something. If motion is added, it respects `prefers-reduced-motion`.

**Already in the code:**

- The common colour tokens are named for their role (`action-1`, `negative`, `positive`, `warning`, `selected`, `disabled`), each with the same set of background, border and text steps.
- Card and card-as-link states change only `text-decoration` and a background colour.
- No component stylesheet contains a transition or an animation.

**Where we fall short:**

- "No motion" is an observation, not a decision. If it is intended, it should be stated. If it is not, a motion token set and a reduced-motion rule are needed before the first animation lands.
- This principle is the one with the least evidence in the code and the most opinion. It needs input from designers.

---

## Open questions for the first review

1. **Language.** The repository documentation is mostly Dutch. Should the agreed version be Dutch, with an English translation, like the Code of Conduct?
2. **Relation to existing principles.** NL Design System and the Rijkshuisstijl each publish their own guidelines. Should these principles refer to those and add only what is specific to this community?
3. **Enforcement.** Which of these should become a lint rule or a pull request checklist item, and which stay as guidance? Hard-coded values (3) and physical properties (6) are the easiest to automate.
4. **Definition of done.** Principles 1, 3, 5 and 6 together could form a checklist for "a component is finished". Is that wanted?
5. **Priorities.** Is the order right? In particular, should "build on NL Design System" rank above "tokens are the single source of truth"?
