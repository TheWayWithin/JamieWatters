#!/usr/bin/env bash
#
# Lint gate for website/.
#
# Asserts the state established when the last @typescript-eslint/no-explicit-any
# errors were cleared (JW-ISS-21): zero ESLint errors, and no more warnings than
# the agreed ceiling.
#
# Zero errors is the real gate. The warning ceiling is here so the pre-existing
# no-unused-vars backlog cannot quietly grow while nobody is watching; lower
# MAX_WARNINGS as that backlog is worked off, never raise it to make a run pass.
#
# Usage (from anywhere):  bash website/scripts/verify-lint-gate.sh
# Exit 0 = gate holds. Exit non-zero = it does not, and eslint's output says why.

set -uo pipefail

MAX_WARNINGS=45

cd "$(dirname "$0")/.." || exit 1

echo "Running ESLint over website/ (0 errors, max ${MAX_WARNINGS} warnings)..."

# --max-warnings makes eslint itself the oracle: it exits non-zero on any error
# and on warnings above the ceiling, so there is no output parsing to get wrong.
if npx eslint . --max-warnings "${MAX_WARNINGS}"; then
  echo "Lint gate holds: 0 errors, warnings within ${MAX_WARNINGS}."
  exit 0
fi

echo ""
echo "Lint gate FAILED. Either an error was introduced, or warnings exceeded ${MAX_WARNINGS}."
echo "Fix the code. Do not raise MAX_WARNINGS or add eslint-disable comments to get past this."
exit 1
