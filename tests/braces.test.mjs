import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const rootRequire = createRequire(import.meta.url);

function buildChain() {
  const fastGlobRequire = createRequire(rootRequire.resolve('fast-glob'));
  const packageRequire = createRequire(fastGlobRequire.resolve('micromatch'));
  return {
    braces: packageRequire('braces'),
    micromatch: packageRequire('micromatch'),
    version: packageRequire('braces/package.json').version,
  };
}

test('the Vinext build chain resolves the guarded source package', async () => {
  const lock = JSON.parse(
    await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'),
  );
  const installed = buildChain();
  assert.ok(
    lock.packages['node_modules/vinext']?.dependencies?.[
      'vite-plugin-commonjs'
    ],
  );
  assert.ok(
    lock.packages['node_modules/vite-plugin-commonjs']?.dependencies?.[
      'vite-plugin-dynamic-import'
    ],
  );
  assert.ok(
    lock.packages['node_modules/vite-plugin-dynamic-import']?.dependencies?.[
      'fast-glob'
    ],
  );
  assert.ok(lock.packages['node_modules/fast-glob']?.dependencies?.micromatch);
  assert.ok(lock.packages['node_modules/micromatch']?.dependencies?.braces);
  assert.equal(installed.version, '3.0.4-webops.1');
  assert.equal(lock.packages['node_modules/braces']?.resolved, 'vendor/braces');
  assert.equal(lock.packages['node_modules/braces']?.link, true);
  assert.equal(lock.packages['vendor/braces']?.version, '3.0.4-webops.1');
  assert.ok(
    !Object.keys(lock.packages).some(
      (path) =>
        path.endsWith('/braces') && lock.packages[path]?.version === '3.0.3',
    ),
  );
});

test('ordinary glob patterns retain compile and expansion behavior', () => {
  const { braces, micromatch } = buildChain();
  assert.deepEqual(braces('a/{b,c}/d'), ['a/(b|c)/d']);
  assert.deepEqual(braces.expand('a/{b,c}/d'), ['a/b/d', 'a/c/d']);
  assert.deepEqual(braces.expand('item-{1..3}'), [
    'item-1',
    'item-2',
    'item-3',
  ]);
  assert.equal(braces.stringify('a/{b,c}/d'), 'a/{b,c}/d');
  assert.deepEqual(micromatch(['foo-a', 'foo-b', 'foo-c'], 'foo-{a,b}'), [
    'foo-a',
    'foo-b',
  ]);
  assert.ok(braces.parse(`${'{'.repeat(256)}x${'}'.repeat(256)}`));
  assert.ok(braces.parse(`${'('.repeat(101)}x${')'.repeat(101)}`));
  assert.throws(() => braces.parse(`${'{'.repeat(257)}x${'}'.repeat(257)}`), {
    name: 'SyntaxError',
    message: 'Brace pattern exceeds maximum nesting depth (256)',
  });
});

test('fast-glob retains ordinary brace matching through the build chain', () => {
  const fastGlob = rootRequire('fast-glob');
  assert.deepEqual(fastGlob.sync('app/{page,layout}.tsx').sort(), [
    'app/layout.tsx',
    'app/page.tsx',
  ]);
});

test('deep strings fail before recursive walkers exhaust the stack', () => {
  const { braces } = buildChain();
  for (const input of [
    `${'{'.repeat(4000)}x${'}'.repeat(4000)}`,
    `${'('.repeat(4000)}x${')'.repeat(4000)}`,
  ]) {
    for (const operation of [
      braces.parse,
      braces.compile,
      braces.expand,
      braces.stringify,
      braces,
    ]) {
      assert.throws(() => operation(input), {
        name: 'SyntaxError',
        message: 'Brace pattern exceeds maximum nesting depth (256)',
      });
    }
  }
});

test('direct AST walkers cannot bypass the depth limit', () => {
  const { braces } = buildChain();
  for (const operation of [braces.compile, braces.expand, braces.stringify]) {
    const ast = { type: 'root', nodes: [] };
    let current = ast;
    for (let depth = 0; depth < 257; depth += 1) {
      const child = { type: 'brace', nodes: [], parent: current };
      current.nodes.push(child);
      current = child;
    }
    current.nodes.push({ type: 'text', value: 'x', parent: current });
    assert.throws(() => operation(ast), {
      name: 'SyntaxError',
      message: 'Brace pattern exceeds maximum nesting depth (256)',
    });
  }
});
