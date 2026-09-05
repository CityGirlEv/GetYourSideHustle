import { describe, expect, it } from 'vitest';
import {
  SAVE_TO_DATABASE_LABEL,
  SAVED_TO_DATABASE_NOTICE,
  buildLogoStorePayload,
  isLogoApiUnavailable,
  parseLogoStorePayload,
} from '../logoStore';
import { emptyLogoConceptsStore } from '../logoConcepts';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('logoStore', () => {
  it('parses a shared logo payload and keeps the main logo', () => {
    const payload = parseLogoStorePayload({
      store: {
        concepts: [{ id: 'logo-a', name: 'Mark A', kind: 'logo', dataUrl: PNG, uploadedBy: 'Evelyn' }],
        chosenId: 'logo-a',
        sourceFolderPath: '',
      },
      updatedAt: '2026-08-29T03:00:00.000Z',
      updatedBy: 'evelyn3@cox.net',
    });
    expect(payload?.store.concepts[0]).toMatchObject({ id: 'logo-a', name: 'Mark A' });
    expect(payload?.store.chosenId).toBe('logo-a');
    expect(payload?.updatedBy).toBe('evelyn3@cox.net');
  });

  it('rejects junk and still builds a persistable payload', () => {
    expect(parseLogoStorePayload(null)).toBeNull();
    const built = buildLogoStorePayload(
      {
        ...emptyLogoConceptsStore(),
        concepts: [
          {
            id: 'logo-b',
            kind: 'logo',
            name: 'Mark B',
            notes: '',
            relativePath: '',
            dataUrl: PNG,
            uploadedAt: '2026-08-29T03:00:00.000Z',
            uploadedBy: 'Evelyn',
          },
        ],
      },
      'nonnegotiation@gmail.com',
      new Date('2026-08-29T03:10:00.000Z'),
    );
    expect(built.updatedAt).toBe('2026-08-29T03:10:00.000Z');
    expect(built.updatedBy).toBe('nonnegotiation@gmail.com');
    expect(built.store.concepts[0]?.name).toBe('Mark B');
    expect(isLogoApiUnavailable(405)).toBe(true);
    expect(isLogoApiUnavailable(404)).toBe(true);
    expect(isLogoApiUnavailable(200)).toBe(false);
    expect(SAVE_TO_DATABASE_LABEL).toBe('Save');
    expect(SAVED_TO_DATABASE_NOTICE).toBe('Saved to the database');
  });
});
