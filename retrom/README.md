# Retrom WebMSX integration

Upstream is ppeccin/WebMSX v6.0.8 at
`4f4009e86d3e0bb9be7dcd7f0a582b0cd411d660`. `master` mirrors upstream;
`retrom/6.0.8` is the maintained branch. Feature branches start there.
`retrom-fork.json` records the source baseline and `webmsx-host-v1` artifact contract.

From the owning Retrom PFB run `make pfb-core-build PFB=<name> CORE=webmsx`.
The fork's `.github/rpg-runtime/build-candidate.sh` runs deterministic Node tests and
assembles the upstream Grunt source order with the host configuration and lifecycle.
Python and Node are supplied by that PFB. No game is part of this build.
Output is an explicit unpublished candidate with a closed asset list, byte lengths,
SHA-256 checksums and source-tree provenance. Do not run the builder over a nonempty output.

The browser script registers `window.__RETROM_WEBMSX_CORE_V1__`. `create({target,
bytes,digest,restore})` loads the machine BIOS and one game, then returns `canvas`,
`checkpoint`, `pause`, `resume`, and idempotent `stop`. Each instance owns an iframe.
`restore` is null or a bounded `webmsx-state-v1` envelope for the same game SHA-256;
it contains upstream's complete extended machine state, including writable disks/tape.
The host is the only persistence owner. WebMSX preference/state persistence and
keepalive are disabled in host mode. Normal upstream standalone mode is preserved.

The current machine is MSX2PJ (MSX2+ Japanese). Native gamepad and joykey polling
are disabled so the runtime adapter owns the sole standard-pad mapping. Keyboard
input remains available. Initialization uses the machine timer instead of waiting
for requestAnimationFrame in an iframe the host has not revealed yet.

Run `node --test tests/*.test.mjs` for deterministic regressions. The owning Retrom
repository supplies `ACC-MSX-001` for real upload, review, launch, controls, instant
save and restoration in a different Launch. A core-only demo page is not acceptance.

Release tags use `retrom-core-6.0.8-rN` on the maintained branch. The release workflow
checks the fetched annotated tag, clean commit and upstream ancestry, rebuilds the
same core, and publishes the two verified assets with `rpg-runtime-release.json`.
Run `python3 -B -m unittest discover -s .github/rpg-runtime -p 'test_*.py'` locally.

Upstream refers to a missing `license.txt`; retain `UPSTREAM-NOTICE.txt` and do not
label the source MIT or GPL. The bundled system ROMs remain separate third-party
works. Release metadata explicitly records both statuses as `UNRESOLVED`; publishing
the integration does not constitute a license grant or resolve redistribution rights.
