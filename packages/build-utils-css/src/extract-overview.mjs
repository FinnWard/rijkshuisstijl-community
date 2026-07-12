import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import valueParser from 'postcss-value-parser';

const CUSTOM_PROPERTY_PREFIX = '--';

const isInsideKeyframes = (rule) => {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && parent.name.toLowerCase().endsWith('keyframes')) {
      return true;
    }
  }
  return false;
};

const getClassNames = (selector) => {
  const classNames = [];
  selectorParser((selectors) => {
    selectors.walkClasses((classNode) => {
      classNames.push(classNode.value);
    });
  }).processSync(selector);
  return classNames;
};

const getVarReferences = (value) => {
  const references = [];
  valueParser(value).walk((node) => {
    if (node.type === 'function' && node.value.toLowerCase() === 'var') {
      const [first, ...rest] = node.nodes;
      if (first?.type === 'word' && first.value.startsWith(CUSTOM_PROPERTY_PREFIX)) {
        const dividerIndex = rest.findIndex((restNode) => restNode.type === 'div' && restNode.value === ',');
        const fallback = dividerIndex === -1 ? undefined : valueParser.stringify(rest.slice(dividerIndex + 1)).trim();
        references.push({ name: first.value, fallback });
      }
    }
  });
  return references;
};

const sortStrings = (values) => [...values].sort((a, b) => a.localeCompare(b, 'en'));

export const componentNameFromPackageName = (packageName) => packageName.replace(/^@[^/]+\//, '').replace(/-css$/, '');

/**
 * Extracts an overview of CSS classes and consumed design tokens (custom properties) from a stylesheet.
 * @param {string} css The stylesheet contents.
 * @param {{ component?: string, packageName: string }} options Component metadata for the overview.
 * @returns The component overview.
 */
export const extractOverview = (css, { component, packageName }) => {
  const classMap = new Map();
  const tokenMap = new Map();

  const getClassEntry = (className) => {
    if (!classMap.has(className)) {
      classMap.set(className, { selectors: new Set(), tokens: new Set() });
    }
    return classMap.get(className);
  };

  const getTokenEntry = (name) => {
    if (!tokenMap.has(name)) {
      tokenMap.set(name, { usedIn: new Set(), fallbacks: new Set(), isSet: false });
    }
    return tokenMap.get(name);
  };

  const root = postcss.parse(css);

  root.walkRules((rule) => {
    if (isInsideKeyframes(rule)) {
      return;
    }

    // Token usage is attributed to the class names in the selectors,
    // or to the raw selector for rules without classes (e.g. `:root`).
    const usedInNames = new Set();
    for (const selector of rule.selectors) {
      const classNames = getClassNames(selector);
      if (classNames.length === 0) {
        usedInNames.add(selector);
      }
      for (const className of classNames) {
        usedInNames.add(className);
        getClassEntry(className).selectors.add(selector);
      }
    }

    rule.walkDecls((decl) => {
      if (decl.parent !== rule) {
        return;
      }
      if (decl.prop.startsWith(CUSTOM_PROPERTY_PREFIX)) {
        getTokenEntry(decl.prop).isSet = true;
      }
      for (const { name, fallback } of getVarReferences(decl.value)) {
        const tokenEntry = getTokenEntry(name);
        for (const usedInName of usedInNames) {
          tokenEntry.usedIn.add(usedInName);
          if (classMap.has(usedInName)) {
            classMap.get(usedInName).tokens.add(name);
          }
        }
        if (fallback && !fallback.toLowerCase().startsWith('var(')) {
          tokenEntry.fallbacks.add(fallback);
        }
      }
    });
  });

  return {
    version: 1,
    component: component ?? componentNameFromPackageName(packageName),
    packageName,
    classes: sortStrings(classMap.keys()).map((className) => ({
      className,
      selectors: sortStrings(classMap.get(className).selectors),
      tokens: sortStrings(classMap.get(className).tokens),
    })),
    tokens: sortStrings(tokenMap.keys()).map((name) => ({
      name,
      usedIn: sortStrings(tokenMap.get(name).usedIn),
      fallbacks: sortStrings(tokenMap.get(name).fallbacks),
      isSet: tokenMap.get(name).isSet,
    })),
  };
};
