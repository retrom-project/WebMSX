# WebMSX fork ownership

Read `retrom-fork.json` and `retrom/README.md` before editing. Keep upstream `master`
as a fast-forward mirror; maintain Retrom changes on `retrom/6.0.8` through `feat/*`,
`fix/*`, `build/*`, or `sync/upstream-*` branches. Preserve upstream copyright headers.

Core source, host ABI, tests and build scripts belong here. retrom-runtime consumes
candidate artifacts and must not compile this core. Source changes use the same
named PFB as Retrom/runtime. Run `node --test tests/*.test.mjs` and the explicit PFB
core build, then exercise Retrom's actual product acceptance case.

Preserve the unresolved upstream license and embedded system-ROM status in notices
and release metadata; never label this source MIT or GPL or imply a license grant.
Releases require explicit owner authorization, a clean maintained commit, an immutable
annotated `retrom-core-6.0.8-rN` tag, verified closed assets and the actual Retrom
product acceptance. Run the Python release tests as well as the Node core tests.
Do not commit game or runtime binaries.
