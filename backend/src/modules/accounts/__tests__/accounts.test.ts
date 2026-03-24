import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildTestApp, authHeaders, TEST_USER_ID } from '../../../test-helpers/app';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('POST /accounts', () => {
  it('creates an account successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/accounts',
      headers: authHeaders(),
      payload: {
        name: 'Checking Account',
        balance: 1000,
        color: '#4A90D9',
        icon: 'wallet',
        currencyCode: 'USD',
      },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Checking Account');
    expect(body.balance).toBe('1000');
    expect(body.currencyCode).toBe('USD');
    expect(body.isVisible).toBe(true);
  });

  it('creates an account with isVisible = false', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/accounts',
      headers: authHeaders(),
      payload: {
        name: 'Hidden Account',
        balance: 500,
        color: '#FF6347',
        icon: 'eye-off',
        isVisible: false,
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().isVisible).toBe(false);
  });

  it('returns 400 when body is invalid (missing required fields)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/accounts',
      headers: authHeaders(),
      payload: {
        // missing name, color, icon
        balance: 100,
      },
    });

    expect(res.statusCode).toBe(400);
  });
});

describe('GET /accounts', () => {
  it('returns empty list when user has no accounts', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/accounts',
      headers: authHeaders(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('returns accounts created by the authenticated user', async () => {
    // Create two accounts first
    await app.inject({
      method: 'POST',
      url: '/accounts',
      headers: authHeaders(),
      payload: {
        name: 'Savings',
        balance: 5000,
        color: '#22C55E',
        icon: 'piggy-bank',
        currencyCode: 'USD',
      },
    });

    await app.inject({
      method: 'POST',
      url: '/accounts',
      headers: authHeaders(),
      payload: {
        name: 'Credit Card',
        balance: -200,
        color: '#EF4444',
        icon: 'credit-card',
        currencyCode: 'USD',
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/accounts',
      headers: authHeaders(),
    });

    expect(res.statusCode).toBe(200);

    const accounts = res.json();
    expect(accounts).toHaveLength(2);

    const names = accounts.map((a: any) => a.name);
    expect(names).toContain('Savings');
    expect(names).toContain('Credit Card');

    // Each account should have the expected shape
    for (const account of accounts) {
      expect(account).toHaveProperty('id');
      expect(account).toHaveProperty('balance');
      expect(account).toHaveProperty('color');
      expect(account).toHaveProperty('icon');
      expect(account).toHaveProperty('currencyCode');
      expect(account).toHaveProperty('isVisible');
      expect(account).toHaveProperty('createdAt');
      expect(account).toHaveProperty('updatedAt');
    }
  });

  it('does not return accounts from other users', async () => {
    // Create an account as the default test user
    await app.inject({
      method: 'POST',
      url: '/accounts',
      headers: authHeaders(),
      payload: {
        name: 'My Account',
        balance: 100,
        color: '#000',
        icon: 'wallet',
      },
    });

    // List accounts as a different user (should be empty)
    const res = await app.inject({
      method: 'GET',
      url: '/accounts',
      headers: authHeaders('other-user-999'),
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });
});
