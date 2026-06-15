import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // vite-react-ssg reads this route list at build time to prerender every
  // known route to static HTML, then hydrates into a client-side SPA.
  ssgOptions: {
    script: 'async',
    formatting: 'none',
    // Emit each route as <route>/index.html so Cloudflare static assets serve
    // deep links (e.g. /docs/v0.3.0/quick-start) directly.
    dirStyle: 'nested',
  },
});
