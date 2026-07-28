import type { CSSProperties } from "react";
import { parseMarkdownLinks } from "../../lib/qa-page-links";

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
      {parts.map((p, i) =>
        p.type === "link" ? (
          <a
            key={i}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ fontWeight: 700, color: "var(--crimson, #9B2F28)", textDecoration: "underline" }}
          >
            {p.label}
          </a>
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </span>
  );
}
