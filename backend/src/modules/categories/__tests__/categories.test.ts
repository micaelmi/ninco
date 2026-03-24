import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildTestApp, authHeaders } from '../../../test-helpers/app';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('POST /categories', () => {
  it('creates an expense category', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      headers: authHeaders(),
      payload: {
        name: 'Groceries',
        color: '#22C55E',
        icon: 'shopping-cart',
        type: 'EXPENSE',
      },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Groceries');
    expect(body.type).toBe('EXPENSE');
  });

  it('creates an income category', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      headers: authHeaders(),
      payload: {
        name: 'Salary',
        type: 'INCOME',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().type).toBe('INCOME');
  });

  it('defaults to EXPENSE type', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/categories',
      headers: authHeaders(),
      payload: {
        name: 'Misc',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().type).toBe('EXPENSE');
  });
});

describe('GET /categories', () => {
  it('returns categories for authenticated user', async () => {
    // Create a category first
    await app.inject({
      method: 'POST',
      url: '/categories',
      headers: authHeaders(),
      payload: { name: 'Transport', type: 'EXPENSE' },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/categories',
      headers: authHeaders(),
    });

    expect(res.statusCode).toBe(200);

    const categories = res.json();
    expect(categories.length).toBeGreaterThanOrEqual(1);
    expect(categories.some((c: any) => c.name === 'Transport')).toBe(true);
  });
});
