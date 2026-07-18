import { UserPlus } from "lucide-react";
import { SITE_NAME, ROOT_DOMAIN, ADMIN_EMAIL, FACEBOOK_URL, SITE_PURPOSE } from "../lib/site-config";
import gyshLogo from "../assets/gysh-logo-rocket.png";
import muntiesLogo from "../assets/munties-ai-agents-logo.png";
import { FacebookIcon } from "./FacebookIcon";

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
          <p className="site-footer-tagline">{SITE_PURPOSE}</p>
          <div className="site-footer-social">
            <a
              href={FACEBOOK_URL}
              className="site-footer-social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Get Your Side Hustle on Facebook"
              data-testid="footer-facebook"
            >
              <FacebookIcon size={18} />
              <span>Follow on Facebook</span>
            </a>
            <button
              type="button"
              className="site-footer-social-link site-footer-social-link--btn"
              onClick={() => onNavigate("join")}
            >
              <UserPlus size={18} aria-hidden />
              <span>Join GYSH</span>
            </button>
          </div>
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          <button type="button" className="site-footer-link" onClick={() => onNavigate("about")}>
            About
          </button>
          <button type="button" className="site-footer-link" onClick={() => onNavigate("join")}>
            Join
          </button>
          <button type="button" className="site-footer-link" onClick={() => onNavigate("community")}>
            Community
          </button>
          <button type="button" className="site-footer-link" onClick={() => onNavigate("contact")}>
            Contact Us
          </button>
          <a
            href={FACEBOOK_URL}
            className="site-footer-link site-footer-link--facebook"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GYSH on Facebook"
          >
            <FacebookIcon size={16} />
            Facebook
          </a>
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
