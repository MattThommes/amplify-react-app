# Campaign Runbook: Phase 1 AI Agent Optimization (GEO)
**Date:** 2026-10-27  
**Scope:** Amplify React App template & child sites

---

## 1. Objective
Enable child single-page React applications to be reliably discovered, indexed, and cited by Generative Engine Optimization (GEO) crawlers and LLM-powered search agents (Perplexity, ChatGPT Search, Claude-Web, Google AI Overviews).

---

## 2. Changes Applied per Site

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

# Sitemap: https://[PROD_DOMAIN]/sitemap.xml
```

### B. `public/llms.txt`
Provide an LLM-friendly plain text markdown roadmap following the [llmstxt.org](https://llmstxt.org) standard:
- Document site title (`# Site Name`) and concise summary (`> Description`).
- List **only real, active routes** on the site.
- **Do not include phantom links** (e.g. `/feed.xml`, `/guide-slug`, `/llms-full.txt`) unless those files actually exist.

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

## 3. How to Execute
Run the companion script `apply.cjs` targeting a specific child repo directory (and optionally its production domain if not already set in `package.json` `"homepage"`):
```bash
node scripts/campaigns/2026-10-27-ai-agent-optimization/apply.cjs <repo-name> [prod-domain]
```
