import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import test from 'node:test';

const repository = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

function dependencyFrom(parent, dependency, expectedVersion) {
  const parentEntry = realpathSync(require.resolve(parent));
  assert.ok(
    !relative(join(repository, 'node_modules'), parentEntry).startsWith(
      `..${sep}`,
    ),
  );
  const parentRequire = createRequire(parentEntry);
  const entry = realpathSync(parentRequire.resolve(dependency));
  let directory = dirname(entry);
  while (directory !== dirname(directory)) {
    try {
      const manifest = JSON.parse(
        readFileSync(join(directory, 'package.json'), 'utf8'),
      );
      if (manifest.name === dependency) {
        assert.equal(manifest.version, expectedVersion);
        return parentRequire(dependency);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    directory = dirname(directory);
  }
  throw new Error(`Could not identify installed ${dependency}`);
}

for (const parent of ['satori', '@shuding/opentype.js']) {
  test(`${parent} uses the compatible patched font decompressor`, () => {
    const compression = dependencyFrom(parent, 'fflate', '0.7.5');
    const content = Buffer.from(
      'Static font fixture with repeated glyph data. '.repeat(100),
    );
    assert.deepEqual(
      Buffer.from(compression.unzlibSync(deflateSync(content))),
      content,
    );
    const archive = compression.zipSync({ 'font.bin': content });
    assert.deepEqual(
      Buffer.from(compression.unzipSync(archive)['font.bin']),
      content,
    );
  });
}

test('AJV retains relative-reference resolution with its patched URI dependency', () => {
  const resolver = dependencyFrom('ajv', 'fast-uri', '3.1.9');
  assert.equal(
    resolver.resolve('https://schemas.example/base/root.json', '../types.json'),
    'https://schemas.example/types.json',
  );
  const Ajv = require('ajv');
  const validator = new Ajv();
  validator.addSchema({
    $id: 'https://schemas.example/types.json',
    type: 'integer',
    minimum: 1,
  });
  const validate = validator.compile({
    $id: 'https://schemas.example/base/root.json',
    $ref: '../types.json',
  });
  assert.equal(validate(1), true);
  assert.equal(validate(0), false);
  assert.equal(validate('1'), false);
});
