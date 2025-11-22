#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

RED='\033[0;31m'
NC='\033[0m' # No Color

echo "-> Syncing with upstream..."
git fetch upstream > /dev/null

# Temporarily disable exit on error to handle merge conflicts
set +e
git merge upstream/master --allow-unrelated-histories --no-commit --no-ff
MERGE_STATUS=$?
set -e

if [ $MERGE_STATUS -ne 0 ]; then
  echo "   - Merge conflicts detected. Attempting to auto-resolve..."

  # List of files to auto-resolve with "theirs" (upstream)
  FILES_TO_RESOLVE=(
    "readme/README.dev.md"
    "README.md"
    "setup.sh"
    "sync-upstream.sh"
  )

  for file in "${FILES_TO_RESOLVE[@]}"; do
    if git status --porcelain | grep -q "UU ${file}"; then
      echo "     - Resolving conflict for '${file}' by accepting the upstream version."
      git rm --cached "${file}" > /dev/null 2>&1 || true
      git checkout --theirs "${file}"
      git add "${file}" > /dev/null 2>&1
    fi
  done

  # Check if there are still unmerged files
  if git status --porcelain | grep -q "^UU"; then
    echo -e "${RED}   - Could not auto-resolve all conflicts. Please fix the following files manually and then commit:${NC}"
    git status --porcelain | grep "^UU" | awk '{print "     - " $2}'
    exit 1
  else
    echo "   - All conflicts resolved successfully."
    git commit --no-edit
  fi
fi

echo "-> Upstream sync complete!"