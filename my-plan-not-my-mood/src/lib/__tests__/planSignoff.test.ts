import { afterEach, describe, expect, it } from 'vitest';
import {
  ANGELA_PLAN_SIGNOFF_KEY,
  PHASE_1_CONTRACT_APPROVE_LABEL,
  PHASE_1_CONTRACT_SIGNED_LABEL,
  buildAngelaSignoffDocumentHtml,
  canSignAngelaPlan,
  clearAngelaPlanSignoff,
  formatSignoffLine,
  getAngelaPlanSignoff,
  phase1ContractButtonLabel,
  signAngelaPlan,
} from '../planSignoff';

describe('planSignoff', () => {
  afterEach(() => {
    localStorage.removeItem(ANGELA_PLAN_SIGNOFF_KEY);
  });

  it('labels the Phase 1 contract button as unsigned until sign-off', () => {
    expect(phase1ContractButtonLabel(false)).toBe(PHASE_1_CONTRACT_APPROVE_LABEL);
    expect(phase1ContractButtonLabel(true)).toBe(PHASE_1_CONTRACT_SIGNED_LABEL);
  });

  it('rejects a blank signer and accepts Angela Harris', () => {
    expect(canSignAngelaPlan('')).toEqual({
      ok: false,
      reason: 'Enter the signer name to complete electronic sign-off.',
    });
    expect(canSignAngelaPlan('Angela Harris').ok).toBe(true);
  });

  it('persists Angela plan sign-off and formats the contract line', () => {
    const signed = signAngelaPlan('Angela Harris', new Date('2026-08-26T12:00:00.000Z'));
    expect(getAngelaPlanSignoff()).toEqual(signed);
    expect(formatSignoffLine(signed)).toContain('Angela Harris');
    expect(formatSignoffLine(signed)).toContain('Electronically signed by');
    expect(buildAngelaSignoffDocumentHtml(signed)).toContain('Angela Harris');
    clearAngelaPlanSignoff();
    expect(getAngelaPlanSignoff()).toBeNull();
    expect(buildAngelaSignoffDocumentHtml(null)).toContain('Electronic Signature');
    expect(buildAngelaSignoffDocumentHtml(null)).not.toContain('Electronically signed by');
  });
});
