import overviews from '@rijkshuisstijl-community/components-css/dist/component-overviews.json';
import {
  Heading,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@rijkshuisstijl-community/components-react';
import { CopyDesignTokenButton } from '../templates/design-tokens/CopyDesignTokenButton';

interface ComponentOverview {
  version: number;
  component: string;
  packageName: string;
  classes: Array<{ className: string; selectors: string[]; tokens: string[] }>;
  tokens: Array<{ name: string; usedIn: string[]; fallbacks: string[]; isSet: boolean }>;
}

const componentOverviews = overviews as Record<string, ComponentOverview>;

export const CssComponentOverview = ({ component }: { component: string }) => {
  const overview = componentOverviews[component];

  if (!overview) {
    return null;
  }

  // Custom properties that are only set (not consumed) are implementation details, not theming hooks.
  const consumedTokens = overview.tokens.filter(({ usedIn }) => usedIn.length > 0);

  // `usedIn` contains class names for rules with classes, and raw selectors (e.g. `:root`) otherwise.
  const classNames = new Set(overview.classes.map(({ className }) => className));
  const formatUsedIn = (usedInName: string) => (classNames.has(usedInName) ? `.${usedInName}` : usedInName);

  return (
    <>
      <Heading level={2}>CSS classes</Heading>
      <Paragraph>
        Deze CSS classes zijn beschikbaar in <code>{overview.packageName}</code>.
      </Paragraph>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>CSS class</TableHeaderCell>
            <TableHeaderCell>Aantal design tokens</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {overview.classes.map(({ className, tokens }) => (
            <TableRow key={className}>
              <TableCell>
                <code>.{className}</code>
              </TableCell>
              <TableCell>{tokens.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {consumedTokens.length > 0 && (
        <>
          <Heading level={2}>Design tokens</Heading>
          <Paragraph>Dit component luistert naar de volgende design tokens.</Paragraph>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Design token</TableHeaderCell>
                <TableHeaderCell>Gebruikt in</TableHeaderCell>
                <TableHeaderCell>Fallback</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumedTokens.map(({ name, usedIn, fallbacks }) => (
                <TableRow key={name}>
                  <TableCell className="utrecht-table__cell--rhc-middle">
                    <CopyDesignTokenButton path={[name.replace(/^--/, '')]} />
                  </TableCell>
                  <TableCell>
                    {usedIn.map((usedInName, index) => (
                      <span key={usedInName}>
                        {index > 0 && ', '}
                        <code>{formatUsedIn(usedInName)}</code>
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    {fallbacks.map((fallback, index) => (
                      <span key={fallback}>
                        {index > 0 && ', '}
                        <code>{fallback}</code>
                      </span>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </>
  );
};
