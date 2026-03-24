import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://docker:docker@127.0.0.1:5432/ninco_test',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'test_fake_key',
      CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || 'test_fake_webhook',
      NODE_ENV: 'test',
      FEEDBACK_EMAIL_TO: process.env.FEEDBACK_EMAIL_TO || 'test@test.com',
    },
    environment: 'node',
    globals: true,
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
    setupFiles: ['./src/test-helpers/setup.ts'],
    include: ['src/**/*.test.ts'],
  },
});
