# Repository Instructions

Shared Sites policy (`../AGENTS.md` when available) applies. These essentials also apply in standalone checkouts:
- Never SSH, SCP, SFTP, tunnel to, or configure access to production. Do not deploy it; protected server-side automation owns activation, and source delivery alone does not prove deployment.
- GitGuardian quota, authentication, network, or service failure is not a commit/push blocker. Review outgoing changes, run another available local secret scan, preserve other hooks, and stop on real secret findings.
- Commit small, coherent, validated changes frequently as work progresses and push completed work through this repository's authorized source path, usually its default branch; use pull requests only when required.
- Group related changes into meaningful deployable milestones. Align version metadata, create a new immutable annotated semver tag, and publish its matching verified GitHub release with the required accepted artifacts.
- Complete finished deployable work through the published release consumed by protected deployment. Independently verify public release identity and acceptance read-only, or report the exact remaining blocker. Never move published tags or replace published release assets.

## Site and Validation

- This is a static Incan Gold results page. Preserve all ten strategy rows and the no-client-JavaScript, `script-src 'none'` production contract. Do not introduce a resident Node or Cloudflare runtime to serve it.
- Use the pinned Node/npm versions, `npm ci --ignore-scripts`, `npm run check`, and `npm run audit:security` for application or dependency changes. `npm run build:static` and its tests verify the prerendered routes, native lock entries, and absence of client bundles. Keep the optional Sites adapter separate from the static production artifact.
- The reviewed local `vendor/braces` override is a source-level security fix, not an upstream release. Preserve its regression tests until a compatible upstream replacement is independently validated.
