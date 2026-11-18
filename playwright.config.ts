import { defineConfig } from '@playwright/test';

// Тесты идут против собранного сайта: npm run build, затем npm test.
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:8788', trace: 'off' },
  webServer: {
    command: 'npx wrangler pages dev dist --port 8788 --binding LEAD_DRY_RUN=1',
    url: 'http://127.0.0.1:8788/',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
