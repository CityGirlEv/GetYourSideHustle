import { UserPlus } from "lucide-react";
import { SITE_NAME, ROOT_DOMAIN, ADMIN_EMAIL, FACEBOOK_URL, SITE_PURPOSE } from "../lib/site-config";
import { LEGAL_DISCLAIMER_BODY, LEGAL_DISCLAIMER_HEADLINE, LEGAL_DISCLAIMER_LIABILITY, legalCopyrightNotice } from "../lib/legal-disclaimer";
import gyshLogo from "../assets/gysh-logo-rocket.png";
import { FacebookIcon } from "./FacebookIcon";

export type FooterNavView =
  | "about"
  | "contact"
  | "privacy"
  | "beta_nda"
  | "beta_credits"
  | "beta_points"
  | "join"
  | "memberships"
  | "login"
  | "community"
  | "newsletter"
  | "shop";

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
          <img
            src={gyshLogo}
            alt={SITE_NAME}
            className="site-footer-logo"
            width={486}
            height={243}
          />
          <div className="site-footer-social">
            <a
              href={FACEBOOK_URL}
              className="site-footer-social-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on Facebook"
              data-testid="footer-facebook"
            >
              <FacebookIcon size={18} aria-hidden />
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

        <p className="site-footer-tagline">{SITE_PURPOSE}</p>

        <nav className="site-footer-nav" aria-label="Footer">
          <button type="button" className="site-footer-link" onClick={() => onNavigate("about")}>
            About Us
          </button>
          <button
            type="button"
            className="site-footer-link"
            onClick={() => onNavigate("memberships")}
            data-testid="footer-see-memberships"
          >
            See Memberships
          </button>
          <button type="button" className="site-footer-link" onClick={() => onNavigate("community")}>
            Blog
          </button>
          <button type="button" className="site-footer-link" onClick={() => onNavigate("shop")}>
            Shop
          </button>
          <button
            type="button"
            className="site-footer-link"
            onClick={() => onNavigate("newsletter")}
            data-testid="footer-newsletter"
          >
            Newsletter
          </button>
          <button type="button" className="site-footer-link" onClick={() => onNavigate("contact")}>
            Contact Us
          </button>
          <button
            type="button"
            className="site-footer-link"
            onClick={() => onNavigate("privacy")}
            data-testid="footer-privacy"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            className="site-footer-link"
            onClick={() => onNavigate("beta_nda")}
            data-testid="footer-beta-nda"
          >
            Beta Tester NDA
          </button>
          <button
            type="button"
            className="site-footer-link"
            onClick={() => onNavigate("beta_credits")}
            data-testid="footer-beta-credits"
          >
            Beta Credits
          </button>
          <button
            type="button"
            className="site-footer-link"
            onClick={() => onNavigate("beta_points")}
            data-testid="footer-beta-points"
          >
            Beta Points
          </button>
          <a
            href={FACEBOOK_URL}
            className="site-footer-link site-footer-link--facebook"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon size={16} aria-hidden />
            Facebook
          </a>
        </nav>
      </div>

      <div className="site-footer-disclaimer">
        <p>
          <strong>{LEGAL_DISCLAIMER_HEADLINE}</strong> {LEGAL_DISCLAIMER_BODY}
        </p>
        <p>{LEGAL_DISCLAIMER_LIABILITY}</p>
      </div>

      <div className="site-footer-meta">
        <span>
          {legalCopyrightNotice(year)}
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
        <button
          type="button"
          className="site-footer-meta-link"
          onClick={() => onNavigate("privacy")}
          data-testid="footer-privacy-meta"
        >
          Privacy Policy
        </button>
        <span className="site-footer-dot" aria-hidden>
          ·
        </span>
        <button
          type="button"
          className="site-footer-meta-link"
          onClick={() => onNavigate("beta_nda")}
          data-testid="footer-beta-nda-meta"
        >
          Beta Tester NDA
        </button>
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
          <picture>
            <source srcSet="/brand/munties-ai-agents-logo.webp" type="image/webp" />
            <img
              src="/brand/munties-ai-agents-logo.png"
              alt="Muntie's AI Agents"
              className="site-footer-muntie-logo"
              width={32}
              height={32}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </a>
      </div>
    </footer>
  );
}
