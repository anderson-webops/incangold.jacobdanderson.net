# Dependency acceptance

The maintenance candidate uses supported stable Vinext and React releases while
retaining the passive static publication contract and all ten strategy rows.

AJV's URI dependency stays on its compatible 3.x line at fast-uri 3.1.9.
Satori and OpenType use the upstream fflate 0.7.5 security backport rather than
an incompatible 0.8.x override. Parent-scoped overrides preserve unrelated
consumers. Their functional regressions verify the installed parent resolution,
font decompression, ZIP roundtrips and relative JSON-schema references.

Remove these overrides when the parent releases select compatible patched
versions themselves and the same regressions pass. Retain the separately
reviewed local braces source and its existing regressions.
