#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

RED='\033[0;31m'
NC='\033[0m' # No Color

echo "-> Fetching latest changes from upstream..."
git fetch upstream

echo "-> Force-updating core template files..."
# List of files to always overwrite with the upstream version.
FILES_TO_OVERWRITE=(
  "readme/README.dev.md"
  "README.md"
  "setup.sh"
  "sync-upstream.sh"
)

for file in "${FILES_TO_OVERWRITE[@]}"; do
  echo "     - Updating '${file}'"
  git checkout upstream/master -- "${file}"
done

# Commit the updated template files if there are any changes
if ! git diff --cached --quiet; then
  echo "-> Committing updated core template files..."
  git commit -m "Sync: Update core template files from upstream"
fi

echo "-> Merging remaining changes from upstream..."
git merge upstream/master --allow-unrelated-histories --no-edit

echo -e "${NC}-> Upstream sync complete! Review the changes and commit them when ready.${NC}"
echo "   - Use 'git status' to see the updated files."
echo "   - Use 'git diff HEAD' to review the changes."