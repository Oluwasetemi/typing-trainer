import { defineNitroConfig } from 'nitropack/config';

export default defineNitroConfig({
  compatibilityDate: '2025-09-30',

  // Configure the dev server
  devServer: {
    port: 3001,
  },

  // Configure the build output
  output: {
    dir: '.output',
  },

  // Enable experimental features
  experimental: {
    wasm: true,
  },

  // Configure for different deployment targets
  nitro: {
    // For Vercel deployment
    vercel: {
      functions: {
        'api/og.ts': {
          runtime: 'edge',
        },
      },
    },

    // For Netlify deployment
    netlify: {
      functions: {
        'api/og.ts': {
          runtime: 'edge',
        },
      },
    },
  },
});
