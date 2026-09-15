import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Note: AI Studio's export shipped a dev-only plugin here that answered
// /api/generate with hardcoded fake replies. It has been removed — the real
// endpoint is api/generate.js, served by `vercel dev` locally and by Vercel
// in production. Run `vercel dev`, not `vite`, so the API is available.

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // The old single-file demo lives in public/. Vite copies everything in
  // publicDir straight into dist/, so a leftover public/index.html would
  // overwrite the real built page. Ignoring the folder keeps that safe.
  // Delete public/ and remove this line if you later want static assets.
  publicDir: false,
  build: {
    outDir: 'dist',
  },
});
