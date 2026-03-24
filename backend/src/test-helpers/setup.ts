import { beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDb, seedTestData, cleanDb, teardownTestDb } from './db';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await cleanDb();
  await seedTestData();
});

afterAll(async () => {
  await cleanDb();
  await teardownTestDb();
});
