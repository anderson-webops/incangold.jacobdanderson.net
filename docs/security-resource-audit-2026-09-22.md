# Security and resource audit: 2026-09-22

## Disposition

Incan Gold remains a static, script-free site. It has no resident Node process,
database, account system, authentication flow, cookies, background workers,
queues, writable runtime state, or production container. The existing Nginx
static-host model is the minimum-memory production architecture for this site.

## Findings resolved

1. The generated scaffold retained unused component, chart, calendar, carousel,
   command-menu, icon, animation, and component-CLI packages. They were removed
   after confirming that no source file imported them. The clean local install
   fell from 553 audited packages, 676 MB, and 38,302 files to 206 audited
   packages, 415 MB, and 8,597 files.
2. Framework and build dependencies were advanced within compatible lines. Node
   remains pinned to 24.18.1, npm to 12.0.2, Node types to the 24 line, and
   TypeScript to the compatible 5.9 line.
3. Vinext's optional Cloudflare build emits a workerd-only `cloudflare:` import.
   Bare Node cannot load that import during static prerender. The production
   static build now omits only the optional Sites/Cloudflare adapter, while the
   separate adapter build remains enabled and tested. A regression assertion
   rejects worker-only imports in the static prerender bundle.
4. The updated linter replaced its former combined React Compiler rule with
   individual checks. The repository now enables the equivalent recommended
   compiler checks explicitly instead of dropping that coverage.
5. Install scripts for esbuild, fsevents, and workerd are explicitly denied.
   The checked-in platform packages are sufficient for both validated build
   modes, so the repository does not grant unnecessary install-time execution.
6. CI and grouped dependency-update policies now bound future drift and limit
   the number of automated pull requests.
7. A lockfile regression check requires the Linux ARM64 GNU native packages used
   by the build graph, preventing cross-platform lockfile regeneration from
   silently dropping production bindings.

## Authorization and data-flow review

There are no promotion, demotion, administrative, session, or user-data flows
to authorize. The only outbound link is fixed source content and uses
`rel="noreferrer"`. The rendered artifact contains no forms, inputs, event
handlers, executable application entry point, secrets, environment details, or
dynamic provider calls. The production host's existing `script-src 'none'`
policy remains compatible with the artifact.

## Verification

- Clean locked installation under Node 24.18.1 and npm 12.0.2
- Full and production dependency audits at low severity: zero findings
- Registry signature audit: passed
- Lint with type-aware checks: passed
- TypeScript check: passed
- Linux ARM64 native lockfile verification: passed
- Optional Sites/Cloudflare build: passed
- Static two-route prerender: passed
- Four static artifact tests: passed
- Static artifact: 79 files, about 1.5 MB, with no application/UI client entry
  and no `cloudflare:` import in the prerender server bundle

Daybreak Deep Security did not produce a repository result in this session. Its
read-only worker could not start because the parent task lacked the required
managed filesystem permission profile. This is an external scanner execution
blocker, not evidence of zero Daybreak findings. The source review and checks
above remain independently valid.

No DNS, Nginx, production service, certificate, firewall, or live release was
changed by this source audit.
