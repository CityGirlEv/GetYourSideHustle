import { describe, expect, it } from 'vitest';
import { onRequest } from '../../../functions/api/home-page';
import { DEFAULT_HOME_PAGE_COPY, HOME_PAGE_COPY_STORE_ID } from '../homePageCopy';

function mockDb(row: { payload: string } | null = null) {
  const runs: unknown[][] = [];
  return {
    runs,
    DB: {
      prepare: (query: string) => ({
        bind: (...values: unknown[]) => ({
          first: async <T>() => {
            if (query.includes('SELECT')) return row as T | null;
            return null;
          },
          run: async () => {
            runs.push([query, ...values]);
            return { success: true };
          },
        }),
      }),
    },
  };
}

describe('home-page API', () => {
  it('returns empty when nothing is stored and saves a merged payload', async () => {
    const empty = mockDb(null);
    const get = await onRequest({
      request: new Request('https://nonnegotiation.com/api/home-page'),
      env: empty,
    });
    expect(get.status).toBe(200);
    expect(await get.json()).toMatchObject({ ok: true, empty: true });

    const putEnv = mockDb(null);
    const put = await onRequest({
      request: new Request('https://nonnegotiation.com/api/home-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          copy: { secondaryCta: 'Shop the Collection' },
          updatedAt: '2026-09-19T12:00:00.000Z',
          updatedBy: 'angela@myplannotmymood.com',
        }),
      }),
      env: putEnv,
    });
    expect(put.status).toBe(200);
    const insert = putEnv.runs.find((row) => String(row[0]).includes('INSERT'));
    expect(insert?.[1]).toBe(HOME_PAGE_COPY_STORE_ID);
    const stored = JSON.parse(String(insert?.[2]));
    expect(stored.copy.secondaryCta).toBe('Shop the Collection');
    expect(stored.copy.titleLead).toBe(DEFAULT_HOME_PAGE_COPY.titleLead);
  });

  it('rejects invalid JSON on PUT', async () => {
    const response = await onRequest({
      request: new Request('https://nonnegotiation.com/api/home-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '{',
      }),
      env: mockDb(),
    });
    expect(response.status).toBe(400);
  });
});
