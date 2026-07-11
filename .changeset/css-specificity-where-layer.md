---
'@rijkshuisstijl-community/accordion-css': major
'@rijkshuisstijl-community/alert-css': major
'@rijkshuisstijl-community/article-css': major
'@rijkshuisstijl-community/blockquote-css': major
'@rijkshuisstijl-community/breadcrumb-nav-css': major
'@rijkshuisstijl-community/button-css': major
'@rijkshuisstijl-community/card-as-link-css': major
'@rijkshuisstijl-community/card-css': major
'@rijkshuisstijl-community/checkbox-css': major
'@rijkshuisstijl-community/checkbox-group-css': major
'@rijkshuisstijl-community/data-badge-button-css': major
'@rijkshuisstijl-community/data-summary-css': major
'@rijkshuisstijl-community/figure-css': major
'@rijkshuisstijl-community/footer-css': major
'@rijkshuisstijl-community/heading-css': major
'@rijkshuisstijl-community/hero-css': major
'@rijkshuisstijl-community/language-navigation-css': major
'@rijkshuisstijl-community/components-css': major
'@rijkshuisstijl-community/link-css': major
'@rijkshuisstijl-community/link-list-css': major
'@rijkshuisstijl-community/logo-css': major
'@rijkshuisstijl-community/navigation-bar-css': major
'@rijkshuisstijl-community/number-badge-css': major
'@rijkshuisstijl-community/page-number-navigation-css': major
'@rijkshuisstijl-community/paragraph-css': major
'@rijkshuisstijl-community/pre-heading-css': major
'@rijkshuisstijl-community/radio-css': major
'@rijkshuisstijl-community/radio-group-css': major
'@rijkshuisstijl-community/rounded-corner-css': major
'@rijkshuisstijl-community/separator-css': major
'@rijkshuisstijl-community/side-nav-css': major
'@rijkshuisstijl-community/skip-link-css': major
'@rijkshuisstijl-community/text-input-css': major
'@rijkshuisstijl-community/textarea-css': major
'@rijkshuisstijl-community/toggletip-css': major
---

Selector-specificiteit begrensd op 0,1,0 met `:where()` en upstream CSS in een cascade layer geplaatst.

- Alle selectors behouden dezelfde matching (combinaties van Utrecht-, NL- en RHC-classes), maar alles behalve één "live" class staat nu in `:where()`. Elke regel heeft daardoor precies specificiteit 0,1,0 (plus eventueel een pseudo-element), zodat afnemers elke stijl kunnen overschrijven met één enkele class.
- Ingesloten upstream CSS (Utrecht, NL Design System kandidaat, Amsterdam) staat nu in de cascade layer `rhc-upstream`. Ongelaagde Rijkshuisstijl-regels winnen daardoor altijd van upstream, ongeacht specificiteit.
- Stylelint dwingt de limiet af via `selector-max-specificity: 0,1,0` voor `packages/components-css/**`.

BREAKING: doordat upstream CSS in een layer staat en eigen regels naar 0,1,0 zijn verlaagd, kan bestaande afnemers-CSS die eerder verloor van hogere specificiteit nu winnen. Controleer eigen overrides na het updaten.
