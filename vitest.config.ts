import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    // Scope to unit tests only — the top-level `tests/` dir holds Playwright
    // specs, which Vitest's default glob would otherwise also pick up.
    include: ['src/__tests__/**/*.test.ts'],
    env: {
      // lib/ai/embeddings.ts constructs an OpenAI client at module load
      // time, which throws without an API key — even for tests (like
      // detectLanguage) that never call OpenAI. A placeholder is enough
      // since no test here actually issues a network request.
      OPENAI_API_KEY: 'test-key-for-unit-tests',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
