import { describe, expect, it } from 'vitest';
import { validateChallengeSignup } from '../challengeSignup';

describe('challengeSignup', () => {
  it('requires email, a US phone, and a 7-day goal', () => {
    expect(validateChallengeSignup({})).toMatchObject({ ok: false, field: 'email' });
    expect(validateChallengeSignup({ email: 'pat@example.com' })).toMatchObject({ ok: false, field: 'phone' });
    expect(validateChallengeSignup({ email: 'pat@example.com', phone: '6195550100' })).toMatchObject({
      ok: false,
      field: 'goal',
    });
    expect(
      validateChallengeSignup({
        email: 'Pat@Example.com',
        phone: '1-619-555-0100',
        goal: 'Walk 30 minutes daily',
      }),
    ).toMatchObject({
      ok: true,
      values: {
        email: 'pat@example.com',
        phone: '(619) 555-0100',
        goal: 'Walk 30 minutes daily',
      },
    });
  });
});
