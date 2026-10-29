#!/usr/bin/env node

/**
 * Post-build SEO & AI Agent Pre-render Script (Phase 2 GEO)
 *
 * Runs automatically after `vite build` to:
 * 1. Inject semantic HTML content from `public/llms-full.txt` (or `public/llms.txt`)
 *    into the `<noscript>` block of `dist/index.html` so non-JS AI crawlers
 *    (Claude-Web, ChatGPT-User, PerplexityBot, OAI-SearchBot) can read the full
 *    site copy directly from the initial HTML response.
 * 2. Generate route-specific `dist/<route>/index.html` files with tailored
 *    `<title>`, `<meta name="description">`, `<link rel="canonical">`, and
 *    Open Graph tags for each public section.
 * 3. Ensure `dist/sitemap.xml` exists for search engine and AI agent discovery.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdownToSections(markdown, baseUrl) {
  const lines = markdown.split(/\r?\n/);
  let siteTitle = '';
  let siteSummary = '';
  const sections = [];
  let currentSection = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === '---') continue;

    if (line.startsWith('# ') && !siteTitle) {
      siteTitle = line.slice(2).trim();
      continue;
    }

    if (line.startsWith('> ') && !siteSummary && !currentSection) {
      siteSummary = line.slice(2).trim();
      continue;
    }

    if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        heading: line.slice(3).trim(),
        url: '',
        path: '',
        paragraphs: [],
        bullets: []
      };
      continue;
    }

    if (currentSection) {
      const urlMatch = line.match(/^URL:\s*(https?:\/\/\S+|\/\S*)/i);
      if (urlMatch) {
        const rawUrl = urlMatch[1].trim();
        currentSection.url = rawUrl;
        try {
          if (rawUrl.startsWith('http')) {
            const parsed = new URL(rawUrl);
            currentSection.path = parsed.pathname;
          } else {
            currentSection.path = rawUrl;
          }
        } catch {
          currentSection.path = '';
        }
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        currentSection.bullets.push(line.slice(2).trim());
      } else if (line.startsWith('### ')) {
        currentSection.paragraphs.push(`${line.slice(4).trim()}:`);
      } else {
        currentSection.paragraphs.push(line);
      }
    }
  }

  if (currentSection) sections.push(currentSection);

  return {
    siteTitle: siteTitle || 'Website',
    siteSummary: siteSummary || '',
    sections,
    baseUrl
  };
}

function formatInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  // Convert [label](url) to <a href="url">label</a>
  return escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
    '<a href="$2">$1</a>'
  );
}

function buildNoscriptHtml(parsed, activePath = null) {
  const parts = [];
  parts.push('<main class="seo-prerender">');
  parts.push(`  <h1>${escapeHtml(parsed.siteTitle)}</h1>`);
  if (parsed.siteSummary) {
    parts.push(`  <p>${formatInlineMarkdown(parsed.siteSummary)}</p>`);
  }

  const sectionsToRender = activePath
    ? parsed.sections.filter(s => s.path === activePath || !s.path)
    : parsed.sections;

  const finalSections = sectionsToRender.length > 0 ? sectionsToRender : parsed.sections;

  for (const sec of finalSections) {
    parts.push('  <section>');
    parts.push(`    <h2>${escapeHtml(sec.heading)}</h2>`);
    for (const p of sec.paragraphs) {
      parts.push(`    <p>${formatInlineMarkdown(p)}</p>`);
    }
    if (sec.bullets.length > 0) {
      parts.push('    <ul>');
      for (const b of sec.bullets) {
        parts.push(`      <li>${formatInlineMarkdown(b)}</li>`);
      }
      parts.push('    </ul>');
    }
    parts.push('  </section>');
  }

  // Navigation index for crawlers
  const navSections = parsed.sections.filter(s => s.path);
  if (navSections.length > 0) {
    parts.push('  <nav aria-label="Site Pages">');
    parts.push('    <ul>');
    for (const s of navSections) {
      const href = s.url || s.path;
      parts.push(`      <li><a href="${escapeHtml(href)}">${escapeHtml(s.heading)}</a></li>`);
    }
    parts.push('    </ul>');
    parts.push('  </nav>');
  }

  parts.push('</main>');
  return parts.join('\n      ');
}

function updateHtmlMetadata(html, { title, description, canonicalUrl, noscriptInner }) {
  let out = html;

  if (title) {
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }

  if (description) {
    const descTag = `<meta name="description" content="${escapeHtml(description)}" />`;
    if (/<meta\s+name=["']description["'][^>]*>/i.test(out)) {
      out = out.replace(/<meta\s+name=["']description["'][^>]*>/i, descTag);
    } else {
      out = out.replace(/<\/title>/i, `</title>\n    ${descTag}`);
    }
  }

  if (canonicalUrl) {
    const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(out)) {
      out = out.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag);
    } else {
      out = out.replace(/<\/title>/i, `</title>\n    ${canonicalTag}`);
    }
  }

  if (noscriptInner) {
    out = out.replace(
      /<noscript>[\s\S]*?<\/noscript>/i,
      `<noscript>\n      ${noscriptInner}\n    </noscript>`
    );
  }

  return out;
}

function run() {
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.warn('[generate-seo] dist/index.html not found. Run `vite build` first.');
    return;
  }

  let pkg = {};
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
  } catch {}

  const baseUrl = (pkg.homepage || 'https://yourdomain.com').replace(/\/+$/, '');
  const llmsFullPath = path.join(PUBLIC_DIR, 'llms-full.txt');
  const llmsPath = path.join(PUBLIC_DIR, 'llms.txt');

  let markdownSource = '';
  if (fs.existsSync(llmsFullPath)) {
    markdownSource = fs.readFileSync(llmsFullPath, 'utf8');
  } else if (fs.existsSync(llmsPath)) {
    markdownSource = fs.readFileSync(llmsPath, 'utf8');
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  if (!markdownSource) {
    console.log('[generate-seo] No llms-full.txt or llms.txt found; skipping noscript injection.');
    return;
  }

  const parsed = parseMarkdownToSections(markdownSource, baseUrl);
  const rootNoscript = buildNoscriptHtml(parsed, null);

  // 1. Update root dist/index.html with canonical link and full semantic <noscript>
  const updatedRootHtml = updateHtmlMetadata(baseHtml, {
    title: null,
    description: null,
    canonicalUrl: `${baseUrl}/`,
    noscriptInner: rootNoscript
  });
  fs.writeFileSync(indexHtmlPath, updatedRootHtml, 'utf8');

  // 2. Generate route-specific static HTML files for sections with a subpath
  let routeCount = 0;
  for (const section of parsed.sections) {
    if (!section.path || section.path === '/') continue;

    const cleanRoute = section.path.replace(/^\/+|\/+$/g, '');
    if (!cleanRoute) continue;

    const targetDir = path.join(DIST_DIR, cleanRoute);
    const targetFile = path.join(targetDir, 'index.html');

    const sectionTitle = `${section.heading} - ${parsed.siteTitle}`;
    const sectionDesc = section.paragraphs[0] || parsed.siteSummary || pkg.description || '';
    const canonicalUrl = `${baseUrl}/${cleanRoute}`;
    const sectionNoscript = buildNoscriptHtml(parsed, section.path);

    const routeHtml = updateHtmlMetadata(baseHtml, {
      title: sectionTitle,
      description: sectionDesc,
      canonicalUrl,
      noscriptInner: sectionNoscript
    });

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, routeHtml, 'utf8');
    routeCount++;
  }

  console.log(`✅ [generate-seo] Injected semantic AI fallback into dist/index.html and pre-rendered ${routeCount} route page(s).`);
}

run();

