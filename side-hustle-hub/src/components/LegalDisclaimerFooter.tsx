import {
  LEGAL_DISCLAIMER_BODY,
  LEGAL_DISCLAIMER_HEADLINE,
  LEGAL_DISCLAIMER_LIABILITY,
  legalCopyrightNotice,
} from "../lib/legal-disclaimer";

type LegalDisclaimerFooterProps = {
  /** `document` = guides / printables; `site` = marketing site footer chrome. */
  variant?: "document" | "site";
  className?: string;
};

/**
 * Canonical “Your hustle, your results.” disclaimer for guides, printables, and the site footer.
 * Outbound email + PDF generators use the same copy from `legal-disclaimer.ts`.
 */
export function LegalDisclaimerFooter({
  variant = "document",
  className = "",
}: LegalDisclaimerFooterProps) {
  return (
    <aside
      className={`legal-disclaimer-footer legal-disclaimer-footer--${variant}${className ? ` ${className}` : ""}`}
      data-testid="legal-disclaimer-footer"
      role="note"
      aria-label="Legal disclaimer"
    >
      <p data-testid="legal-copyright-notice">{legalCopyrightNotice()}</p>
      <p>
        <strong>{LEGAL_DISCLAIMER_HEADLINE}</strong> {LEGAL_DISCLAIMER_BODY}
      </p>
      <p>{LEGAL_DISCLAIMER_LIABILITY}</p>
    </aside>
  );
}
