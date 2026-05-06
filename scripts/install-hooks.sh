#!/usr/bin/env bash
# install-hooks.sh — copy project git hooks into .git/hooks/
# Run once after cloning: bash scripts/install-hooks.sh

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_SRC="$REPO_ROOT/scripts/hooks"
HOOKS_DST="$REPO_ROOT/.git/hooks"

for hook in "$HOOKS_SRC"/*; do
  name="$(basename "$hook")"
  cp "$hook" "$HOOKS_DST/$name"
  chmod +x "$HOOKS_DST/$name"
  echo "  installed .git/hooks/$name"
done
echo "Done."
