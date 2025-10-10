import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  css: {
    postcss: {
      plugins: []
    }
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 100,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/middleware.ts',
        '**/*.d.ts',
        '**/__tests__/**',
        'convex/_generated/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
