---
'@rijkshuisstijl-community/action-group-css': minor
'@rijkshuisstijl-community/article-css': minor
'@rijkshuisstijl-community/blockquote-css': minor
'@rijkshuisstijl-community/breadcrumb-nav-css': minor
'@rijkshuisstijl-community/button-css': minor
'@rijkshuisstijl-community/checkbox-css': minor
'@rijkshuisstijl-community/code-input-group-css': minor
'@rijkshuisstijl-community/data-badge-button-css': minor
'@rijkshuisstijl-community/figure-css': minor
'@rijkshuisstijl-community/file-css': minor
'@rijkshuisstijl-community/footer-css': minor
'@rijkshuisstijl-community/hero-css': minor
'@rijkshuisstijl-community/language-navigation-css': minor
'@rijkshuisstijl-community/link-button-css': minor
'@rijkshuisstijl-community/link-list-css': minor
'@rijkshuisstijl-community/listbox-css': minor
'@rijkshuisstijl-community/ordered-list-css': minor
'@rijkshuisstijl-community/pre-heading-css': minor
'@rijkshuisstijl-community/radio-css': minor
'@rijkshuisstijl-community/radio-group-css': minor
'@rijkshuisstijl-community/separator-css': minor
'@rijkshuisstijl-community/text-input-css': minor
'@rijkshuisstijl-community/textarea-css': minor
'@rijkshuisstijl-community/unordered-list-css': minor
'@rijkshuisstijl-community/components-css': major
---

Elk rhc CSS-pakket exporteert nu ook de CSS van de onderliggende Utrecht/NL Design System-component (via `@forward`), zodat een losse import van een rhc-component-CSS direct compleet is. De centrale `@import`-lijst in components-css bevat alleen nog componenten zonder eigen rhc-pakket en gebruikt `@forward` zodat niets dubbel in de bundel komt. `file-css` verliest de ongebruikte dependency `@utrecht/component-library-css`.
