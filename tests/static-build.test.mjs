import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { posix } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

function frameworkClientEntry(source, file, referenceSources) {
  const frameworkSource = (value) =>
    value.startsWith('node_modules/vinext/') &&
    posix.normalize(value) === value;
  if (!Object.keys(referenceSources).every(frameworkSource)) return false;
  if (frameworkSource(source)) return true;
  if (
    [
      'virtual:vinext-app-browser-entry',
      'virtual:vinext-app-route-manifest',
      'virtual:vinext-client-reference-chunks',
    ].includes(source)
  )
    return true;
  return (
    source.startsWith('virtual:vinext-client-reference-module/') &&
    Object.values(referenceSources).includes(file)
  );
}

// Inspect the HTML already rendered by the build, without running framework
// scripts. The production host serves this content with script-src 'none'.
function markupOnly(html) {
  return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
}

function text(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

test('home HTML contains the complete ranking without executing JavaScript', async () => {
  const html = markupOnly(
    await read('dist/server/prerendered-routes/index.html'),
  );
  assert.match(html, /<title>Incan Gold Strategy Results<\/title>/);
  const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)];
  assert.equal(tables.length, 1);
  const table = tables[0][1];
  assert.match(
    table,
    /<caption\b[^>]*>Final ranking of the ten Incan Gold strategy finalists<\/caption>/,
  );
  const body = table.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)?.[1];
  assert.ok(body, 'ranking has a rendered table body');
  const rows = [...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((row) =>
    [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((cell) =>
      text(cell[1]),
    ),
  );
  assert.deepEqual(rows, [
    ['01', 'Leave after 7 treasure or 7 turns', '17.969', '±0.068', '5/10'],
    ['02', 'Leave after 8 treasure or 7 turns', '17.937', '±0.071', '1/10'],
    [
      '03',
      'Switch after 1 hazards (stay->leave after 7 turns)',
      '17.910',
      '±0.073',
      '2/10',
    ],
    ['04', 'Leave after 9 treasure or 7 turns', '17.900', '±0.072', '0/10'],
    ['05', 'Leave after 10 treasure or 7 turns', '17.885', '±0.073', '0/10'],
    ['06', 'Leave after 11 treasure or 7 turns', '17.874', '±0.073', '0/10'],
    [
      '07',
      'Artifact opportunist (<=3 players, 2+ artifacts, base 7 turns)',
      '17.871',
      '±0.073',
      '0/10',
    ],
    [
      '08',
      'Artifact value vs risk (bank 10, risk 2, <=2 players, base 7 turns)',
      '17.871',
      '±0.073',
      '0/10',
    ],
    ['09', 'Leave after 6 treasure or 8 turns', '17.839', '±0.068', '1/10'],
    ['10', 'Leave after 7 treasure or 8 turns', '17.788', '±0.074', '1/10'],
  ]);
  assert.match(text(html), /50,000 games per finalist/);
  assert.match(text(html), /Seed 246813579/);
  assert.match(text(html), /not a universally optimal way to play/);
  assert.equal(
    [...html.matchAll(/<svg\b/g)].length,
    2,
    'both decorative icons are rendered',
  );
  assert.doesNotMatch(
    html,
    /<(?:button|input|form|select|textarea|iframe)\b|\son[a-z]+\s*=|javascript:/i,
  );
});

test('404 is prerendered without relying on a running application', async () => {
  const html = markupOnly(
    await read('dist/server/prerendered-routes/404.html'),
  );
  assert.match(text(html), /404/);
  assert.match(text(html), /not found|could not be found/i);
  assert.doesNotMatch(html, /<table\b/);
});

test('the client build has no application or third-party UI entry points', async () => {
  const manifest = JSON.parse(await read('dist/client/.vite/manifest.json'));
  const referenceSources = JSON.parse(
    await read('dist/client/.vite/vinext-client-reference-sources.json'),
  );
  const entries = Object.values(manifest).filter((entry) => entry.src);
  assert.ok(entries.length > 0, 'client manifest was generated');
  // Vinext emits framework bootstrapping even for static routes. Any application
  // or UI-library entry here reintroduces hydration into the no-JavaScript site.
  for (const entry of entries) {
    assert.ok(
      frameworkClientEntry(entry.src, entry.file, referenceSources),
      `unexpected client module: ${entry.src}`,
    );
  }
});

test('framework metadata cannot admit application or third-party client code', () => {
  const references = {
    'node_modules/vinext/dist/shims/layout-segment-context.js': 'framework.js',
  };
  assert.equal(
    frameworkClientEntry(
      'virtual:vinext-client-reference-module/layout',
      'framework.js',
      references,
    ),
    true,
  );
  for (const source of [
    'app/page.tsx',
    'node_modules/react-icons/fi/index.js',
    'node_modules/vinext/../react/index.js',
    'virtual:vinext-app-route-manifest-application',
  ])
    assert.equal(frameworkClientEntry(source, 'app.js', references), false);
  assert.equal(
    frameworkClientEntry(
      'virtual:vinext-client-reference-module/widget',
      'app.js',
      references,
    ),
    false,
  );
  assert.equal(
    frameworkClientEntry(
      'virtual:vinext-client-reference-chunks',
      'bundle.js',
      { 'app/widget.tsx': 'app.js' },
    ),
    false,
  );
});

test('the static prerender bundle is independent of the optional worker runtime', async () => {
  const serverBundle = await read('dist/server/index.js');
  assert.doesNotMatch(
    serverBundle,
    /(?:from|import\()\s*["']cloudflare:/,
    'bare-Node prerender must not import workerd-only cloudflare: modules',
  );
});
