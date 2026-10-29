#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure nvm and correct Node version are loaded
if [ -s "$(brew --prefix nvm 2>/dev/null)/nvm.sh" ]; then
  source "$(brew --prefix nvm 2>/dev/null)/nvm.sh"
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
  source "$HOME/.nvm/nvm.sh"
fi

if command -v nvm &>/dev/null && [ -f ".nvmrc" ]; then
  nvm use 2>/dev/null || true
fi

# 1. Guard against running inside the parent template repository itself
ORIGIN_URL=$(git config --get remote.origin.url 2>/dev/null || true)
PKG_NAME=$(node -p "require('./package.json').name" 2>/dev/null || true)
if [[ "$ORIGIN_URL" =~ MattThommes/amplify-react-app(\.git)?$ ]] && [ "$PKG_NAME" = "amplify-react-app" ]; then
  echo "-> Notice: This is the parent template repository (amplify-react-app)."
  echo "   Upstream syncing is only meant for child sites. Nothing to sync."
  exit 0
fi

# 2. Verify upstream remote exists
if ! git remote | grep -q '^upstream$'; then
  echo -e "${RED}Error: 'upstream' remote not found.${NC}"
  echo "To add it, run:"
  echo "  git remote add upstream git@github.com:MattThommes/amplify-react-app.git"
  exit 1
fi

echo "-> Fetching latest changes from upstream..."
git fetch upstream

# 3. Detect upstream branch (master or main)
UPSTREAM_BRANCH="master"
if ! git rev-parse --verify "upstream/$UPSTREAM_BRANCH" &>/dev/null; then
  if git rev-parse --verify "upstream/main" &>/dev/null; then
    UPSTREAM_BRANCH="main"
  else
    echo -e "${RED}Error: Could not find upstream/master or upstream/main branch.${NC}"
    exit 1
  fi
fi

# 4. Self-update check: if sync-upstream.sh itself changed in upstream, pull and re-run
if [ -z "$SYNC_RELOADED" ]; then
  if ! git diff --quiet "upstream/$UPSTREAM_BRANCH" -- sync-upstream.sh 2>/dev/null; then
    echo "-> Newer sync-upstream.sh detected in upstream. Updating script..."
    git checkout "upstream/$UPSTREAM_BRANCH" -- sync-upstream.sh
    export SYNC_RELOADED=1
    echo "-> Restarting with updated sync-upstream.sh..."
    exec "$0" "$@"
  fi
fi

echo "-> Syncing core template infrastructure files..."
FILES_TO_SYNC=(
  "sync-upstream.sh"
  "setup.sh"
  "run.sh"
  "Makefile"
  "amplify.yml"
  "_localApiServer.cjs"
  "check_node_version.cjs"
  "playwright.config.ts"
  "delete-amplify-app.sh"
  "readme/README.dev.md"
  ".nvmrc"
  ".github/workflows"
  "tests/accessibility.spec.ts"
  "src/reportWebVitals.js"
  "src/setupTests.js"
  "src/index.jsx"
  "src/SEO.jsx"
  "scripts/generate-seo.cjs"
)

for item in "${FILES_TO_SYNC[@]}"; do
  if git ls-tree -r --name-only "upstream/$UPSTREAM_BRANCH" "$item" 2>/dev/null | grep -q .; then
    echo "     - Updating '${item}'"
    git checkout "upstream/$UPSTREAM_BRANCH" -- "$item"
  fi
done

# If initial a11y-config.json does not exist locally, pull it from upstream
if [ ! -f "tests/a11y-config.json" ]; then
  if git ls-tree -r --name-only "upstream/$UPSTREAM_BRANCH" "tests/a11y-config.json" 2>/dev/null | grep -q .; then
    echo "     - Adding 'tests/a11y-config.json' template"
    git checkout "upstream/$UPSTREAM_BRANCH" -- "tests/a11y-config.json"
  fi
fi

