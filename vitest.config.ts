import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/e2e/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    fileParallelism: false,
    testTimeout: 45_000,
  },
});
