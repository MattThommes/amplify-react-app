#!/usr/bin/env node

/**
 * Campaign Script: 2026-10-27 AI Agent & GEO Optimization
 * Applies Phase 1 AI agent optimization (robots.txt, llms.txt, JSON-LD, homepage)
 * to designated child repos without polluting sync-upstream.sh.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DEV_DIR = path.resolve(__dirname, '../../../../');

// Known domain overrides if not present in package.json homepage
const KNOWN_DOMAINS = {
  'game-script': 'gamescript.pro',
  'thommesfamily-20260225': 'thommesfamily.net',
  'cannedrage-20260125': 'cannedrage.com',
  'mattthommesfamily-20261016': 'matt.thommesfamily.net',
  'hypertext-craft-20260127': 'hypertextcraft.com'
};

function processRepo(repoName) {
  const repoPath = path.join(DEV_DIR, repoName);
  if (!fs.existsSync(repoPath)) {
    console.error(`[Error] Repository directory not found: ${repoPath}`);
    return false;
  }

  console.log(`\n==================================================`);
  console.log(`Processing AI Optimization for: ${repoName}`);
  console.log(`==================================================`);

  // 1. Read metadata
  let pkg = {};
  const pkgPath = path.join(repoPath, 'package.json');
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch {}

  let manifest = {};
  const manifestPath = path.join(repoPath, 'public/manifest.json');
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch {}

  let indexHtml = '';
  const indexPath = path.join(repoPath, 'index.html');
  try { indexHtml = fs.readFileSync(indexPath, 'utf8'); } catch {}

  let appJsx = '';
  const appPath = path.join(repoPath, 'src/App.jsx');
  try { appJsx = fs.readFileSync(appPath, 'utf8'); } catch {}

  // Extract description
  let metaDesc = '';
  const descMatch = indexHtml.match(/<meta[^>]*name=["\x27]description["\x27][^>]*content=["\x27]([^"\x27]+)["\x27]/i);
  if (descMatch) metaDesc = descMatch[1].trim();

  // Extract title
  let pageTitle = '';
  const titleMatch = indexHtml.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) pageTitle = titleMatch[1].trim();

  const siteName = manifest.short_name || manifest.name || (pageTitle ? pageTitle.split('|')[0].split('-')[0].trim() : '') || pkg.name || repoName;
  const siteDesc = metaDesc || pkg.description || `${siteName} website.`;
  let authorName = 'Matt Thommes';
  try {
    const gitAuthor = execSync('git config user.name', { cwd: repoPath, encoding: 'utf8' }).trim();
    if (gitAuthor) authorName = gitAuthor;
  } catch {}

  // 2. Resolve domain
  let domain = '';
  if (pkg.homepage) {
    try { domain = new URL(pkg.homepage.startsWith('http') ? pkg.homepage : `https://${pkg.homepage}`).hostname; } catch {}
  }
  if (!domain && KNOWN_DOMAINS[repoName]) {
    domain = KNOWN_DOMAINS[repoName];
  }
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
  if (!domain) {
    domain = `${repoName.replace(/[^a-z0-9]/gi, '').toLowerCase()}.com`;
  }

  console.log(`- Site Name:    ${siteName}`);
  console.log(`- Domain:       https://${domain}`);
  console.log(`- Author:       ${authorName}`);

  // 3. Update package.json homepage and resolve name
  let pkgChanged = false;
  if (!pkg.homepage || pkg.homepage !== `https://${domain}`) {
    pkg.homepage = `https://${domain}`;
    pkgChanged = true;
  }
  if (pkg.name === 'amplify-react-app') {
    pkg.name = repoName;
    pkgChanged = true;
  }
  if (pkg.description === 'Amplify React App') {
    pkg.description = siteDesc;
    pkgChanged = true;
  }
  if (pkgChanged) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`- Updated package.json (name & homepage)`);
  }

  // 4. Update robots.txt
  const robotsPath = path.join(repoPath, 'public/robots.txt');
  const hasSitemap = fs.existsSync(path.join(repoPath, 'public/sitemap.xml'));
  const sitemapLine = hasSitemap
    ? `Sitemap: https://${domain}/sitemap.xml`
    : `# Sitemap: https://${domain}/sitemap.xml`;
  const robotsContent = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Explicit AI search & agent allowances
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

${sitemapLine}
`;
  fs.writeFileSync(robotsPath, robotsContent);
  console.log(`- Updated public/robots.txt`);

  // 5. Extract actual routes from App.jsx for llms.txt
  const routes = [];
  const routeRegex = /<Route[^>]*path=["\x27]([^"\x27]+)["\x27]/g;
  let match;
  while ((match = routeRegex.exec(appJsx)) !== null) {
    const r = match[1];
    if (r && !r.includes('*') && !r.includes(':') && !routes.includes(r)) {
      routes.push(r);
    }
  }
  if (!routes.includes('/')) routes.unshift('/');

  // Generate llms.txt with real routes only
  const routeLines = routes.map(r => {
    const label = r === '/' ? 'Home' : r.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `- [${label}](https://${domain}${r === '/' ? '/' : r}): ${label} page on ${siteName}.`;
  }).join('\n');

  const llmsPath = path.join(repoPath, 'public/llms.txt');
  const llmsContent = `# ${siteName}

> ${siteDesc}

## Key Pages
${routeLines}
`;
  fs.writeFileSync(llmsPath, llmsContent);
  console.log(`- Created tailored public/llms.txt (${routes.length} real routes)`);

  // 6. Inject Schema.org JSON-LD in index.html if missing
  if (!indexHtml.includes('application/ld+json')) {
    const escapedName = siteName.replace(/"/g, '\\"');
    const escapedDesc = siteDesc.replace(/"/g, '\\"');
    const escapedAuthor = authorName.replace(/"/g, '\\"');
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
    if (indexHtml.includes('</head>')) {
      const updatedHtml = indexHtml.replace('</head>', `${jsonLdSnippet}  </head>`);
      fs.writeFileSync(indexPath, updatedHtml);
      console.log(`- Injected Schema.org JSON-LD into index.html`);
    }
  }

  // 7. Commit and push
  try {
    execSync('git add package.json public/robots.txt public/llms.txt index.html', { cwd: repoPath });
    const status = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf8' }).trim();
    if (status) {
      execSync('git commit -m "feat(geo): Apply Phase 1 AI agent optimization (robots.txt, tailored llms.txt, JSON-LD)"', { cwd: repoPath });
      console.log(`- Committed changes`);
      execSync('git push origin master', { cwd: repoPath });
      console.log(`- Pushed to origin/master successfully!`);
    } else {
      console.log(`- No changes needed; repository already up to date.`);
    }
  } catch (err) {
    console.error(`- Git error:`, err.message);
  }

  return true;
}

// CLI Execution
const targetRepo = process.argv[2];
if (targetRepo) {
  processRepo(targetRepo);
} else {
  console.log(`Usage: node scripts/campaigns/2026-10-27-ai-agent-optimization/apply.cjs <repo-name>`);
  console.log(`Example: node scripts/campaigns/2026-10-27-ai-agent-optimization/apply.cjs cannedrage-20260125`);
}
