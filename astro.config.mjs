import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://texnikorik.uz',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  server: { host: true },
});
