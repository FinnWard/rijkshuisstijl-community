<!-- @license CC0-1.0 -->

# Rijkshuisstijl Community Componenten - CSS

**Het toepassen van design-elementen uit dit project is strikt verboden voor organisaties die geen deel uitmaken van de
centrale overheid van Nederland.**

Deze package is onderdeel van het [Rijkshuisstijl Community](https://github.com/nl-design-system/rijkshuisstijl-community/blob/main/README.md) project.

> [!NOTE]
> De componenten zijn ook beschikbaar in individuele packages als er alleen maar een deel nodig zijn

## Aan de slag met CSS-componenten

Om de CSS-componenten van de Rijkshuisstijl-community te gebruiken, installeer je het [components-css npm package](https://www.npmjs.com/package/@rijkshuisstijl-community/components-css).

```bash
npm install @rijkshuisstijl-community/components-css
```

Dit installeert de CSS-componenten. Om deze componenten te gebruiken, moet je het thema toepassen in de volgende stap.

### Thema toepassen

Om de Rijkshuisstijl aan je project toe te voegen, installeer je het [design-tokens npm package](https://www.npmjs.com/package/@rijkshuisstijl-community/design-tokens).

```bash
npm install @rijkshuisstijl-community/design-tokens
```

Dit pakket bevat de CSS-variabelen van het design systeem. Importeer de styles bij voorkeur in een eigen cascade layer, zodat project-specifieke CSS zonder conflicten over de componenten heen kan stylen.

```css
@layer rhc-tokens, rhc-components, app;

@import '@rijkshuisstijl-community/design-tokens/dist/index.css' layer(rhc-tokens);
@import '@rijkshuisstijl-community/components-css/dist/index.css' layer(rhc-components);

@layer app {
  .rhc-button {
    --rhc-icon-only-button-padding-inline-start: 0.5rem;
  }
}
```

Als je eigen CSS **niet** in een layer staat, wint die in de cascade van rules die wel in een layer staan. Gebruik je ook layers voor je project-CSS, zet je eigen layer (`app`) dan ná `rhc-components` zoals in het voorbeeld zodat je overrides voorspelbare resultaten geven.

Om alleen een deel van de applicatie te themen, omring je dat deel met de Rijkshuisstijl-thema class, bijvoorbeeld `rhc-theme`.

```html
<section class="rhc-theme">
  <!-- RHC componenten -->
</section>
```

#### Thema wijzigen

Om een ander thema toe te passen moet je het importeren van `@rijkshuisstijl-community/design-tokens/dist/{thema}/index.css` en de class aanpassen naar het desbetreffende thema.
Zie het volgende voorbeeld om het thema "groen" toe te passen:

```css
@import '@rijkshuisstijl-community/design-tokens/dist/groen/index.css' layer(rhc-tokens);
@import '@rijkshuisstijl-community/components-css/dist/index.css' layer(rhc-components);
```

Bekijk de [packages/font/README.md](https://github.com/nl-design-system/rijkshuisstijl-community/blob/main/packages/font/README.md) voor de meerdere manieren om de lettertypen te installeren voor jouw project.

## Component-anatomie: CSS-classes en design tokens

Dit overzicht wordt in Storybook gebruikt als snelle referentie per CSS-component. De lijsten hieronder zijn gebaseerd op de RHC SCSS bronbestanden (`src/*.scss`) van elk componentpakket in deze versie.

> [!TIP]
> Bij componenten waarbij alleen upstream styles worden doorgestuurd (`@forward`) kunnen classes/tokens in deze lijst leeg zijn. Raadpleeg dan op de componentpagina in Storybook ook de links naar **NL Design System** en **GitHub** bovenaan de docs voor de bijbehorende Utrecht/NL Design System documentatie.

### `accordion-css`

**CSS-classes**
Geen specifieke classes in de RHC-laag (alleen doorgestuurde upstream CSS).

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `action-group-css`

**CSS-classes**
Geen specifieke classes in de RHC-laag (alleen doorgestuurde upstream CSS).

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `alert-css`

**CSS-classes**
`.rhc-alert`

**Design tokens**
`--utrecht-alert-color`

### `article-css`

**CSS-classes**
`.rhc-article`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `blockquote-css`

**CSS-classes**
`.rhc-blockquote`, `.utrecht-blockquote__quote`

**Design tokens**
`--rhc-blockquote-margin-block-end`, `--rhc-blockquote-margin-block-start`, `--rhc-blockquote-margin-inline-end`, `--rhc-blockquote-margin-inline-start`

### `breadcrumb-nav-css`

**CSS-classes**
`.rhc-breadcrumb-nav`, `.utrecht-breadcrumb-nav__list`

**Design tokens**
`--rhc-breadcrumb-nav-link-current-color`

### `button-css`

**CSS-classes**
`.rhc-button--icon-only`, `.rhc-button__sr-only`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `card-as-link-css`

**CSS-classes**
`.rhc-card-as-link`, `.rhc-card-as-link--default`, `.rhc-card-as-link--full-bleed`, `.rhc-card-as-link--horizontal`, `.rhc-card-as-link__anchor`, `.rhc-card-as-link__button`, `.rhc-card-as-link__content`, `.rhc-card-as-link__footer`, `.rhc-card-as-link__heading`, `.rhc-card-as-link__icon`, `.rhc-card-as-link__image`, `.rhc-card-as-link__image-container`, `.rhc-card-as-link__link`, `.rhc-card-as-link__metadata`, `.utrecht-img`

**Design tokens**
`--rhc-border-radius-md`, `--rhc-border-width-sm`, `--rhc-card-as-link-active-background-color`, `--rhc-card-as-link-background-color`, `--rhc-card-as-link-border-color`, `--rhc-card-as-link-color`, `--rhc-card-as-link-focus-background-color`, `--rhc-card-as-link-full-bleed-color`, `--rhc-card-as-link-heading-color`, `--rhc-card-as-link-horizontal-background-color`, `--rhc-card-as-link-horizontal-color`, `--rhc-card-as-link-horizontal-heading-inline-size`, `--rhc-card-as-link-horizontal-max-block-size`, `--rhc-card-as-link-hover-background-color`, `--rhc-card-as-link-icon-color`, `--rhc-card-as-link-link-active-color`, `--rhc-card-as-link-link-color`, `--rhc-card-as-link-metadata-color`, `--rhc-space-2xl`, `--rhc-space-lg`, `--rhc-space-xl`

### `card-css`

**CSS-classes**
`.rhc-card`, `.rhc-card--default`, `.rhc-card__content`, `.rhc-card__footer`, `.rhc-card__heading`, `.rhc-card__link`, `.rhc-card__metadata`, `.rhc-card__subheading`, `.utrecht-img`

**Design tokens**
`--rhc-border-radius-md`, `--rhc-border-width-sm`, `--rhc-card-background-color`, `--rhc-card-border-color`, `--rhc-card-color`, `--rhc-card-heading-font-size`, `--rhc-card-inline-size`, `--rhc-card-link-active-color`, `--rhc-card-link-color`, `--rhc-card-metadata-color`, `--rhc-card-subheading-font-size`, `--rhc-space-lg`, `--rhc-space-xl`

### `checkbox-css`

**CSS-classes**
`.rhc-checkbox`, `.rhc-form-field-checkbox-option`, `.utrecht-checkbox`, `.utrecht-checkbox--custom`, `.utrecht-form-label--checkbox`

**Design tokens**
`--rhc-checkbox-label-margin-block-start`, `--rhc-space-sm`, `--utrecht-checkbox-checked-active-background-color`, `--utrecht-checkbox-checked-active-border-color`, `--utrecht-checkbox-checked-focus-background-color`, `--utrecht-checkbox-checked-focus-border-color`, `--utrecht-checkbox-checked-focus-border-width`, `--utrecht-checkbox-checked-hover-background-color`, `--utrecht-checkbox-checked-hover-border-color`, `--utrecht-checkbox-disabled-background-color`, `--utrecht-checkbox-disabled-border-color`, `--utrecht-checkbox-indeterminate-active-background-color`, `--utrecht-checkbox-indeterminate-active-border-color`, `--utrecht-checkbox-indeterminate-disabled-background-color`, `--utrecht-checkbox-indeterminate-disabled-border-color`, `--utrecht-checkbox-indeterminate-focus-background-color`, `--utrecht-checkbox-indeterminate-focus-border-color`, `--utrecht-checkbox-indeterminate-hover-background-color`, `--utrecht-checkbox-indeterminate-hover-border-color`, `--utrecht-checkbox-invalid-background-color`, `--utrecht-checkbox-invalid-border-color`

### `checkbox-group-css`

**CSS-classes**
`.rhc-checkbox-group`, `.utrecht-checkbox`

**Design tokens**
`--rhc-checkbox-group-padding-block-end`, `--rhc-checkbox-group-padding-block-start`, `--rhc-checkbox-group-row-gap`

### `code-input-css`

**CSS-classes**
`.rhc-code-input`

**Design tokens**
`--rhc-code-input-size`

### `code-input-group-css`

**CSS-classes**
`.rhc-code-input`, `.rhc-code-input-group`

**Design tokens**
`--rhc-code-input-group-column-gap`, `--rhc-code-input-size`

### `data-badge-button-css`

**CSS-classes**
`.rhc-data-badge-button`

**Design tokens**
`--rhc-data-badge-button-column-gap`, `--rhc-data-badge-button-hover-background-color`, `--rhc-data-badge-button-hover-color`

### `data-summary-css`

**CSS-classes**
`.rhc-data-summary`, `.rhc-data-summary--column`, `.rhc-data-summary--row`, `.rhc-data-summary__item`, `.rhc-data-summary__item-action`, `.rhc-data-summary__item-key`, `.rhc-data-summary__item-value`

**Design tokens**
`--rhc-data-summary-font-family`, `--rhc-data-summary-font-size`, `--rhc-data-summary-item-action-padding-block-end`, `--rhc-data-summary-item-action-padding-block-start`, `--rhc-data-summary-item-action-padding-inline-end`, `--rhc-data-summary-item-action-padding-inline-start`, `--rhc-data-summary-item-action-row-padding-block-end`, `--rhc-data-summary-item-action-row-padding-block-start`, `--rhc-data-summary-item-action-row-padding-inline-end`, `--rhc-data-summary-item-action-row-padding-inline-start`, `--rhc-data-summary-item-border-block-end-style`, `--rhc-data-summary-item-border-color`, `--rhc-data-summary-item-border-width`, `--rhc-data-summary-item-color`, `--rhc-data-summary-item-key-font-weight`, `--rhc-data-summary-item-key-padding-block-end`, `--rhc-data-summary-item-key-padding-block-start`, `--rhc-data-summary-item-key-padding-inline-end`, `--rhc-data-summary-item-key-padding-inline-start`, `--rhc-data-summary-item-key-row-padding-block-end`, `--rhc-data-summary-item-key-row-padding-block-start`, `--rhc-data-summary-item-key-row-padding-inline-end`, `--rhc-data-summary-item-key-row-padding-inline-start`, `--rhc-data-summary-item-value-font-weight`, `--rhc-data-summary-item-value-padding-block-end`, `--rhc-data-summary-item-value-padding-block-start`, `--rhc-data-summary-item-value-padding-inline-end`, `--rhc-data-summary-item-value-padding-inline-start`, `--rhc-data-summary-item-value-row-padding-block-end`, `--rhc-data-summary-item-value-row-padding-block-start`, `--rhc-data-summary-item-value-row-padding-inline-end`, `--rhc-data-summary-item-value-row-padding-inline-start`, `--rhc-data-summary-line-height`

### `dot-badge-css`

**CSS-classes**
`.rhc-dot-badge`, `.rhc-dot-badge__sr-only`

**Design tokens**
`--rhc-border-radius-circle`, `--rhc-color-rood-500`, `--rhc-space-lg`

### `figure-css`

**CSS-classes**
`.rhc-figure`, `.rhc-rounded-corner`

**Design tokens**
`--utrecht-figure-img-border-end-end-radius`, `--utrecht-figure-img-border-end-start-radius`, `--utrecht-figure-img-border-start-end-radius`, `--utrecht-figure-img-border-start-start-radius`

### `file-css`

**CSS-classes**
`.rhc-file`, `.rhc-file--error`, `.rhc-file__inner-container`, `.rhc-file__inner-container__sub`, `.rhc-file__name`, `.rhc-file__subtitle`

**Design tokens**
`--rhc-file-border-color`, `--rhc-file-border-radius`, `--rhc-file-border-style`, `--rhc-file-error-border-color`, `--rhc-file-padding-block-end`, `--rhc-file-padding-block-start`, `--rhc-file-padding-inline-end`, `--rhc-file-padding-inline-start`, `--rhc-file-subtitle-color`

### `file-input-css`

**CSS-classes**
`.rhc-file-input`, `.rhc-file-input__button-feedback-container`, `.rhc-file-input__feedback`, `.rhc-file-input__files-container`

**Design tokens**
`--rhc-file-column-gap`, `--rhc-file-input-feedback-color`, `--rhc-file-input-feedback-font-size`, `--rhc-file-input-row-gap`, `--rhc-file-padding-inline-end`, `--rhc-file-padding-inline-start`

### `footer-css`

**CSS-classes**
`.rhc-heading`, `.rhc-page-footer`, `.rhc-page-footer--primary-filled`, `.rhc-page-footer--primary-outlined`, `.rhc-page-footer-container`, `.rhc-page-footer-layout`, `.rhc-page-footer__section`, `.rhc-page-footer__tagline`, `.rhc-page-prefooter`, `.rhc-page-prefooter__content`, `.rhc-page-subfooter-layout`, `.rhc-paragraph`

**Design tokens**
`--rhc-color-primary-500`, `--rhc-color-wit`, `--rhc-page-footer-border-block-start-color`, `--rhc-page-footer-border-block-start-style`, `--rhc-page-footer-border-block-start-width`, `--rhc-page-footer-column-gap`, `--rhc-page-footer-column-width`, `--rhc-page-footer-content-column-gap`, `--rhc-page-footer-outlined-background-color`, `--rhc-page-footer-outlined-border-color`, `--rhc-page-footer-outlined-color`, `--rhc-page-footer-padding-block-end`, `--rhc-space-2xl`, `--rhc-space-3xl`, `--rhc-space-5xl`, `--rhc-text-font-family-serif`, `--utrecht-rich-text-friend-margin-block-end`

### `heading-css`

**CSS-classes**
`.nl-heading--level-1`, `.nl-heading--level-2`, `.nl-heading--level-3`, `.nl-heading--level-4`, `.nl-heading--level-5`, `.rhc-heading`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `hero-css`

**CSS-classes**
`.rhc-hero`, `.rhc-hero--aspect-ratio-1-1`, `.rhc-hero--aspect-ratio-16-9`, `.rhc-hero--aspect-ratio-4-3`, `.rhc-hero--custom-border-radius-corner`, `.rhc-hero--text-align-end`, `.rhc-hero--text-align-start`, `.rhc-hero__children`, `.rhc-hero__heading`, `.rhc-hero__image`, `.rhc-hero__message`, `.rhc-hero__sub-heading`, `.utrecht-heading-group`, `.utrecht-img`

**Design tokens**
`--rhc-hero-border-radius`, `--rhc-hero-heading-font-family`, `--rhc-hero-heading-font-size`, `--rhc-hero-heading-font-weight`, `--rhc-hero-heading-line-height`, `--rhc-hero-inline-size`, `--rhc-hero-message-background-color`, `--rhc-hero-message-border-radius`, `--rhc-hero-message-inline-size`, `--rhc-hero-message-padding-block-end`, `--rhc-hero-message-padding-block-start`, `--rhc-hero-message-padding-inline-end`, `--rhc-hero-message-padding-inline-start`, `--rhc-hero-message-row-gap`, `--rhc-hero-sub-heading-font-family`, `--rhc-hero-sub-heading-font-size`, `--rhc-hero-sub-heading-font-weight`, `--rhc-hero-sub-heading-line-height`

### `language-navigation-css`

**CSS-classes**
`.rhc-language-navigation__link`, `.rhc-language-navigation__list`, `.rhc-language-navigation__list__item`, `.rhc-language-navigation__list__item--html-li`, `.rhc-language-navigation__list__item--selected`, `.rhc-language-navigation__trigger`

**Design tokens**
`--rhc-color-zwart`, `--rhc-font-weight-regular`, `--rhc-space-3xl`, `--rhc-space-md`, `--rhc-space-xl`, `--utrecht-listbox-option-selected-background-color`, `--utrecht-listbox-option-selected-color`

### `link-button-css`

**CSS-classes**
Geen specifieke classes in de RHC-laag (alleen doorgestuurde upstream CSS).

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `link-css`

**CSS-classes**
`.nl-link`, `.rhc-link`, `.utrecht-icon`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `link-list-card-css`

**CSS-classes**
`.rhc-link-list-card`

**Design tokens**
`--rhc-link-list-card-background-color`, `--rhc-link-list-card-padding-block-end`, `--rhc-link-list-card-padding-block-start`, `--rhc-link-list-card-padding-inline-end`, `--rhc-link-list-card-padding-inline-start`, `--rhc-link-list-card-row-gap`

### `link-list-css`

**CSS-classes**
`.rhc-link-list`, `.utrecht-icon`, `.utrecht-link`, `.utrecht-link-list__item`, `.utrecht-link-list__link`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `listbox-css`

**CSS-classes**
Geen specifieke classes in de RHC-laag (alleen doorgestuurde upstream CSS).

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `logo-css`

**CSS-classes**
`.rhc-icon`, `.rhc-logo`, `.rhc-logo__caption`, `.rhc-logo__image`, `.rhc-logo__subtitle`, `.rhc-logo__title`, `.utrecht-icon`

**Design tokens**
`--rhc-logo-caption-max-inline-size`, `--rhc-logo-font-family`, `--rhc-logo-image-block-size`, `--rhc-logo-image-inline-size`, `--rhc-logo-subtitle-font-weight`, `--rhc-logo-title-font-weight`, `--rhc-logo-title-padding-block-start`

### `message-list-css`

**CSS-classes**
`.rhc-message-list`, `.rhc-message-list__item-container`, `.rhc-message-list__item-content`

**Design tokens**
`--rhc-color-grijs-100`, `--rhc-color-grijs-50`, `--rhc-color-lintblauw-50`, `--rhc-message-list-item-background-color`, `--rhc-message-list-item-border-color`, `--rhc-message-list-item-border-width`, `--rhc-message-list-item-color`, `--rhc-message-list-item-column-gap`, `--rhc-message-list-item-content-column-gap`, `--rhc-message-list-item-content-font-size`, `--rhc-message-list-item-content-row-gap`, `--rhc-message-list-item-heading-color`, `--rhc-message-list-item-icon-size`, `--rhc-message-list-item-label-font-family`, `--rhc-message-list-item-label-font-size`, `--rhc-message-list-item-label-font-weight`, `--rhc-message-list-item-label-line-height`, `--rhc-message-list-item-min-height`, `--rhc-message-list-item-padding-block`, `--rhc-message-list-item-padding-inline`, `--rhc-space-md`

### `navigation-bar-css`

**CSS-classes**
`.rhc-nav-bar`, `.rhc-nav-bar__container`, `.rhc-nav-bar__heading`, `.rhc-nav-bar__link`, `.rhc-nav-bar__list`, `.rhc-nav-bar__list--end`, `.rhc-sub-nav-bar`, `.rhc-sub-nav-bar__content`, `.rhc-sub-nav-bar__list`

**Design tokens**
`--rhc-nav-bar-background-color`, `--rhc-nav-bar-border-block-end-width`, `--rhc-nav-bar-border-color`, `--rhc-nav-bar-color`, `--rhc-nav-bar-container-inline-size`, `--rhc-nav-bar-content-column-gap`, `--rhc-nav-bar-content-row-gap`, `--rhc-nav-bar-heading-font-weight`, `--rhc-nav-bar-link-active-background-color`, `--rhc-nav-bar-link-active-color`, `--rhc-nav-bar-link-focus-background-color`, `--rhc-nav-bar-link-focus-color`, `--rhc-nav-bar-link-font-size`, `--rhc-nav-bar-link-hover-background-color`, `--rhc-nav-bar-link-padding-block-end`, `--rhc-nav-bar-link-padding-block-start`, `--rhc-nav-bar-link-padding-inline-end`, `--rhc-nav-bar-link-padding-inline-start`, `--rhc-nav-bar-max-inline-size`, `--rhc-sub-nav-bar-background-color`, `--rhc-sub-nav-bar-column-gap`, `--rhc-sub-nav-bar-column-width`, `--rhc-sub-nav-bar-content-list-row-gap`, `--rhc-sub-nav-bar-content-max-inline-size`, `--rhc-sub-nav-bar-content-padding-inline-end`, `--rhc-sub-nav-bar-content-padding-inline-start`, `--rhc-sub-nav-bar-inline-size`, `--rhc-sub-nav-bar-padding-block-end`, `--rhc-sub-nav-bar-padding-block-start`

### `navigation-list-css`

**CSS-classes**
`.rhc-navigation-list`, `.rhc-navigation-list--container-small`, `.rhc-navigation-list__item-content`, `.rhc-navigation-list__item__description`, `.rhc-navigation-list__item__start-icon`

**Design tokens**
`--rhc-border-radius-circle`, `--rhc-border-width-default`, `--rhc-color-bg-document`, `--rhc-color-foreground-lint`, `--rhc-color-foreground-subtle`, `--rhc-color-grijs-100`, `--rhc-color-grijs-300`, `--rhc-color-grijs-50`, `--rhc-color-lintblauw-50`, `--rhc-color-wit`, `--rhc-navigation-list-item-description-font-size`, `--rhc-navigation-list-item-icon-start-padding-block`, `--rhc-navigation-list-item-icon-start-padding-inline`, `--rhc-navigation-list-item-icon-start-size`, `--rhc-navigation-list-item-label-font-size`, `--rhc-size-pointer-target`, `--rhc-space-md`, `--rhc-space-xl`, `--rhc-text-font-family-default`, `--rhc-text-font-weight-bold`, `--rhc-text-line-height-md`

### `number-badge-css`

**CSS-classes**
`.rhc-number-badge`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `ordered-list-css`

**CSS-classes**
Geen specifieke classes in de RHC-laag (alleen doorgestuurde upstream CSS).

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `page-number-navigation-css`

**CSS-classes**
Geen specifieke classes in de RHC-laag (alleen doorgestuurde upstream CSS).

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `paragraph-css`

**CSS-classes**
`.rhc-paragraph`

**Design tokens**
`--nl-paragraph-margin-block-end`, `--nl-paragraph-margin-block-start`

### `pre-heading-css`

**CSS-classes**
`.rhc-heading-container`, `.rhc-pre-heading`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `radio-css`

**CSS-classes**
`.rhc-radio`

**Design tokens**
`--utrecht-radio-button-background-color`, `--utrecht-radio-button-dot-size`

### `radio-group-css`

**CSS-classes**
`.rhc-form-field`, `.rhc-radio-group`, `.utrecht-form-label`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `rounded-corner-css`

**CSS-classes**
`.rhc-rounded-corner`, `.rhc-rounded-corner--position`, `.rhc-rounded-corner--size`

**Design tokens**
`--rhc-rounded-corner-md-border-radius`, `--rhc-rounded-corner-overflow`

### `separator-css`

**CSS-classes**
`.rhc-separator`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `side-nav-css`

**CSS-classes**
`.rhc-side-nav`

**Design tokens**
`--rhc-sidenav-link-active-color`, `--rhc-sidenav-link-active-text-decoration`, `--rhc-sidenav-link-color`, `--rhc-sidenav-link-column-gap`, `--rhc-sidenav-link-current-color`, `--rhc-sidenav-link-current-font-weight`, `--rhc-sidenav-link-focus-background-color`, `--rhc-sidenav-link-focus-color`, `--rhc-sidenav-link-focus-text-decoration`, `--rhc-sidenav-link-font-family`, `--rhc-sidenav-link-font-size`, `--rhc-sidenav-link-font-weight`, `--rhc-sidenav-link-hover-color`, `--rhc-sidenav-link-hover-text-decoration`, `--rhc-sidenav-link-line-height`, `--rhc-sidenav-link-padding-block-end`, `--rhc-sidenav-link-padding-block-start`, `--rhc-sidenav-link-text-decoration`, `--rhc-sidenav-row-gap`

### `skip-link-css`

**CSS-classes**
Geen specifieke classes in de RHC-laag (alleen doorgestuurde upstream CSS).

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.

### `text-input-css`

**CSS-classes**
`.rhc-text-input`

**Design tokens**
`--rhc-border-width-md`

### `textarea-css`

**CSS-classes**
`.rhc-textarea`

**Design tokens**
`--rhc-border-width-md`

### `toggletip-css`

**CSS-classes**
`.rhc-toggletip`, `.rhc-toggletip__button`, `.rhc-toggletip__icon`, `.rhc-toggletip__summary`

**Design tokens**
`--rhc-space-xl`, `--rhc-toggletip-active-background-color`, `--rhc-toggletip-active-border-color`, `--rhc-toggletip-active-color`, `--rhc-toggletip-background-color`, `--rhc-toggletip-border-color`, `--rhc-toggletip-border-radius`, `--rhc-toggletip-border-width`, `--rhc-toggletip-color`, `--rhc-toggletip-focus-background-color`, `--rhc-toggletip-focus-color`, `--rhc-toggletip-hover-background-color`, `--rhc-toggletip-hover-color`, `--rhc-toggletip-icon-size`, `--rhc-toggletip-size`

### `unordered-list-css`

**CSS-classes**
`.rhc-unordered-list--nested`

**Design tokens**
`--rhc-unordered-list-nested-margin-inline-start`

### `visually-hidden-css`

**CSS-classes**
`.rhc-visually-hidden`

**Design tokens**
Geen component-specifieke tokens in de RHC-laag.
