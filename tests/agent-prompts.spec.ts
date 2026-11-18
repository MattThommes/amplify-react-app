import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Read agent evaluation prompts from tests/agent-prompts.json
const promptsFilePath = path.resolve(__dirname, 'agent-prompts.json');
let promptsData = { domain: '', description: '', prompts: [] as any[] };
if (fs.existsSync(promptsFilePath)) {
    try {
        promptsData = JSON.parse(fs.readFileSync(promptsFilePath, 'utf-8'));
    } catch (e) {
        console.error('Failed reading agent-prompts.json:', e);
    }
}

const isPlaceholderDomain = !promptsData.domain || promptsData.domain.includes('yourdomain.com');

/**
 * Resolve GEMINI_API_KEY from environment or local .env files.
 */
function getGeminiApiKey(): string | null {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

    const envFiles = ['.env.local', '.env.dev', '.env'];
    for (const file of envFiles) {
        const fullPath = path.join(projectRoot, file);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            for (const line of content.split('\n')) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
                const [key, ...rest] = trimmed.split('=');
                if (key.trim() === 'GEMINI_API_KEY') {
                    let val = rest.join('=').trim();
                    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.slice(1, -1);
                    }
                    if (val) return val;
                }
            }
        }
    }
    return null;
}

const geminiApiKey = getGeminiApiKey();

test.describe('AI Agent Optimization (AEO / GEO) & Prompts Verification', () => {

    test('agent prompts configuration file is valid and non-empty', async () => {
        expect(promptsData).toBeDefined();
        expect(promptsData.domain).toBeTruthy();
        expect(Array.isArray(promptsData.prompts)).toBe(true);
        expect(promptsData.prompts.length).toBeGreaterThan(0);

        for (const item of promptsData.prompts) {
            expect(item.id, `Prompt ${item.id} missing id`).toBeTruthy();
            expect(item.prompt, `Prompt ${item.id} missing prompt`).toBeTruthy();
            expect(item.expectedCitation, `Prompt ${item.id} missing expectedCitation`).toBeTruthy();
            expect(Array.isArray(item.expectedKeywords), `Prompt ${item.id} missing expectedKeywords array`).toBe(true);
            expect(item.expectedKeywords.length).toBeGreaterThan(0);
        }
    });

    test('robots.txt permits major AI search agents', async ({ request }) => {
        const response = await request.get('/robots.txt');
        expect(response.status()).toBe(200);

        const text = await response.text();
        const expectedAgents = [
            'OAI-SearchBot',
            'ChatGPT-User',
            'PerplexityBot',
            'Claude-Web',
            'Google-Extended',
        ];

        for (const agent of expectedAgents) {
            expect(text, `robots.txt missing User-agent: ${agent}`).toContain(`User-agent: ${agent}`);
        }
    });

    test('llms.txt is available with status 200', async ({ request }) => {
        const llmsResp = await request.get('/llms.txt');
        expect(llmsResp.status()).toBe(200);
        const llmsText = await llmsResp.text();
        expect(llmsText.length).toBeGreaterThan(20);
    });

    test('homepage includes Schema.org JSON-LD structured data', async ({ page }) => {
        await page.goto('/');

        const jsonLdElements = await page.locator('script[type="application/ld+json"]').all();
        expect(jsonLdElements.length).toBeGreaterThan(0);

        let hasValidSchema = false;
        for (const element of jsonLdElements) {
            const rawContent = await element.textContent();
            if (!rawContent) continue;
            try {
                const parsed = JSON.parse(rawContent);
                if (parsed['@context'] && (parsed['@type'] || parsed['@graph'])) {
                    hasValidSchema = true;
                }
            } catch {
                // invalid JSON
            }
        }

        expect(hasValidSchema, 'Valid Schema.org JSON-LD script tag missing').toBe(true);
    });

    // Test each prompt citation and keyword presence in rendered DOM
    for (const item of promptsData.prompts) {
        test(`citation grounding: ${item.id}`, async ({ page }) => {
            test.skip(isPlaceholderDomain, 'Skipping placeholder domain prompt check');

            let targetUrl = item.expectedCitation;
            try {
                const parsedDomain = new URL(promptsData.domain).origin;
                if (targetUrl.startsWith(parsedDomain)) {
                    targetUrl = targetUrl.replace(parsedDomain, '') || '/';
                }
            } catch {
                // Keep targetUrl as is
            }

            const response = await page.goto(targetUrl);
            expect(response?.status(), `Failed loading citation ${item.expectedCitation}`).toBe(200);

            const bodyText = await page.locator('body').innerText();
            const pageContent = await page.content();

            for (const keyword of item.expectedKeywords) {
                const keywordLower = keyword.toLowerCase();
                const foundInBody = bodyText.toLowerCase().includes(keywordLower);
                const foundInHtml = pageContent.toLowerCase().includes(keywordLower);

                expect(
                    foundInBody || foundInHtml,
                    `Expected keyword "${keyword}" not found on cited page ${item.expectedCitation} for prompt "${item.id}"`
                ).toBe(true);
            }
        });
    }
});

