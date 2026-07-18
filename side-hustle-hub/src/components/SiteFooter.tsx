import { SITE_NAME, ROOT_DOMAIN, ADMIN_EMAIL } from "../lib/site-config";
import gyshLogo from "../assets/gysh-logo-rocket.png";
import muntiesLogo from "../assets/munties-ai-agents-logo.png";

export type FooterNavView = "about" | "contact" | "join" | "login" | "community";

type SiteFooterProps = {
  onNavigate: (view: FooterNavView) => void;
};

const MUNTIES_URL = "https://muntiesaiagents.com";

export function SiteFooter({ onNavigate }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src={gyshLogo} alt={SITE_NAME} className="site-footer-logo" />
          <p className="site-footer-tagline">
            Educational side-hustle playbooks for adults, juniors, and families — built by{" "}
            <span className="nowrap">T&nbsp;+&nbsp;E.</span>
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          <button type="button" className="site-footer-link" onClick={() => onNavigate("about")}>
            About
          </button>
          <button type="button" className="site-footer-link" onClick={() => onNavigate("join")}>
            Join
          </button>
          <button type="button" className="site-footer-link" onClick={() => onNavigate("contact")}>
            Contact Us
          </button>
        </nav>
      </div>

      <div className="site-footer-disclaimer">
        <p>
          <strong>Your hustle, your results.</strong> Income examples, calculators, and workshop takeaways are
          educational illustrations only — not guarantees. Outcomes depend on your effort, skills, market, and
          consistency. {SITE_NAME} does not provide financial, legal, tax, or investment advice. Consult licensed
          professionals before making business or money decisions.
        </p>
      </div>

      <div className="site-footer-meta">
        <span>
          © {year} {SITE_NAME}. All rights reserved.
        </span>
        <span className="site-footer-dot" aria-hidden>
          ·
        </span>
        <a href={`https://${ROOT_DOMAIN}`} className="site-footer-meta-link">
          {ROOT_DOMAIN}
        </a>
        <span className="site-footer-dot" aria-hidden>
          ·
        </span>
        <a href={`mailto:${ADMIN_EMAIL}`} className="site-footer-meta-link">
          {ADMIN_EMAIL}
        </a>
        <span className="site-footer-dot" aria-hidden>
          ·
        </span>
        <a
          href={MUNTIES_URL}
          className="site-footer-built-by"
          target="_blank"
          rel="noopener noreferrer"
          title="Muntie's AI Agents"
        >
          <span>Powered by</span>
          <img src={muntiesLogo} alt="Muntie's AI Agents" className="site-footer-muntie-logo" />
        </a>
      </div>
    </footer>
  );
}
