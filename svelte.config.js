import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/moodlog' : ''
    },
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        // Ignore errors for dynamic routes
        if (path.startsWith('/entry/') || path.startsWith('/reflection/')) {
          return;
        }
        throw new Error(message);
      },
      handleUnseenRoutes: 'ignore'
    }
  }
};

export default config;