/**
 * Live AI Agent Search & Citation Evaluation using Gemini API with Google Search Grounding.
 * Automatically runs when GEMINI_API_KEY is available and domain is not placeholder.
 */
test.describe('Live AI Agent Grounding & Search API Evaluation', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(!geminiApiKey, 'Skipping live API eval: GEMINI_API_KEY is not set');
    test.skip(isPlaceholderDomain, 'Skipping live API eval: domain is set to placeholder yourdomain.com');

    for (const item of promptsData.prompts) {
        test(`live AI search cites domain: ${item.id}`, async ({}, testInfo) => {
            test.setTimeout(35000); // Allow sufficient time for live web search grounding

            const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
            const payload = {
                contents: [{ parts: [{ text: item.prompt }] }],
                tools: [{ google_search: {} }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API HTTP ${response.status}: ${errorBody}`);
            }

            const data = await response.json();
            const candidate = data.candidates?.[0];
            const answerText = candidate?.content?.parts?.[0]?.text || '';
            const grounding = candidate?.groundingMetadata || {};
            const searchQueries: string[] = grounding.webSearchQueries || [];
            const groundingChunks: any[] = grounding.groundingChunks || [];

            // Resolve Google Vertex AI Search redirect URLs to actual destination URLs
            const resolvedSources = await Promise.all(
                groundingChunks.map(async (c: any) => {
                    const rawUri = c.web?.uri || c.web?.url || '';
                    const title = c.web?.title || '';
                    let finalUrl = rawUri;

                    if (rawUri.includes('vertexaisearch.cloud.google.com/grounding-api-redirect')) {
                        try {
                            const redirectResp = await fetch(rawUri, { method: 'HEAD', redirect: 'manual' });
                            const loc = redirectResp.headers.get('location');
                            if (loc) finalUrl = loc;
                        } catch {
                            // If HEAD fails, keep rawUri
                        }
                    }

                    return { url: finalUrl, rawUri, title };
                })
            );

            const citedUrls = resolvedSources.map(s => s.url).filter(Boolean);
            const citedTitles = resolvedSources.map(s => s.title).filter(Boolean);

            // Attach rich diagnostics to Playwright UI test report
            await testInfo.attach('ai-generated-answer.txt', {
                body: answerText,
                contentType: 'text/plain'
            });
            await testInfo.attach('cited-sources.json', {
                body: JSON.stringify(resolvedSources, null, 2),
                contentType: 'application/json'
            });
            await testInfo.attach('google-search-queries.json', {
                body: JSON.stringify(searchQueries, null, 2),
                contentType: 'application/json'
            });

            console.log(`[Live Eval: ${item.id}]`);
            console.log(`  Query: "${item.prompt}"`);
            console.log(`  Search queries: ${searchQueries.join(', ') || '(none)'}`);
            console.log(`  Cited sources:`);
            resolvedSources.forEach(s => {
                console.log(`    - ${s.url} ${s.title ? `("${s.title}")` : ''}`);
            });

            // 1. Verify that web search grounding sources were returned
            expect(citedUrls.length, `Gemini did not return any web grounding sources for "${item.id}"`).toBeGreaterThan(0);

            // 2. Verify expected domain or citation was cited
            const expectedDomain = new URL(promptsData.domain).hostname;
            const citedExpectedDomain = citedUrls.some(u => {
                try {
                    return new URL(u).hostname.includes(expectedDomain);
                } catch {
                    return u.includes(expectedDomain);
                }
            }) || citedTitles.some(t => t.toLowerCase().includes(expectedDomain.toLowerCase()));
            const citedExactUrl = citedUrls.some(u => u.includes(item.expectedCitation));

            expect(
                citedExpectedDomain || citedExactUrl,
                `Expected citation "${item.expectedCitation}" (or domain ${expectedDomain}) was not in cited sources: [${citedUrls.join(', ')}]`
            ).toBe(true);

            // 3. Verify expected keywords appear in the generated answer
            const lowerAnswer = answerText.toLowerCase();
            for (const keyword of item.expectedKeywords) {
                expect(
                    lowerAnswer,
                    `Expected keyword "${keyword}" missing from Gemini answer for prompt "${item.id}"`
                ).toContain(keyword.toLowerCase());
            }
        });
    }
});
