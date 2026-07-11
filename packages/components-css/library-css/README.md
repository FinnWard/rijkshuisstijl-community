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

Dit pakket bevat de CSS-variabelen van het design systeem. Importeer het `index.css`-bestand uit de `dist` map van het
pakket, en omring het deel van je applicatie waar je het thema wilt toepassen met de Rijkshuisstijl-thema: `rhc-theme`.

```scss
@import '@rijkshuisstijl-community/design-tokens/dist/index.css'; // design tokens importeren
@import '@rijkshuisstijl-community/components-css/dist/index.css'; // css importeren
```

#### Thema wijzigen

Om een ander thema toe te passen moet je het importeren van `import '@rijkshuisstijl-community/design-tokens/dist/{thema}/index.css';` en de class aanpassen naar het desbetreffende thema.
Zie het volgende voorbeeld om het thema "groen" toe te passen:

```scss
@import '@rijkshuisstijl-community/design-tokens/dist/groen/index.css'; // design tokens importeren
@import '@rijkshuisstijl-community/components-css/dist/index.css'; // css importeren
```

Bekijk de [packages/font/README.md](https://github.com/nl-design-system/rijkshuisstijl-community/blob/main/packages/font/README.md) voor de meerdere manieren om de lettertypen te installeren voor jouw project.

## Specificiteit: maximaal 0,1,0 met `:where()`

Alle selectors in dit project hebben een specificiteit van precies **0,1,0** (één class), eventueel aangevuld met een
pseudo-element (`::before`/`::after`). Daardoor kun je als afnemer elke stijl overschrijven met één enkele class,
zolang jouw CSS ná de design-system-CSS geladen wordt.

De conventie: per selector blijft precies één class "live" — de class van het element dat gestyled wordt. Alle andere
classes, attribuutselectors en pseudo-classes (ook states zoals `:hover` en `:focus`) staan in `:where()`, dat niet
meetelt voor specificiteit maar wél gewoon matcht:

| Zonder conventie                            | Met conventie                                       |
| ------------------------------------------- | --------------------------------------------------- |
| `.rhc-hero__message .utrecht-heading-group` | `:where(.rhc-hero__message) .utrecht-heading-group` |
| `.rhc-card:active .rhc-card__heading`       | `:where(.rhc-card:active) .rhc-card__heading`       |
| `.rhc-article.utrecht-article`              | `.rhc-article:where(.utrecht-article)`              |
| `.nl-link:any-link`                         | `.nl-link:where(:any-link)`                         |
| `.rhc-hero--x:not(.rhc-hero--y)`            | `.rhc-hero--x:where(:not(.rhc-hero--y))`            |
| genest `&:hover`                            | `&:where(:hover)`                                   |

De ingesloten upstream-CSS (Utrecht, NL Design System kandidaat, Amsterdam) staat in de cascade layer
`rhc-upstream`. Ongelaagde regels — die van dit design system én die van afnemers — winnen daardoor altijd van
upstream-CSS, ongeacht de specificiteit van de upstream-selectors.

De limiet wordt afgedwongen met stylelint (`selector-max-specificity: "0,1,0"` voor `packages/components-css/**`);
nieuwe selectors die de limiet overschrijden vallen de CI-lint af.
