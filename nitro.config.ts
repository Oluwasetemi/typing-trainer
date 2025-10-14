import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  compatibilityDate: '2025-09-30',

  // Set preset based on deployment platform
  // eslint-disable-next-line node/no-process-env
  preset: process.env.NETLIFY ? 'netlify' : process.env.VERCEL ? 'vercel' : undefined,

  // Enable experimental features
  experimental: {
    wasm: true,
  },

  // Route rules for better caching and performance
  routeRules: {
    '/api/og/**': {
      cache: {
        maxAge: 3600, // 1 hour
      },
      headers: {
        'cache-control': 'public, max-age=3600, s-maxage=86400',
      },
    },
    '/api/**': {
      cors: true,
      headers: {
        'access-control-allow-methods': 'GET, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization',
      },
    },
  },
});
