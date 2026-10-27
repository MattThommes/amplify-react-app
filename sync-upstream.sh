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

# 5. Safely merge package.json dependencies and scripts without touching site name/description/homepage
if [ -f "package.json" ]; then
  echo "-> Safely checking package.json for upstream dependency updates..."
  node -e '
  const fs = require("fs");
  const { execSync } = require("child_process");

  try {
    const branch = process.argv[1];
    const upstreamRaw = execSync(`git show upstream/${branch}:package.json`, { encoding: "utf8" });
    const upstreamPkg = JSON.parse(upstreamRaw);
    const localPkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

    const path = require("path");
    const repoDir = path.basename(process.cwd());

    // Fallback description from index.html if localPkg description is still default
    let siteDescFallback = "";
    try {
      const indexHtml = fs.readFileSync("index.html", "utf8");
      const m = indexHtml.match(/<meta[^>]*name=["\x27]description["\x27][^>]*content=["\x27]([^"\x27]+)["\x27]/i);
      if (m) siteDescFallback = m[1].trim();
    } catch {}

    // Preserve child site identity and domain settings, auto-resolving template defaults
    const preservedName = (localPkg.name && localPkg.name !== "amplify-react-app") ? localPkg.name : repoDir;
    const preservedDescription = (localPkg.description && localPkg.description !== "Amplify React App") ? localPkg.description : (siteDescFallback || repoDir);
    const preservedVersion = localPkg.version || "1.0.0";
    const preservedHomepage = localPkg.homepage;
    const preservedDomain = localPkg.domain;

    // Merge scripts: keep all local scripts, bring in new upstream scripts
    const mergedScripts = {
      ...upstreamPkg.scripts,
      ...localPkg.scripts
    };
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

# 6. Personalize template files (llms.txt, robots.txt, JSON-LD in index.html, image-sync)
echo "-> Applying site identifiers to newly synced template files..."
node -e '
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const branch = process.argv[1];

let pkg = {};
try { pkg = JSON.parse(fs.readFileSync("package.json", "utf8")); } catch {}

let manifest = {};
try { manifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf8")); } catch {}

let indexHtml = "";
try { indexHtml = fs.readFileSync("index.html", "utf8"); } catch {}

let metaDesc = "";
const descMatch = indexHtml.match(/<meta[^>]*name=["\x27]description["\x27][^>]*content=["\x27]([^"\x27]+)["\x27]/i);
if (descMatch) metaDesc = descMatch[1].trim();

let pageTitle = "";
const titleMatch = indexHtml.match(/<title>([^<]+)<\/title>/i);
if (titleMatch) pageTitle = titleMatch[1].trim();

const siteName = manifest.short_name || manifest.name || (pageTitle ? pageTitle.split("|")[0].split("-")[0].trim() : "") || pkg.name || "Site Name";
const siteDesc = metaDesc || pkg.description || "Site description for search engines and AI agents.";
let authorName = "Author Name";
try { authorName = execSync("git config user.name", { encoding: "utf8" }).trim() || authorName; } catch {}

// Resolve production domain
let domain = "";

// 1. Primary: package.json homepage or domain field
if (pkg.homepage) {
  try {
    domain = new URL(pkg.homepage.startsWith("http") ? pkg.homepage : `https://${pkg.homepage}`).hostname;
  } catch {
    domain = pkg.homepage.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
} else if (pkg.domain) {
  domain = pkg.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

// 2. Secondary: tests/a11y-config.json baseURL
if (!domain && fs.existsSync("tests/a11y-config.json")) {
  try {
    const a11y = JSON.parse(fs.readFileSync("tests/a11y-config.json", "utf8"));
    if (a11y.baseURL && !a11y.baseURL.includes("localhost") && !a11y.baseURL.includes("127.0.0.1")) {
      domain = new URL(a11y.baseURL.startsWith("http") ? a11y.baseURL : `https://${a11y.baseURL}`).hostname;
    }
  } catch {}
}

// 3. Tertiary: scan index.html for existing domain in OpenGraph / JSON-LD / title
if (!domain && indexHtml) {
  const urlMatches = indexHtml.match(/https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g) || [];
  for (const u of urlMatches) {
    try {
      const host = new URL(u).hostname;
      if (!/^(fonts\.googleapis\.com|fonts\.gstatic\.com|schema\.org|www\.w3\.org|github\.com|reactjs\.org)$/i.test(host)) {
        domain = host;
        break;
      }
    } catch {}
  }
}

// If domain was found from HTML/config and not yet recorded in package.json, save it to package.json homepage
if (domain && !pkg.homepage) {
  pkg.homepage = `https://${domain}`;
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  console.log(`     - Saved production domain (${pkg.homepage}) to package.json homepage`);
}

// Fallback domain if none detected
if (!domain) {
  domain = "yourdomain.com";
}

// 6a. Personalize public/llms.txt
try {
  let llmsContent = "";
  if (fs.existsSync("public/llms.txt")) {
    llmsContent = fs.readFileSync("public/llms.txt", "utf8");
  } else {
    try {
      llmsContent = execSync(`git show upstream/${branch}:public/llms.txt`, { encoding: "utf8" });
    } catch {}
  }
  if (llmsContent) {
    let updatedLlms = llmsContent
      .replace(/^#\s+Your Site Name/m, `# ${siteName}`)
      .replace(/^>\s+A single-sentence summary of what this site covers and who publishes it\./m, `> ${siteDesc}`);
    if (updatedLlms !== llmsContent || !fs.existsSync("public/llms.txt")) {
      fs.writeFileSync("public/llms.txt", updatedLlms);
      console.log("     - Configured public/llms.txt with site name and description");
    }
  }
} catch (e) {
  console.warn("     ! Could not personalize public/llms.txt:", e.message);
}

// 6b. Personalize public/robots.txt sitemap
try {
  let robotsContent = "";
  if (fs.existsSync("public/robots.txt")) {
    robotsContent = fs.readFileSync("public/robots.txt", "utf8");
  } else {
    try {
      robotsContent = execSync(`git show upstream/${branch}:public/robots.txt`, { encoding: "utf8" });
    } catch {}
  }
  if (robotsContent) {
    let updatedRobots = robotsContent.replace(/https:\/\/yourdomain\.com/g, `https://${domain}`);
    if (updatedRobots !== robotsContent || !fs.existsSync("public/robots.txt")) {
      fs.writeFileSync("public/robots.txt", updatedRobots);
      console.log("     - Configured public/robots.txt with site domain");
    }
  }
} catch (e) {
  console.warn("     ! Could not personalize public/robots.txt:", e.message);
}

// 6c. Inject JSON-LD into index.html if missing
try {
  if (indexHtml && !indexHtml.includes("application/ld+json")) {
    const escapedName = siteName.replace(/"/g, "\\\"");
    const escapedDesc = siteDesc.replace(/"/g, "\\\"");
    const escapedAuthor = authorName.replace(/"/g, "\\\"");
    const jsonLdSnippet = `
    <!-- Schema.org JSON-LD Structured Data for AI Agents & Search Engines -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://${domain}/#website",
          "url": "https://${domain}",
          "name": "${escapedName}",
          "description": "${escapedDesc}",
          "publisher": {
            "@id": "https://${domain}/#author"
          }
        },
        {
          "@type": "Person",
          "@id": "https://${domain}/#author",
          "name": "${escapedAuthor}"
        }
      ]
    }
    </script>
`;
    if (indexHtml.includes("</head>")) {
      const updatedHtml = indexHtml.replace("</head>", `${jsonLdSnippet}  </head>`);
      fs.writeFileSync("index.html", updatedHtml);
      console.log("     - Injected personalized Schema.org JSON-LD into index.html");
    }
  }
} catch (e) {
  console.warn("     ! Could not inject JSON-LD into index.html:", e.message);
}

// 6d. Personalize package.json image-sync
try {
  if (pkg.scripts && pkg.scripts["image-sync"]) {
    const repoDir = path.basename(process.cwd());
    let syncCmd = pkg.scripts["image-sync"];
    if (syncCmd.includes("[LOCAL_PATH]") || syncCmd.includes("[CLOUD_PATH]")) {
      syncCmd = syncCmd.replace("[LOCAL_PATH]", repoDir).replace("[CLOUD_PATH]", `${repoDir}-images`);
      pkg.scripts["image-sync"] = syncCmd;
      fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
      console.log("     - Configured package.json image-sync with repo paths");
    }
  }
} catch (e) {
  console.warn("     ! Could not personalize image-sync script:", e.message);
}
' "$UPSTREAM_BRANCH"

# 7. Stage and commit synced core and personalized files if changed
CHANGES_COMMITTED=false
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git status --porcelain)" ]; then
  echo "-> Staging updated files..."
  git add -u
  for item in "${FILES_TO_SYNC[@]}" "public/llms.txt" "public/robots.txt" "tests/a11y-config.json"; do
    if [ -e "$item" ]; then
      git add "$item" 2>/dev/null || true
    fi
  done
  if [ -f "package.json" ]; then git add package.json; fi
  if [ -f "index.html" ]; then git add index.html; fi

  if ! git diff --cached --quiet; then
    echo "-> Committing updated files..."
    git commit -m "Sync: Update core template files and apply site identifiers from upstream"
    CHANGES_COMMITTED=true
  else
    echo "-> No staged changes to commit."
  fi
else
  echo "-> Core files and site identifiers are already up to date with upstream."
fi

# 8. Check for upstream updates to customized site files and notify
echo "-> Checking for upstream updates to customized site files..."
SITE_FILES=("src/App.jsx" "src/App.scss" "public/manifest.json")
for check_file in "${SITE_FILES[@]}"; do
  if [ -f "$check_file" ]; then
    if ! git diff --quiet "upstream/$UPSTREAM_BRANCH" HEAD -- "$check_file" 2>/dev/null; then
      echo -e "${YELLOW}   [Notice] '$check_file' differs from upstream (customized in this site).${NC}"
      echo "            To inspect upstream updates: git diff upstream/$UPSTREAM_BRANCH -- $check_file"
    fi
  fi
done

# 9. If package.json dependencies changed and were committed, run npm install
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

# 10. Push synced changes to origin if origin remote exists
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if git remote | grep -q '^origin$'; then
  # Fetch origin to be certain of comparison
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
echo "   - Site-specific identifiers and customizations have been applied."
