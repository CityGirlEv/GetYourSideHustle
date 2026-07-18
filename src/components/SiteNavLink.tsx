import type { ReactNode } from "react";

type SiteNavLinkProps = {
  to: string;
  search?: Record<string, string>;
  hash?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
};

function buildHref(to: string, search?: Record<string, string>, hash?: string): string {
  const params = search
    ? new URLSearchParams(
        Object.entries(search).filter((entry): entry is [string, string] => entry[1] != null),
      ).toString()
    : "";
  const path = params ? `${to}?${params}` : to;
  return hash ? `${path}#${hash.replace(/^#/, "")}` : path;
}

/** Header / mobile menu links — native anchors so navigation works even when SPA transitions stall. */
export function SiteNavLink({
  to,
  search,
  hash,
  className,
  children,
  onClick,
  "aria-label": ariaLabel,
}: SiteNavLinkProps) {
  return (
    <a href={buildHref(to, search, hash)} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
