// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://tombeaulatent.github.io',
  integrations: [react()],
  redirects: {
    '/live-coding': '/portfolio',
    '/tatouage': '/portfolio',
  },
  vite: {
    // LightningCSS: si -webkit-backdrop-filter + backdrop-filter, il droppe le standard
    // (Chrome n'applique alors plus le flou). On désactive la minify CSS lightning.
    build: {
      cssMinify: false,
    },
  },
});