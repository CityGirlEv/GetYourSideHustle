import { BetaNdaDocument } from "./BetaNdaPage";

export type BetaNdaAcceptanceValue = {
  legalName: string;
  email: string;
  signature: string;
  agreed: boolean;
};

type BetaNdaAcceptancePanelProps = {
  idPrefix: string;
  value: BetaNdaAcceptanceValue;
  acceptedAt: string;
  onChange: (next: BetaNdaAcceptanceValue) => void;
  onOpenFullNda?: () => void;
};

export function BetaNdaAcceptancePanel({
  idPrefix,
  value,
  acceptedAt,
  onChange,
  onOpenFullNda,
}: BetaNdaAcceptancePanelProps) {
  const nameId = `${idPrefix}-legal-name`;
  const emailId = `${idPrefix}-email`;
  const dateId = `${idPrefix}-date`;
  const signId = `${idPrefix}-signature`;
  const agreeId = `${idPrefix}-agree`;

  return (
    <div className="beta-nda-panel" data-testid={`${idPrefix}-panel`}>
      <p className="beta-nda-panel__lead">
        Read the Beta Tester Confidentiality and Non-Disclosure Agreement, then sign below.
        {onOpenFullNda ? (
          <>
            {" "}
            <button
              type="button"
              className="beta-nda-panel__link"
              onClick={onOpenFullNda}
              data-testid={`${idPrefix}-open-full`}
            >
              Open the full NDA
            </button>
          </>
        ) : (
          <>
            {" "}
            <a href="/beta-nda" className="beta-nda-panel__link" data-testid={`${idPrefix}-open-full`}>
              Open the full NDA
            </a>
          </>
        )}
      </p>
      <div className="beta-nda-panel__scroll" tabIndex={0} data-testid={`${idPrefix}-scroll`}>
        <BetaNdaDocument compact />
      </div>

      <label htmlFor={nameId}>Full legal name</label>
      <input
        id={nameId}
        type="text"
        autoComplete="name"
        value={value.legalName}
        onChange={(e) => onChange({ ...value, legalName: e.target.value })}
        data-testid={`${idPrefix}-legal-name`}
      />

      <label htmlFor={emailId}>Email address</label>
      <input
        id={emailId}
        type="email"
        autoComplete="email"
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
        data-testid={`${idPrefix}-email`}
      />

      <label htmlFor={dateId}>Date</label>
      <input id={dateId} type="text" value={acceptedAt} readOnly data-testid={`${idPrefix}-date`} />

      <label htmlFor={signId}>Electronic signature (type your full legal name)</label>
      <input
        id={signId}
        type="text"
        autoComplete="off"
        value={value.signature}
        onChange={(e) => onChange({ ...value, signature: e.target.value })}
        data-testid={`${idPrefix}-signature`}
      />

      <label className="membership-signup-role-opt" htmlFor={agreeId}>
        <input
          id={agreeId}
          type="checkbox"
          checked={value.agreed}
          onChange={(e) => onChange({ ...value, agreed: e.target.checked })}
          data-testid={`${idPrefix}-agree`}
        />
        <span>
          <strong>I have read and agree</strong>
          <span className="membership-signup-role-opt__hint">
            I have read this Agreement, understand its terms, and voluntarily agree to be bound by
            it.
          </span>
        </span>
      </label>
    </div>
  );
}
