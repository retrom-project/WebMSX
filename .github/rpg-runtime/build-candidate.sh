#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
node --test "$root/tests/"*.test.mjs
python3 "$root/.github/rpg-runtime/build_candidate.py" "${1:?empty absolute output directory}"
