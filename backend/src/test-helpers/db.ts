import { prisma } from '../lib/prisma';
import { execSync } from 'child_process';
import path from 'path';

const TEST_USER_ID = 'test-user-001';

/**
 * Run Prisma migrations against the test database.
 * This ensures the schema is up to date before running tests.
 */
export async function setupTestDb() {
  const backendDir = path.resolve(__dirname, '../../');
  try {
    execSync('npx prisma migrate deploy', {
      cwd: backendDir,
      stdio: 'pipe',
      env: { ...process.env },
    });
  } catch (error: any) {
    const stderr = error.stderr?.toString() || '';
    if (stderr.includes('P1001') || stderr.includes("Can't reach database")) {
      throw new Error(
        `[Test Setup] Cannot connect to the test database.\n` +
        `Make sure Postgres is running: docker compose --profile dev up -d\n` +
        `And DATABASE_URL in .env points to a reachable host (e.g. 127.0.0.1:5432)\n` +
        `Original error: ${stderr}`
      );
    }
    throw error;
  }
}

/**
 * Seed required reference data and a test user.
 */
export async function seedTestData() {
  // Upsert a base currency
  await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {},
    create: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      decimalPlaces: 2,
    },
  });

  // Upsert a test user
  await prisma.user.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: {
      id: TEST_USER_ID,
      email: 'test@ninco.com',
      name: 'Test User',
    },
  });
}

/**
 * Delete all test data in the correct order (respecting FK constraints).
 * Runs between tests to ensure isolation.
 */
export async function cleanDb() {
  // Delete in reverse dependency order
  await prisma.transaction.deleteMany();
  await prisma.aiCredit.deleteMany();
  // Clear user's defaultAccountId before deleting accounts
  await prisma.user.updateMany({
    data: { defaultAccountId: null },
  });
  await prisma.account.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.userType.deleteMany();
  await prisma.currency.deleteMany();
}

/**
 * Disconnect Prisma client after all tests.
 */
export async function teardownTestDb() {
  await prisma.$disconnect();
}
