import type { CSSProperties, MouseEvent } from "react";
import { navigateAdminDeepLink, readAdminDeepLink } from "../../lib/admin-deep-links";
import { isExternalHref, parseMarkdownLinks } from "../../lib/qa-page-links";

/** Navigate same-origin paths in this tab so the sessionStorage auth marker survives. */
export function navigateInternalHref(href: string): void {
  if (typeof window === "undefined") return;
  let next: string;
  try {
    if (/^https?:\/\//i.test(href)) {
      const u = new URL(href);
      next = `${u.pathname}${u.search}${u.hash}`;
    } else {
      next = href.startsWith("/") ? href : `/${href}`;
    }
  } catch {
    next = href.startsWith("/") ? href : `/${href}`;
  }

  // Admin Studio deep links: apply tab + task/test/item/template focus in-SPA.
  if (next === "/admin" || next.startsWith("/admin?")) {
    const q = next.includes("?") ? next.slice(next.indexOf("?")) : "";
    const link = readAdminDeepLink(q);
    navigateAdminDeepLink({
      tab: link.tab,
      testId: link.testId,
      taskId: link.taskId,
      itemId: link.itemId,
      panel: link.panel,
      sub: link.sub,
      template: link.template,
    });
    return;
  }

  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current === next) {
    window.scrollTo(0, 0);
    return;
  }
  window.history.pushState({ view: "markdown-link" }, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Renders plain text with optional `[label](href)` markdown links as anchors. */
export function MarkdownLinkText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const parts = parseMarkdownLinks(text);
  return (
    <span className={className} style={style}>
      {parts.map((p, i) => {
        if (p.type !== "link") {
          return <span key={i}>{p.value}</span>;
        }
        const external = isExternalHref(p.href);
        const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
          e.stopPropagation();
          if (external) return;
          e.preventDefault();
          navigateInternalHref(p.href);
        };
        const onMouseDown = (e: MouseEvent<HTMLAnchorElement>) => {
          // Keep the parent <label> from toggling the step checkbox when opening a link.
          if (!external) e.preventDefault();
          e.stopPropagation();
        };
        return (
          <a
            key={i}
            href={p.href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={onClick}
            onMouseDown={onMouseDown}
            style={{ fontWeight: 700, color: "var(--crimson, #9B2F28)", textDecoration: "underline" }}
          >
            {p.label}
          </a>
        );
      })}
    </span>
  );
}
