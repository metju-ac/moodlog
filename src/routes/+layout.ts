// Enable prerendering by default, but allow individual routes to opt out
export const prerender = true;
// Disable SSR (server-side rendering) for static deployment
export const ssr = false;
// Allow routes with prerender = false to coexist with prerendered routes
export const trailingSlash = 'always';
