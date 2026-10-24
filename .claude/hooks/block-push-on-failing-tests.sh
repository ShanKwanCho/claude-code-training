#!/usr/bin/env bash
#
# Blocks `git push` while the merchant console's tests are failing.
#
# Runs as a Claude Code PreToolUse hook on Bash. It reads the tool call on
# stdin, ignores everything that is not a push, and exits 2 to refuse the
# call when `npm test` is red. Exit 2 is what stops the tool and hands the
# reason back, so the failure is read rather than stepped over.
#
# `git push --no-verify` does not get past this: that flag skips git's own
# hooks, and this is not one of them.

set -uo pipefail

command=$(python3 -c 'import json,sys
try:
    print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))
except Exception:
    print("")' 2>/dev/null)

case "$command" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
console="$root/build-battle/merchant-console"

# Nothing installed means nothing to check; do not invent a failure.
[ -d "$console/node_modules" ] || exit 0

if ! output=$(cd "$console" && npm test 2>&1); then
  {
    echo "Push blocked: the merchant console's tests are not passing."
    echo
    echo "$output" | tail -25
    echo
    echo "Fix the tests. Do not weaken a check to get a green push."
  } >&2
  exit 2
fi

exit 0
