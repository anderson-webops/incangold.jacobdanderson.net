# Dependency acceptance

The maintenance candidate uses supported stable Vinext and React releases while
retaining the passive static publication contract and all ten strategy rows.

AJV's URI dependency resolves its compatible 3.x line at fast-uri 3.1.9.
OpenType resolves the upstream fflate 0.7.5 security backport through its own
supported range. Satori still pins vulnerable 0.7.3, so its parent-scoped override
retains the compatible 0.7.5 patch. The redundant AJV and OpenType overrides are
removed; their updated lock entries select the patched versions themselves.
Their functional regressions verify the installed parent resolution,
font decompression with its caller-provided output buffer, ZIP roundtrips and
relative JSON-schema references. Bounded child-process coverage rejects ZIP64
records with missing or unrelated extra fields without hanging.

Retain the separately reviewed local braces source and its existing regressions.
Shared build-only npm inputs and bootstrap code retain the exact qualified
canonical source and license. Before execution, the site verifies their complete
file set and hashes, rejects extra or linked inputs, and checks the selected
Node/npm identity. Independent full/production audits cover the build profile
and original-library compatibility graph alongside application audits. Signature
audits cover installed registry packages; the uninstalled compatibility graph
retains lockfile audits and exact upstream-archive source-hash verification.
