import { describe, expect, it } from 'vitest';
import { buildGearStorePayload, isGearApiUnavailable, parseGearStorePayload } from '../gearStore';
import { emptyGearSelectionsStore } from '../gearSelections';

const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('gearStore', () => {
  it('parses a shared gear payload and keeps Angela picks', () => {
    const payload = parseGearStorePayload({
      store: {
        mockups: [
          {
            id: 'tee-a',
            category: 'tee',
            style: 'logo',
            familyId: 'letters',
            familyLabel: 'My Plan Letters Collection',
            name: 'Letter Tee',
            dataUrl: PNG,
            uploadedBy: 'Evelyn',
          },
        ],
        picks: ['tee-a'],
        sourceFolderPath: '',
      },
      updatedAt: '2026-08-29T03:00:00.000Z',
      updatedBy: 'evelyn3@cox.net',
    });
    expect(payload?.store.mockups[0]).toMatchObject({ id: 'tee-a', name: 'Letter Tee' });
    expect(payload?.store.picks).toEqual([{ mockupId: 'tee-a', role: 'tee' }]);
    expect(payload?.updatedBy).toBe('evelyn3@cox.net');
  });

  it('rejects junk and still builds a persistable payload', () => {
    expect(parseGearStorePayload(null)).toBeNull();
    const built = buildGearStorePayload(
      {
        ...emptyGearSelectionsStore(),
        mockups: [
          {
            id: 'hood-a',
            category: 'hoodie',
            style: 'tie-dye',
            familyId: 'tie-dye',
            familyLabel: 'My Plan Tie-Dye Collection',
            name: 'Spiral Hoodie',
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
    expect(built.store.mockups[0]?.name).toBe('Spiral Hoodie');
    expect(isGearApiUnavailable(405)).toBe(true);
    expect(isGearApiUnavailable(404)).toBe(true);
    expect(isGearApiUnavailable(200)).toBe(false);
  });
});
