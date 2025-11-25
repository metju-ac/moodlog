import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      // Default options for adapter-static
      pages: 'build',
      assets: 'build',
      fallback: '404.html', // GitHub Pages will serve this for missing routes
      precompress: false,
      strict: true,
    }),
    paths: {
      // Set base path for GitHub Pages
      // If your repo is https://github.com/username/moodlog,
      // GitHub Pages will serve it at https://username.github.io/moodlog
      // Change this to '' if you're using a custom domain or username.github.io
      base: process.env.NODE_ENV === 'production' ? '/moodlog' : '',
    },
  },
};

export default config;
