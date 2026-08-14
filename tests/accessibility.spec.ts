import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define default paths to audit
let pathsToAudit = ['/', '/about', '/pricing', '/contact'];

// Check if a custom config file exists in the repo
const configPath = path.resolve(__dirname, 'a11y-config.json');
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config && Array.isArray(config.paths)) {
      pathsToAudit = config.paths;
    }
  } catch (error) {
    console.error('Error parsing tests/a11y-config.json:', error);
  }
}

test.describe('Accessibility audits', () => {
  for (const pagePath of pathsToAudit) {
    test(`audit ${pagePath} page`, async ({ page }) => {
      // Navigate to the target page path
      await page.goto(pagePath);
      
      // Wait for the DOM content to be fully loaded
      await page.waitForLoadState('domcontentloaded');

      // Analyze page accessibility
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Custom report console logging for better logs in CI/local runs
      if (accessibilityScanResults.violations.length > 0) {
        console.error(`\n❌ Accessibility violations found on "${pagePath}":`);
        for (const violation of accessibilityScanResults.violations) {
          console.error(`\n- [Rule ID: ${violation.id}] (Impact: ${violation.impact})`);
          console.error(`  Description: ${violation.description}`);
          console.error(`  Help: ${violation.help}`);
          console.error(`  Help URL: ${violation.helpUrl}`);
          for (const node of violation.nodes) {
            console.error(`    * Target: ${node.target.join(', ')}`);
            console.error(`      Failure Summary: ${node.failureSummary}`);
          }
        }
        console.error('\n');
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
