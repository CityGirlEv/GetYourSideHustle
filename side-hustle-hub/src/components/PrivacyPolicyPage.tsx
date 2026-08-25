import type { ReactNode } from "react";
import { Mail, Shield } from "lucide-react";
import {
  PRIVACY_POLICY_EFFECTIVE_DATE,
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_TITLE,
} from "../lib/privacy-policy";
import { SITE_NAME } from "../lib/site-config";

type PrivacyPolicyPageProps = {
  onContact?: () => void;
};

function renderRichText(text: string): ReactNode {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*(.+)\*\*$/);
    if (match) return <strong key={i}>{match[1]}</strong>;
    return part;
  });
}

export function PrivacyPolicyPage({ onContact }: PrivacyPolicyPageProps) {
  return (
    <div className="static-page privacy-page" data-testid="privacy-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">
          <Shield size={13} aria-hidden /> Privacy
        </span>
        <h2>{PRIVACY_POLICY_TITLE}</h2>
        <p className="privacy-page__effective" data-testid="privacy-effective-date">
          <strong>Effective Date: {PRIVACY_POLICY_EFFECTIVE_DATE}</strong>
        </p>
        {PRIVACY_POLICY_INTRO.map((para) => (
          <p key={para.slice(0, 48)}>{renderRichText(para)}</p>
        ))}
      </section>

      <article className="glass static-page-card privacy-page__body">
        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <section key={section.id} className="privacy-page__section" aria-labelledby={section.id}>
            <h3 id={section.id}>{section.heading}</h3>
            {section.blocks.map((block, i) =>
              block.type === "list" ? (
                <ul key={`${section.id}-list-${i}`}>
                  {block.items.map((item) => (
                    <li key={item}>{renderRichText(item)}</li>
                  ))}
                </ul>
              ) : (
                <p key={`${section.id}-p-${i}`}>{renderRichText(block.text)}</p>
              ),
            )}
          </section>
        ))}
      </article>

      {onContact ? (
        <div className="glass static-page-card privacy-page__cta">
          <p>
            Need to ask a privacy question or make a parental request? Send a note through the {SITE_NAME}{" "}
            contact form.
          </p>
          <button type="button" className="btn btn-primary" onClick={onContact} data-testid="privacy-contact">
            <Mail size={16} aria-hidden />
            Contact Us
          </button>
        </div>
      ) : null}
    </div>
  );
}
