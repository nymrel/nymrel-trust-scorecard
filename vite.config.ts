import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  build: {
    cssCodeSplit: true,
    manifest: true,
    outDir: 'dist',
    reportCompressedSize: true,
    sourcemap: false,
    target: 'es2022',
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    setupFiles: ['test/setup.ts'],
    coverage: {
      clean: true,
      exclude: ['src/engine/fixtures.ts'],
      include: ['src/engine/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      thresholds: {
        branches: 85,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
