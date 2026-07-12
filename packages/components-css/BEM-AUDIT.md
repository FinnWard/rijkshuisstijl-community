<!-- @license CC0-1.0 -->

# BEM-audit CSS-componenten

Dit document beschrijft de resultaten van een audit van de class-namen in
`packages/components-css` tegen de BEM-conventie
(`rhc-block__element--modifier`) en licht toe welke afwijkingen bewust
_niet_ zijn aangepast.

De stylelint-regel `selector-class-pattern` staat sinds deze audit maximaal
één `__`-elementscheiding toe, zodat grandchild-selectors
(`block__element__element`) niet opnieuw kunnen ontstaan.

## Opgeloste afwijkingen

Grandchild-selectors zijn platgeslagen (tweede `__` wordt `-`) en
pseudo-blokken met een koppelteken zijn elementen van hun echte blok
geworden:

| Oud                                                                  | Nieuw                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `rhc-file__inner-container__sub`                                     | `rhc-file__inner-container-sub`                                     |
| `rhc-language-navigation__list__item{,--selected,--html-li}`         | `rhc-language-navigation__list-item{,--selected,--html-li}`         |
| `rhc-navigation-list__item__{start-icon,label,description,end-icon}` | `rhc-navigation-list__item-{start-icon,label,description,end-icon}` |
| `rhc-message-list__item__{label,description,meta-data,end-icon}`     | `rhc-message-list__item-{label,description,meta-data,end-icon}`     |
| `rhc-page-footer-container`                                          | `rhc-page-footer__container`                                        |
| `rhc-page-footer-layout`                                             | `rhc-page-footer__layout`                                           |
| `rhc-page-subfooter-layout`                                          | `rhc-page-footer__subfooter-layout`                                 |
| `rhc-heading-container`                                              | `rhc-pre-heading__container`                                        |

## Bewust niet aangepast

### Samengestelde bloknamen `rhc-form-field-*`

`rhc-form-field-checkbox-option`, `rhc-form-field-radio-option` (met
element `__input`) en `rhc-form-field-select` lijken elementen van
`rhc-form-field`, maar zijn legitieme samengestelde bloknamen: elk komt
één-op-één overeen met een eigen component
(`FormFieldCheckboxOption`, `FormFieldRadio`, `FormFieldSelect`) en volgt
de naamgeving van de bovenliggende Utrecht-component
(`utrecht-form-field`). Hernoemen zou web-components en Storybook-story-id's
meetrekken zonder dat de naam er BEM-technisch beter van wordt.

### Bloknaam ≠ pakketnaam: `rhc-nav-bar` / `rhc-sub-nav-bar`

Het pakket `navigation-bar-css` definieert de blokken `rhc-nav-bar` en
`rhc-sub-nav-bar`. Dat is geldige BEM; alleen de bloknaam wijkt af van de
pakketnaam. Hernoemen naar `rhc-navigation-bar` raakt ±40 verwijzingen in
React, Angular (incl. specs), Storybook-templates en voorbeeld-apps, plus
±20 design-tokens (`--rhc-nav-bar-*`) die dan niet meer bij de classnaam
passen. Buiten scope gelaten.

Let op: in `navigation-bar-react/src/NavBar.tsx` staat de typefout
`rhc-nav-bar__lable--sr-only` (moet `label` zijn); er bestaat geen
bijbehorende CSS-selector.

### Modifier-ketens

Namen als `rhc-card-as-link--default--focus` (mixins in
`card-as-link-css`) en selectors als
`rhc-data-summary--column__item-key` (modifier vóór element) zijn strikt
genomen geen zuivere BEM, maar zijn consistent binnen hun component en
worden door de aangescherpte lint-regel toegestaan.

### Statusklassen

Statussen worden wisselend uitgedrukt; een uniforme keuze is een aparte,
breaking exercitie:

- ongeldig: `rhc-checkbox--invalid` naast `rhc-file--error`, naast
  upstream `utrecht-textbox--invalid`/`utrecht-radio-button--invalid`,
  naast `[aria-invalid="true"]`;
- uitgeschakeld: `rhc-checkbox--disabled` naast `:disabled` +
  `utrecht-radio-button--disabled`;
- geselecteerd/actueel: `rhc-language-navigation__list-item--selected`
  naast `[aria-current="page"]` (side-nav).

### Dubbel gedefinieerd blok `rhc-code-input`

Zowel `code-input-css` als `code-input-group-css` definiëren het blok
`rhc-code-input`. De definities overlappen niet volledig; samenvoegen in
`code-input-css` (en `code-input-group-css` alleen laten verwijzen) is een
logische vervolgstap.
