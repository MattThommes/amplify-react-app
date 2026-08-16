import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load custom config if it exists
let configBaseURL = '';
const configPath = path.resolve(__dirname, 'tests/a11y-config.json');
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config && config.baseURL) {
      configBaseURL = config.baseURL;
    }
  } catch (error) {
    console.error('Error reading tests/a11y-config.json in playwright.config.ts:', error);
  }
}

// Environment variable overrides config file, which overrides default local
const baseURL = process.env.TEST_BASE_URL || configBaseURL || 'http://localhost:4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Only start the local webServer if we are testing a local address
  webServer: baseURL.includes('localhost') || baseURL.includes('127.0.0.1')
    ? {
        command: 'npm run preview',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      }
    : undefined,
});
