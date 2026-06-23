import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildTestApp, authHeaders } from '../../../test-helpers/app';
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../../lib/prisma';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildTestApp();
});

afterAll(async () => {
  await app.close();
});

/**
 * Helper: create an account and return its ID.
 */
async function createTestAccount(name = 'Test Account') {
  const res = await app.inject({
    method: 'POST',
    url: '/accounts',
    headers: authHeaders(),
    payload: {
      name,
      balance: 1000,
      color: '#4A90D9',
      icon: 'wallet',
      currencyCode: 'USD',
    },
  });
  return res.json().id as string;
}

describe('POST /transactions', () => {
  it('creates an income transaction and updates account balance', async () => {
    const accountId = await createTestAccount();

    const res = await app.inject({
      method: 'POST',
      url: '/transactions',
      headers: authHeaders(),
      payload: {
        amount: 500,
        type: 'INCOME',
        date: new Date().toISOString(),
        description: 'Freelance payment',
        accountId,
      },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body).toHaveProperty('id');
    expect(body.amount).toBe('500');
    expect(body.accountId).toBe(accountId);

    // Verify account balance was updated (1000 + 500 = 1500)
    const accountRes = await app.inject({
      method: 'GET',
      url: '/accounts',
      headers: authHeaders(),
    });
    const account = accountRes.json().find((a: any) => a.id === accountId);
    expect(account.balance).toBe('1500');
  });

  it('creates an expense transaction and decreases account balance', async () => {
    const accountId = await createTestAccount();

    const res = await app.inject({
      method: 'POST',
      url: '/transactions',
      headers: authHeaders(),
      payload: {
        amount: 150,
        type: 'EXPENSE',
        date: new Date().toISOString(),
        description: 'Grocery shopping',
        accountId,
      },
    });

    expect(res.statusCode).toBe(201);

    // Verify account balance was updated (1000 - 150 = 850)
    const accountRes = await app.inject({
      method: 'GET',
      url: '/accounts',
      headers: authHeaders(),
    });
    const account = accountRes.json().find((a: any) => a.id === accountId);
    expect(account.balance).toBe('850');
  });

  it('returns 400 when account ID is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/transactions',
      headers: authHeaders(),
      payload: {
        amount: 100,
        type: 'INCOME',
        date: new Date().toISOString(),
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('allows creating a transaction with a global category', async () => {
    const accountId = await createTestAccount();
    const globalCategory = await prisma.category.create({
      data: {
        name: 'Global Food',
        type: 'EXPENSE',
        userId: null,
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/transactions',
      headers: authHeaders(),
      payload: {
        amount: 25,
        type: 'EXPENSE',
        date: new Date().toISOString(),
        description: 'Snacks',
        accountId,
        categoryId: globalCategory.id,
      },
    });

    expect(res.statusCode).toBe(201);
  });

  it('returns 404 when category does not exist', async () => {
    const accountId = await createTestAccount();

    const res = await app.inject({
      method: 'POST',
      url: '/transactions',
      headers: authHeaders(),
      payload: {
        amount: 25,
        type: 'EXPENSE',
        date: new Date().toISOString(),
        description: 'Snacks',
        accountId,
        categoryId: '00000000-0000-0000-0000-000000000000',
      },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json().message).toBe('Category not found');
  });
});