# 5. Safely merge package.json dependencies and scripts without touching site customizations
if [ -f "package.json" ]; then
  echo "-> Safely checking package.json for upstream dependency updates..."
  node -e '
  const fs = require("fs");
  const path = require("path");
  const { execSync } = require("child_process");

  try {
    const branch = process.argv[1];
    const upstreamRaw = execSync(`git show upstream/${branch}:package.json`, { encoding: "utf8" });
    const upstreamPkg = JSON.parse(upstreamRaw);
    const localPkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

    const repoDir = path.basename(process.cwd());

    // Preserve child site identity and domain settings, auto-resolving template defaults
    const preservedName = (localPkg.name && localPkg.name !== "amplify-react-app") ? localPkg.name : repoDir;
    const preservedDescription = (localPkg.description && localPkg.description !== "Amplify React App") ? localPkg.description : (localPkg.description || repoDir);
    const preservedVersion = localPkg.version || "1.0.0";
    const preservedHomepage = localPkg.homepage;
    const preservedDomain = localPkg.domain;

    // Merge scripts: keep all local scripts, bring in new upstream scripts
    const mergedScripts = {
      ...upstreamPkg.scripts,
      ...localPkg.scripts
    };
    if (mergedScripts.build && !mergedScripts.build.includes("generate-seo.cjs")) {
      mergedScripts.build = `${mergedScripts.build} && node scripts/generate-seo.cjs`;
    }
    // If local site configured a custom image-sync, preserve it
    if (localPkg.scripts && localPkg.scripts["image-sync"]) {
      mergedScripts["image-sync"] = localPkg.scripts["image-sync"];
    }

    // Merge dependencies
    const mergedDependencies = {
      ...localPkg.dependencies,
      ...upstreamPkg.dependencies
    };

    // Merge devDependencies
    const mergedDevDependencies = {
      ...localPkg.devDependencies,
      ...upstreamPkg.devDependencies
    };

    const merged = {
      ...upstreamPkg,
      ...localPkg,
      name: preservedName,
      description: preservedDescription,
      version: preservedVersion,
      ...(preservedHomepage ? { homepage: preservedHomepage } : {}),
      ...(preservedDomain ? { domain: preservedDomain } : {}),
      scripts: mergedScripts,
      dependencies: mergedDependencies,
      devDependencies: mergedDevDependencies
    };

    fs.writeFileSync("package.json", JSON.stringify(merged, null, 2) + "\n");
    console.log("     - Merged upstream dependencies/scripts into package.json (preserved site name, domain, & custom scripts)");
  } catch (err) {
    console.warn("     ! Could not auto-merge package.json:", err.message);
  }
  ' "$UPSTREAM_BRANCH"
fi

# 6. Stage and commit synced core infrastructure files if changed
CHANGES_COMMITTED=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git status --porcelain)" ]; then
  echo "-> Staging updated files..."
  git add -u
  for item in "${FILES_TO_SYNC[@]}" "tests/a11y-config.json"; do
    if [ -e "$item" ]; then
      git add "$item" 2>/dev/null || true
    fi
  done
  if [ -f "package.json" ]; then git add package.json; fi

  if ! git diff --cached --quiet; then
    echo "-> Committing updated files..."
    git commit -m "Sync: Update core template files from upstream"
    CHANGES_COMMITTED=true
  else
    echo "-> No staged changes to commit."
  fi
else
  echo "-> Core files are already up to date with upstream."
fi

# 7. Check for upstream updates to customized site files and notify
echo "-> Checking for upstream updates to customized site files..."
SITE_FILES=("src/App.jsx" "src/App.scss" "index.html" "public/manifest.json" "public/robots.txt" "public/llms.txt" "public/llms-full.txt" "public/sitemap.xml")
for check_file in "${SITE_FILES[@]}"; do
  if [ -f "$check_file" ]; then
    if ! git diff --quiet "upstream/$UPSTREAM_BRANCH" HEAD -- "$check_file" 2>/dev/null; then
      echo -e "${YELLOW}   [Notice] '$check_file' differs from upstream (customized in this site).${NC}"
      echo "            To inspect upstream updates: git diff upstream/$UPSTREAM_BRANCH -- $check_file"
    fi
  fi
done

# 8. If package.json dependencies changed and were committed, run npm install
if [ "$CHANGES_COMMITTED" = true ] && git diff HEAD~1 --name-only 2>/dev/null | grep -q "^package\.json$"; then
  DEPS_CHANGED=$(node -e '
    const { execSync } = require("child_process");
    try {
      const prev = JSON.parse(execSync("git show HEAD~1:package.json", { encoding: "utf8" }));
      const curr = JSON.parse(execSync("git show HEAD:package.json", { encoding: "utf8" }));
      const prevDeps = JSON.stringify({ d: prev.dependencies, dev: prev.devDependencies });
      const currDeps = JSON.stringify({ d: curr.dependencies, dev: curr.devDependencies });
      console.log(prevDeps !== currDeps ? "yes" : "no");
    } catch {
      console.log("yes");
    }
  ' 2>/dev/null || echo "yes")

  if [ "$DEPS_CHANGED" = "yes" ]; then
    echo "-> package.json dependencies were updated. Installing updated dependencies..."
    npm install --prefer-offline --no-audit --progress=false
    if ! git diff --quiet package-lock.json 2>/dev/null; then
      git add package-lock.json
      git commit -m "Sync: Update package-lock.json after upstream dependency sync"
    fi
  else
    echo "-> package.json dependencies are unchanged. Skipping npm install."
  fi
fi

# 9. Push synced changes to origin if origin remote exists
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if git remote | grep -q '^origin$'; then
  git fetch origin "$CURRENT_BRANCH" 2>/dev/null || true
  if ! git diff --quiet "origin/$CURRENT_BRANCH"..HEAD 2>/dev/null; then
    echo "-> Pushing synced commits to origin/$CURRENT_BRANCH..."
    git push origin "$CURRENT_BRANCH"
    echo -e "${GREEN}-> Successfully pushed to origin/$CURRENT_BRANCH.${NC}"
  else
    echo "-> Origin remote is already up to date with local branch."
  fi
fi

echo ""
echo -e "${GREEN}-> Upstream sync complete! Zero git conflicts.${NC}"
echo "   - Core tools, scripts, and workflows are synchronized."
echo "   - Site-specific customizations have been preserved."
