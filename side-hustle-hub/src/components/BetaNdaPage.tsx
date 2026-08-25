import type { ReactNode } from "react";
import { FileSignature, Mail } from "lucide-react";
import {
  BETA_NDA_EFFECTIVE_LABEL,
  BETA_NDA_INTRO,
  BETA_NDA_PROGRAM,
  BETA_NDA_SECTIONS,
  BETA_NDA_TITLE,
  BETA_NDA_VERSION,
} from "../lib/beta-tester-nda";
import { SITE_NAME } from "../lib/site-config";

type BetaNdaPageProps = {
  onContact?: () => void;
  onJoin?: () => void;
};

export function renderBetaNdaRichText(text: string): ReactNode {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*(.+)\*\*$/);
    if (match) return <strong key={i}>{match[1]}</strong>;
    return part;
  });
}

export function BetaNdaDocument({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "beta-nda-doc beta-nda-doc--compact" : "beta-nda-doc"}>
      {BETA_NDA_SECTIONS.map((section) => (
        <section key={section.id} className="privacy-page__section" aria-labelledby={section.id}>
          <h3 id={section.id}>{section.heading}</h3>
          {section.blocks.map((block, i) =>
            block.type === "list" ? (
              <ul key={`${section.id}-list-${i}`}>
                {block.items.map((item) => (
                  <li key={item}>{renderBetaNdaRichText(item)}</li>
                ))}
              </ul>
            ) : (
              <p key={`${section.id}-p-${i}`}>{renderBetaNdaRichText(block.text)}</p>
            ),
          )}
        </section>
      ))}
    </div>
  );
}

export function BetaNdaPage({ onContact, onJoin }: BetaNdaPageProps) {
  return (
    <div className="static-page privacy-page" data-testid="beta-nda-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">
          <FileSignature size={13} aria-hidden /> {BETA_NDA_PROGRAM}
        </span>
        <h2>{BETA_NDA_TITLE}</h2>
        <p className="privacy-page__effective" data-testid="beta-nda-effective-date">
          <strong>Effective Date: {BETA_NDA_EFFECTIVE_LABEL}</strong>
        </p>
        <p className="beta-nda-page__version" data-testid="beta-nda-version">
          Version <strong>{BETA_NDA_VERSION}</strong>
        </p>
        <p className="beta-nda-page__brand">Get Your Side Hustle (GYSH)</p>
        {BETA_NDA_INTRO.map((para) => (
          <p key={para.slice(0, 48)}>{renderBetaNdaRichText(para)}</p>
        ))}
      </section>

      <article className="glass static-page-card privacy-page__body">
        <BetaNdaDocument />
        <section className="privacy-page__section" aria-labelledby="beta-nda-signoff" data-testid="beta-nda-signoff">
          <h3 id="beta-nda-signoff">Electronic acceptance</h3>
          <p>
            Beta Testers accept this Agreement by selecting <strong>I Agree</strong> /{" "}
            <strong>Accept NDA</strong> and submitting their full legal name during GYSH signup.
          </p>
          <p>
            <strong>Get Your Side Hustle (GYSH)</strong>
            <br />
            getyoursidehustle.com
          </p>
        </section>
      </article>

      {onJoin || onContact ? (
        <div className="glass static-page-card privacy-page__cta">
          <p>
            Applying as a Beta Tester? Accept this NDA on the {SITE_NAME} membership signup form.
            Questions about the beta program can go through Contact Us.
          </p>
          <div className="beta-nda-page__cta-actions">
            {onJoin ? (
              <button type="button" className="btn btn-primary" onClick={onJoin} data-testid="beta-nda-join">
                Apply on signup
              </button>
            ) : null}
            {onContact ? (
              <button type="button" className="btn btn-outline" onClick={onContact} data-testid="beta-nda-contact">
                <Mail size={16} aria-hidden />
                Contact Us
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
