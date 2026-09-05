import { describe, expect, it } from 'vitest';
import {
  ANGELA_HARRIS_SEED_EMAIL,
  applyKnownSeedPasswords,
  BRAND_ADMIN_EMAIL,
  BRAND_ADMIN_PASSWORD,
  EVELYN_SEED_EMAIL,
  isAcceptedSeedPassword,
  STAFF_SEED_PASSWORD,
} from '../seedAccounts';

describe('seedAccounts', () => {
  it('updates a stale brand-admin password so prod login matches the live passcode', () => {
    const synced = applyKnownSeedPasswords(
      [{ email: BRAND_ADMIN_EMAIL, passwordHash: 'Temp#123' }],
      [{ email: BRAND_ADMIN_EMAIL, passwordHash: BRAND_ADMIN_PASSWORD }],
    );
    expect(synced[0].passwordHash).toBe(BRAND_ADMIN_PASSWORD);
    expect(BRAND_ADMIN_PASSWORD).toBe('Kiva#3232');
  });

  it('syncs Evelyn and Angela Harris staff passwords to Admin123', () => {
    const synced = applyKnownSeedPasswords(
      [
        { email: EVELYN_SEED_EMAIL, passwordHash: 'Temp#123' },
        { email: ANGELA_HARRIS_SEED_EMAIL, passwordHash: 'oldpass' },
      ],
      [
        { email: EVELYN_SEED_EMAIL, passwordHash: STAFF_SEED_PASSWORD },
        { email: ANGELA_HARRIS_SEED_EMAIL, passwordHash: STAFF_SEED_PASSWORD },
      ],
    );
    expect(synced[0].passwordHash).toBe('Admin123');
    expect(synced[1].passwordHash).toBe('Admin123');
    expect(STAFF_SEED_PASSWORD).toBe('Admin123');
  });

  it('accepts Admin123 and the older staff passwords for Evelyn and Angela', () => {
    expect(isAcceptedSeedPassword(EVELYN_SEED_EMAIL, 'Admin123', 'Admin123')).toBe(true);
    expect(isAcceptedSeedPassword(EVELYN_SEED_EMAIL, 'Temp#123', 'Admin123')).toBe(true);
    expect(isAcceptedSeedPassword(ANGELA_HARRIS_SEED_EMAIL, 'Admin123', 'Admin123')).toBe(true);
    expect(isAcceptedSeedPassword('angela@angelaharris.com', 'Admin123')).toBe(true);
    expect(isAcceptedSeedPassword('angela@myplannotmymood.com', 'myplan2026', 'Admin123')).toBe(true);
    expect(isAcceptedSeedPassword(EVELYN_SEED_EMAIL, 'wrongpass', 'Admin123')).toBe(false);
    expect(isAcceptedSeedPassword('sarah@example.com', 'Admin123', 'member123')).toBe(false);
  });
});
