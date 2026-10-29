# Guarded braces fork

This local package is based on upstream `braces@3.0.3` (MIT; see `LICENSE`) and the maintained source fix in `anderson-webops/analytics-umami-template` commit `da3a73de55da4630dea810a6871d376034f0af51`. It exists because upstream has not published a patched release for [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

The fork limits structural nesting in the parser and checks directly supplied ASTs before the recursive compile, expand, and stringify walkers. The root npm override makes the Vinext build chain use this fork. `tests/braces.test.mjs` checks the installed resolution, reported exhaustion patterns, direct AST entry points, and ordinary expansion behavior.

Replace this fork only after upstream publishes a verified fix and the same compatibility and audit checks pass against it.

The second patch also bounds shallow expansion to 10,000 cumulative generated
items and 1 MiB of UTF-8 output, including intermediate products and ranges
whose ordinary limit is disabled. It follows the reviewed canonical template
repair while preserving the original depth and ordinary-glob checks.
