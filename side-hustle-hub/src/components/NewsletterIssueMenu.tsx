import { useEffect, useId, useRef, useState } from "react";
import { PanelLeft, X } from "lucide-react";
import { newsletterIssueLinks, type NewsletterIssueLink } from "../lib/member-newsletters";

type NewsletterIssueMenuProps = {
  activeId: string;
  onSelect: (issue: NewsletterIssueLink) => void;
};

function formatIssueDate(value: string): string {
  if (!value) return "";
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export function NewsletterIssueMenu({ activeId, onSelect }: NewsletterIssueMenuProps) {
  const issues = newsletterIssueLinks();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const choose = (issue: NewsletterIssueLink) => {
    setOpen(false);
    onSelect(issue);
  };

  return (
    <div className={`newsletter-issue-drawer${open ? " is-open" : ""}`} data-testid="newsletter-issue-menu">
      <button
        type="button"
        className="btn btn-outline newsletter-issue-drawer__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        data-testid="newsletter-issue-menu-open"
      >
        <PanelLeft size={16} aria-hidden /> Newsletters
      </button>

      <button
        type="button"
        className="newsletter-issue-drawer__backdrop"
        aria-label="Close newsletters"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <aside
        id={panelId}
        className="newsletter-issue-drawer__panel glass"
        aria-hidden={!open}
        inert={!open}
        aria-label="Newsletters"
        data-testid="newsletter-issue-menu-panel"
      >
        <div className="newsletter-issue-drawer__head">
          <p className="newsletter-issue-menu__label">Newsletters</p>
          <button
            ref={closeRef}
            type="button"
            className="newsletter-issue-drawer__close"
            onClick={() => setOpen(false)}
            aria-label="Close newsletters"
            data-testid="newsletter-issue-menu-close"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <ul>
          {issues.map((issue) => {
            const current = issue.id === activeId;
            return (
              <li key={issue.id}>
                <button
                  type="button"
                  className="newsletter-issue-menu__link"
                  aria-current={current ? "page" : undefined}
                  onClick={() => choose(issue)}
                  data-testid={`newsletter-issue-link-${issue.id}`}
                >
                  <span className="newsletter-issue-menu__date">{formatIssueDate(issue.publishedAt)}</span>
                  <span className="newsletter-issue-menu__title">{issue.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
