import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));

assert.ok(lock.lockfileVersion >= 3, 'package-lock.json must use lockfile v3');

const requiredLinuxArm64Packages = [
  '@cloudflare/workerd-linux-arm64',
  '@esbuild/linux-arm64',
  '@oxfmt/binding-linux-arm64-gnu',
  '@oxlint-tsgolint/linux-arm64',
  '@oxlint/binding-linux-arm64-gnu',
  '@rolldown/binding-linux-arm64-gnu',
  '@tailwindcss/oxide-linux-arm64-gnu',
  'lightningcss-linux-arm64-gnu',
];

for (const packageName of requiredLinuxArm64Packages) {
  const entry = lock.packages?.[`node_modules/${packageName}`];
  assert.ok(entry, `lockfile is missing ${packageName}`);
  assert.equal(
    entry.cpu?.includes('arm64'),
    true,
    `${packageName} must target arm64`,
  );
  assert.equal(
    entry.os?.includes('linux'),
    true,
    `${packageName} must target Linux`,
  );
  assert.match(
    entry.integrity ?? '',
    /^sha512-/,
    `${packageName} must have integrity metadata`,
  );
}

console.log(
  `Verified ${requiredLinuxArm64Packages.length} Linux ARM64 native lockfile packages.`,
);
