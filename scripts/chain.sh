#!/usr/bin/env bash
# Read-only quote by default. See --help for bounded, per-video approved execution.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
exec node "$HERE/chain.mjs" "$@"
