import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

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
  const sources = Object.values(manifest).flatMap((entry) =>
    entry.src ? [entry.src] : [],
  );
  assert.ok(sources.length > 0, 'client manifest was generated');
  // Vinext emits framework bootstrapping even for static routes. Any application
  // or UI-library entry here reintroduces hydration into the no-JavaScript site.
  for (const source of sources) {
    assert.ok(
      source === 'virtual:vinext-app-browser-entry' ||
        source.startsWith('node_modules/vinext/'),
      `unexpected client module: ${source}`,
    );
  }
});

test('the static prerender bundle is independent of the optional worker runtime', async () => {
  const serverBundle = await read('dist/server/index.js');
  assert.doesNotMatch(
    serverBundle,
    /(?:from|import\()\s*["']cloudflare:/,
    'bare-Node prerender must not import workerd-only cloudflare: modules',
  );
});
