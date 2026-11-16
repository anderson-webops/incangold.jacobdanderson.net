import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, deflateSync } from 'node:zlib';
import test from 'node:test';
import { verifyVendoredInputs } from '../scripts/build-tools.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);

test('build tools retain the exact reviewed canonical source', () => {
  const metadata = verifyVendoredInputs();
  assert.equal(metadata.repository, 'anderson-webops/vitesse-nuxt-template');
  assert.ok(Object.keys(metadata.files).length > 0);
});

test('build tools reject changed or undeclared vendored inputs', () => {
  const runs = join(repository, '.ai-work/runs');
  mkdirSync(runs, { recursive: true });
  const scratch = mkdtempSync(join(runs, 'build-input-integrity-'));
  const original = join(repository, 'vendor/webops-build-tools');
  const copied = join(scratch, 'tools');
  try {
    cpSync(original, copied, { recursive: true });
    const filename = 'scripts/build-toolchain.mjs';
    writeFileSync(join(copied, filename), 'changed fixture');
    assert.throws(
      () => verifyVendoredInputs(copied),
      /Vendored build input differs/,
    );
    copyFileSync(join(original, filename), join(copied, filename));
    writeFileSync(join(copied, 'undeclared.mjs'), 'extra fixture');
    assert.throws(
      () => verifyVendoredInputs(copied),
      /Unexpected vendored build inputs/,
    );
  } finally {
    rmSync(scratch, { recursive: true });
  }
});

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
    const output = new Uint8Array(content.length);
    assert.equal(
      compression.inflateSync(deflateRawSync(content), output),
      output,
    );
    assert.deepEqual(Buffer.from(output), content);
    const archive = compression.zipSync({ 'font.bin': content });
    assert.deepEqual(
      Buffer.from(compression.unzipSync(archive)['font.bin']),
      content,
    );
  });
}

test('patched ZIP64 parsing rejects missing or unrelated extra fields without hanging', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      const compression = createRequire(import.meta.url)(process.argv[1]);
      for (const options of [{}, { extra: { 2: new Uint8Array([1, 2]) } }]) {
        const archive = Buffer.from(compression.zipSync({ 'font.bin': new Uint8Array([1, 2, 3]) }, options));
        const end = archive.length - 22;
        const central = archive.readUInt32LE(end + 16);
        archive.writeUInt32LE(0xffffffff, central + 20);
        const record = Buffer.alloc(56);
        record.writeUInt32LE(0x06064b50);
        record.writeBigUInt64LE(44n, 4);
        record.writeBigUInt64LE(1n, 24);
        record.writeBigUInt64LE(1n, 32);
        record.writeBigUInt64LE(BigInt(end - central), 40);
        record.writeBigUInt64LE(BigInt(central), 48);
        const locator = Buffer.alloc(20);
        locator.writeUInt32LE(0x07064b50);
        locator.writeBigUInt64LE(BigInt(end), 8);
        locator.writeUInt32LE(1, 16);
        const footer = Buffer.from(archive.subarray(end));
        footer.writeUInt16LE(0xffff, 8);
        footer.writeUInt32LE(0xffffffff, 16);
        const malformed = Buffer.concat([archive.subarray(0, end), record, locator, footer]);
        assert.throws(() => compression.unzipSync(malformed), { code: 13 });
      }
      `,
      require.resolve('fflate'),
    ],
    {
      cwd: repository,
      encoding: 'utf8',
      timeout: 2_000,
      killSignal: 'SIGKILL',
    },
  );
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  assert.equal(result.status, 0, result.stderr);
});

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
