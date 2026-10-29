# Campaign Runbook: Phase 1 & Phase 2 AI Agent Optimization (GEO)
**Date:** 2026-10-27  
**Scope:** Amplify React App template & child sites

---

## 1. Objective
Enable child single-page React applications to be reliably discovered, indexed, and cited by Generative Engine Optimization (GEO) crawlers and LLM-powered search agents (Perplexity, ChatGPT Search, Claude-Web, Google AI Overviews).

---

## 2. Phase 1 Changes (Discovery & Entity Metadata)

### A. `public/robots.txt`
Explicitly permit AI search crawlers and specify the production sitemap URL:
```text
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

Sitemap: https://[PROD_DOMAIN]/sitemap.xml
```

### B. `public/llms.txt`
Provide an LLM-friendly plain text markdown roadmap following the [llmstxt.org](https://llmstxt.org) standard:
- Document site title (`# Site Name`) and concise summary (`> Description`).
- List **only real, active routes** on the site, plus `/sitemap.xml` and `/llms-full.txt`.

### C. `index.html` (Schema.org JSON-LD)
Inject structured entity metadata before `</head>`:
```html
<!-- Schema.org JSON-LD Structured Data for AI Agents & Search Engines -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://[PROD_DOMAIN]/#website",
      "url": "https://[PROD_DOMAIN]",
      "name": "[Site Name]",
      "description": "[Site Description]",
      "publisher": {
        "@id": "https://[PROD_DOMAIN]/#author"
      }
    },
    {
      "@type": "Person",
      "@id": "https://[PROD_DOMAIN]/#author",
      "name": "[Author Name]"
    }
  ]
}
</script>
```

### D. `package.json`
Record the site's production domain in the `"homepage"` field:
```json
"homepage": "https://[PROD_DOMAIN]"
```

---

## 3. Phase 2 Changes (Static Content Export, Sitemaps & Pre-rendering)

### A. `public/sitemap.xml`
Provide a complete XML sitemap listing all public routes on `https://[PROD_DOMAIN]` and ensure `Sitemap: https://[PROD_DOMAIN]/sitemap.xml` is active in `public/robots.txt`.

### B. `public/llms-full.txt`
Provide the complete plain-text Markdown copy of the site's pages and articles (`## Section Heading` + `URL: https://[PROD_DOMAIN]/route`) so AI agents and RAG pipelines can ingest 100% of the site content without executing client-side JavaScript.

### C. `src/SEO.jsx` & Semantic `<main>` Landmark
Use `<SEO title="..." description="..." path="..." />` in route components to dynamically manage `document.title`, `<meta name="description">`, `<link rel="canonical">`, and Open Graph / Twitter metadata, and wrap page content in `<main className="content">`.

### D. `scripts/generate-seo.cjs` (Post-Build Static Pre-rendering)
Executed automatically during `npm run build` (`vite build && node scripts/generate-seo.cjs`):
- Converts `public/llms-full.txt` into semantic HTML (`<main>`, `<section>`, `<h2>`, `<p>`, `<ul>`, `<nav>`) inside `<noscript>` of `dist/index.html` so non-JS AI crawlers (`Claude-Web`, `ChatGPT-User`, `PerplexityBot`, `OAI-SearchBot`) receive full page content in the initial HTML response.
- Generates pre-rendered `dist/<route>/index.html` files for every route with tailored `<title>`, `<meta name="description">`, `<link rel="canonical">`, and `<noscript>` content.

---

## 4. How to Execute
Run the companion script `apply.cjs` targeting a specific child repo directory (and optionally its production domain if not already set in `package.json` `"homepage"`):
```bash
node scripts/campaigns/2026-10-27-ai-agent-optimization/apply.cjs <repo-name> [prod-domain]
```
