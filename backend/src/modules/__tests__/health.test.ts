import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildTestApp, authHeaders, TEST_USER_ID } from '../../test-helpers/app';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('GET /health', () => {
  it('returns status ok without auth', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});

describe('Auth rejection', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/accounts',
    });

    expect(res.statusCode).toBe(401);
    expect(res.json()).toHaveProperty('message');
  });

  it('returns 401 when Authorization header has wrong format', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/accounts',
      headers: { authorization: 'InvalidFormat token123' },
    });

    expect(res.statusCode).toBe(401);
  });
});
