# Repository Instructions

## Standing Dependency Completion Policy

Treat dependency remediation as part of completing authorized work on this
site, not as an optional follow-up. Proactively resolve vulnerabilities,
compatibility problems, broken installations and lockfile issues. Cover direct
and transitive dependencies, production and development dependencies,
workspaces and root-level tools. Do not dismiss findings because they are
pre-existing or development-only.

Before creating a release tag or publishing a release, require a clean locked
installation for every applicable dependency graph, zero known dependency
vulnerabilities in both full and production audits, and all applicable project
checks. An unavailable or incomplete audit is not a clean result. Use supported
upgrades, replacements or maintainable patches that preserve functionality.
Do not silence findings, weaken checks or force incompatible versions merely
to obtain a passing result.

Intermediate commits may capture coherent progress. Commit and push validated
work through this site's authorized delivery process, and complete meaningful
releases rather than stopping after reporting fixable dependency blockers.
Documentation-only housekeeping does not require an application release.

Preserve unrelated work, coordinate with other active chats, and retain existing
security, approval and production-access boundaries. Existing maintenance pauses
and repository exclusions remain in force; this policy does not expand access
or authorize otherwise excluded work. If a genuine blocker prevents completion,
preserve progress and report the exact blocker and remaining work. Distinguish
a published release from verified live deployment.

Treat this as a standing instruction for this site.

Shared Sites policy (`../AGENTS.md` when available) applies. These essentials also apply in standalone checkouts:

- Never SSH, SCP, SFTP, tunnel to, or configure access to production. Do not deploy it; protected server-side automation owns activation, and source delivery alone does not prove deployment.
- GitGuardian quota, authentication, network, or service failure is not a commit/push blocker. Review outgoing changes, run another available local secret scan, preserve other hooks, and stop on real secret findings.
- Commit small, coherent, validated changes frequently as work progresses and push completed work through this repository's authorized source path, usually its default branch; use pull requests only when required.
- Group related changes into meaningful deployable milestones. Align version metadata, create a new immutable annotated semver tag, and publish its matching verified GitHub release with the required accepted artifacts.
- Complete finished deployable work through the published release consumed by protected deployment. Independently verify public release identity and acceptance read-only, or report the exact remaining blocker. Never move published tags or replace published release assets.

## Site and Validation

- This is a static Incan Gold results page. Preserve all ten strategy rows and the no-client-JavaScript, `script-src 'none'` production contract. Do not introduce a resident Node or Cloudflare runtime to serve it.
- Build-input verification also requires Python 3 with descriptor-relative no-follow file access; keep Python build-only. Use pinned Node26.13.1 and select the reviewed npm12.2.2 profile with `export PATH="$(node scripts/build-tools.mjs --print-bin):$PATH"` before `npm ci --ignore-scripts`, `npm run check`, and `npm run audit:security`. `npm run build:static` and its tests verify the prerendered routes, native lock entries, and absence of client bundles. Keep the optional Sites adapter separate from the static production artifact.
- Preserve the exact hash-bound shared source under `vendor/webops-build-tools`; update it from the reviewed canonical template before changing consumers. Reuse compatible bounded SDK caches without changing bootstrap bytes or bypassing source, payload, full/production or signature verification. Its build-only tools never belong in the static publication tree.
- The reviewed local `vendor/braces` override is a source-level security fix, not an upstream release. Preserve its regression tests until a compatible upstream replacement is independently validated.
