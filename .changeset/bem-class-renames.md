---
'@rijkshuisstijl-community/file-css': major
'@rijkshuisstijl-community/file-react': major
'@rijkshuisstijl-community/language-navigation-css': major
'@rijkshuisstijl-community/language-navigation-react': major
'@rijkshuisstijl-community/navigation-list-css': major
'@rijkshuisstijl-community/navigation-list-item-react': major
'@rijkshuisstijl-community/message-list-css': major
'@rijkshuisstijl-community/message-list-item-react': major
'@rijkshuisstijl-community/footer-css': major
'@rijkshuisstijl-community/footer-react': major
'@rijkshuisstijl-community/pre-heading-css': major
'@rijkshuisstijl-community/pre-heading-react': major
'@rijkshuisstijl-community/components-css': major
'@rijkshuisstijl-community/components-react': major
'@rijkshuisstijl-community/components-angular': major
---

Breaking: niet-BEM-classnamen hernoemd naar plat `block__element`-formaat. Grandchild-selectors zijn platgeslagen (`rhc-navigation-list__item__start-icon` → `rhc-navigation-list__item-start-icon`, idem message-list, language-navigation en file) en pseudo-blokken zijn elementen geworden (`rhc-page-footer-container` → `rhc-page-footer__container`, `rhc-page-footer-layout` → `rhc-page-footer__layout`, `rhc-page-subfooter-layout` → `rhc-page-footer__subfooter-layout`, `rhc-heading-container` → `rhc-pre-heading__container`). Werk eigen selectors op deze classnamen bij.
