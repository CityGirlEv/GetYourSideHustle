export const ANGELA_PLAN_SIGNOFF_KEY = 'myplan_angela_plan_signoff';
export const PHASE_1_CONTRACT_APPROVE_LABEL = 'Approve Phase 1 Contract';
export const PHASE_1_CONTRACT_SIGNED_LABEL = 'Phase 1 Contract Signed';
export const PHASE_1_CONTRACT_BUTTON_TEST_ID = 'phase1-contract-approve';

export interface AngelaPlanSignoff {
  signerName: string;
  signedAt: string;
  planKind: 'angela';
}

export function phase1ContractButtonLabel(signed: boolean): string {
  return signed ? PHASE_1_CONTRACT_SIGNED_LABEL : PHASE_1_CONTRACT_APPROVE_LABEL;
}

export function canSignAngelaPlan(signerName: string): { ok: true } | { ok: false; reason: string } {
  const name = signerName.trim();
  if (name.length < 2) return { ok: false, reason: 'Enter the signer name to complete electronic sign-off.' };
  return { ok: true };
}

export function formatSignoffLine(signoff: AngelaPlanSignoff): string {
  const when = new Date(signoff.signedAt);
  const stamped = Number.isNaN(when.getTime())
    ? signoff.signedAt
    : when.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
  return `Electronically signed by ${signoff.signerName} on ${stamped}`;
}

export function getAngelaPlanSignoff(): AngelaPlanSignoff | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(ANGELA_PLAN_SIGNOFF_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AngelaPlanSignoff;
    if (parsed.planKind !== 'angela' || !parsed.signerName || !parsed.signedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function signAngelaPlan(signerName: string, now = new Date()): AngelaPlanSignoff {
  const check = canSignAngelaPlan(signerName);
  if (!check.ok) throw new Error(check.reason);
  const record: AngelaPlanSignoff = {
    signerName: signerName.trim(),
    signedAt: now.toISOString(),
    planKind: 'angela',
  };
  localStorage.setItem(ANGELA_PLAN_SIGNOFF_KEY, JSON.stringify(record));
  return record;
}

export function clearAngelaPlanSignoff(): void {
  localStorage.removeItem(ANGELA_PLAN_SIGNOFF_KEY);
}

export function buildAngelaSignoffDocumentHtml(signoff: AngelaPlanSignoff | null): string {
  if (signoff) {
    return `
      <div class="signoff-box" id="doc-signoff">
        <div class="kicker">Contract Sign-Off</div>
        <h2 class="plain">Electronic Signature — Angela&apos;s Plan</h2>
        <p class="lede">This living Implementation Plan is accepted as the current scope of work.</p>
        <div class="signed-line">${formatSignoffLine(signoff)}</div>
        <div class="script-sign">${signoff.signerName}</div>
      </div>
    `;
  }
  return `
    <div class="signoff-box" id="doc-signoff">
      <div class="kicker">Contract Sign-Off</div>
      <h2 class="plain">Electronic Signature — Angela&apos;s Plan</h2>
      <p class="lede">Use the Electronic Signature button on Angela&apos;s Plan to complete contract sign-off. This living document updates as sprints land.</p>
      <div class="sign-line">X ________________________________</div>
    </div>
  `;
}
