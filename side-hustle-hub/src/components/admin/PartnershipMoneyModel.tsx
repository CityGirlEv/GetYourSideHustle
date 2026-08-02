import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, ListTree } from "lucide-react";
import {
  MONEY_MODEL_SECTIONS,
  PARTNERSHIP_MONEY_MODEL_META,
  type MoneyModelSection,
  type MoneyModelSectionId,
} from "../../lib/partnership-money-model";
import { adminStudioUrl, financialsMoneyModelUrl } from "../../lib/admin-deep-links";
import { downloadPartnershipMoneyModelPdf } from "../../lib/partnership-money-model-pdf";
import { reservePdfTab } from "../../lib/open-pdf";

function MoneyTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 16 }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.95rem",
          background: "#fff",
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderBottom: "2px solid var(--border-color)",
                  color: "var(--text-primary)",
                  fontWeight: 650,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? "rgba(247, 243, 237, 0.55)" : "#fff" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid var(--border-color)",
                    verticalAlign: "top",
                    color: "var(--text-primary)",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBody({ section }: { section: MoneyModelSection }) {
  return (
    <>
      {section.intro ? (
        <p style={{ marginTop: 0, color: "var(--text-primary)", lineHeight: 1.55 }}>
          {section.intro}
        </p>
      ) : null}
      {(section.tables ?? []).map((block, ti) => (
        <div key={ti}>
          {block.caption ? (
            <p style={{ fontWeight: 650, marginBottom: 8 }}>{block.caption}</p>
          ) : null}
          <MoneyTable headers={block.table.headers} rows={block.table.rows} />
        </div>
      ))}
      {section.bullets?.length ? (
        <ul style={{ margin: "0 0 12px", paddingLeft: 22, lineHeight: 1.55 }}>
          {section.bullets.map((b) => (
            <li key={b} style={{ marginBottom: 8 }}>
              {b}
            </li>
          ))}
        </ul>
      ) : null}
      {(section.paragraphs ?? []).map((p) => (
        <p key={p.slice(0, 40)} style={{ marginTop: 0, lineHeight: 1.6 }}>
          {p}
        </p>
      ))}
      {section.note ? (
        <p
          style={{
            margin: 0,
            fontSize: "0.92rem",
            color: "var(--text-primary)",
            opacity: 0.85,
            lineHeight: 1.5,
          }}
        >
          {section.note}
        </p>
      ) : null}
    </>
  );
}

function CardSection({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          border: "none",
          background: open ? "rgba(148, 125, 100, 0.1)" : "transparent",
          cursor: "pointer",
          textAlign: "left",
          font: "inherit",
          fontWeight: 650,
          color: "var(--text-primary)",
        }}
      >
        {open ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
        <span>{title}</span>
      </button>
      {open ? <div style={{ padding: "4px 16px 16px" }}>{children}</div> : null}
    </section>
  );
}

const ALL_IDS = MONEY_MODEL_SECTIONS.map((s) => s.id);

export const PartnershipMoneyModel: React.FC = () => {
  const [openIds, setOpenIds] = useState<Set<MoneyModelSectionId>>(
    () => new Set<MoneyModelSectionId>(["core"]),
  );
  const [pdfBusy, setPdfBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const documentMode = useMemo(
    () => ALL_IDS.every((id) => openIds.has(id)),
    [openIds],
  );

  const toggle = (id: MoneyModelSectionId) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenIds(new Set(ALL_IDS));
  const collapseAll = () => setOpenIds(new Set());

  const jumpTo = (id: MoneyModelSectionId) => {
    setOpenIds((prev) => {
      // Keep document mode if already fully expanded; otherwise open the target.
      if (ALL_IDS.every((x) => prev.has(x))) return prev;
      return new Set(prev).add(id);
    });
    requestAnimationFrame(() => {
      document.getElementById(`money-model-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const openPdf = () => {
    const tab = reservePdfTab();
    setPdfBusy(true);
    setError("");
    void downloadPartnershipMoneyModelPdf(tab)
      .then(() => setMessage("Partnership money model PDF opened."))
      .catch((e: unknown) => {
        try {
          tab?.close();
        } catch {
          /* ignore */
        }
        setError(e instanceof Error ? e.message : "Could not open PDF.");
      })
      .finally(() => setPdfBusy(false));
  };

  const meta = PARTNERSHIP_MONEY_MODEL_META;
  const pageUrl = financialsMoneyModelUrl();

  return (
    <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <h3
            style={{
              marginTop: 0,
              marginBottom: 6,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>{meta.title}</span>
            <a
              href={adminStudioUrl({ tab: "tasks", taskId: meta.taskNumber })}
              title={`Open ${meta.taskNumber} in Task List`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 10px",
                borderRadius: 999,
                border: "1px solid var(--border-color)",
                background: "rgba(148, 125, 100, 0.12)",
                color: "var(--bronze, #947d64)",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Task {meta.taskNumber}
            </a>
          </h3>
          <p className="admin-page-lede" style={{ margin: 0 }}>
            {meta.subtitle}. Working summary for partners - not the signed contract.
          </p>
          <p style={{ margin: "8px 0 0", fontSize: "0.9rem", wordBreak: "break-all" }}>
            <span style={{ opacity: 0.85 }}>Direct link: </span>
            <a href={pageUrl} style={{ color: "var(--bronze, #947d64)" }}>
              {pageUrl}
            </a>
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={pdfBusy}
          onClick={openPdf}
          style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
        >
          <Download size={16} /> {pdfBusy ? "Opening PDF…" : "Download PDF"}
        </button>
      </div>

      <p style={{ marginTop: 0, marginBottom: 16, fontSize: "0.95rem", color: "var(--text-primary)" }}>
        {meta.lead}
      </p>

      {error ? (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 10,
            background: "rgba(185,28,28,0.08)",
            color: "#991b1b",
            fontSize: "1rem",
          }}
        >
          {error}
        </div>
      ) : null}
      {message ? (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 10,
            background: "rgba(45,106,79,0.1)",
            color: "#1b4332",
            fontSize: "1rem",
          }}
        >
          {message}
        </div>
      ) : null}

      <nav
        aria-label="Money model table of contents"
        style={{
          marginBottom: 16,
          padding: 14,
          borderRadius: 12,
          border: "1px solid var(--border-color)",
          background: "rgba(148, 125, 100, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <strong style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ListTree size={16} aria-hidden /> Contents
          </strong>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary" onClick={expandAll} disabled={documentMode}>
              Expand all (document)
            </button>
            <button
              type="button"
              className="btn"
              onClick={collapseAll}
              disabled={openIds.size === 0}
            >
              Collapse all
            </button>
          </div>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "var(--text-primary)", opacity: 0.9 }}>
          {documentMode
            ? "Document view: all sections open as one continuous page. Collapse a heading or use Collapse all to leave this view."
            : "Expand individual sections, or use Expand all (document) to read everything as one page."}
        </p>
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
          {MONEY_MODEL_SECTIONS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => jumpTo(s.id)}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  font: "inherit",
                  color: "var(--bronze, #947d64)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                {i + 1}. {s.tocLabel}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {documentMode ? (
        <article
          aria-label="Partnership money model document"
          style={{
            border: "1px solid var(--border-color)",
            borderRadius: 14,
            background: "#fff",
            padding: "28px 28px 36px",
            boxShadow: "none",
          }}
        >
          <header style={{ marginBottom: 28, paddingBottom: 18, borderBottom: "2px solid var(--border-color)" }}>
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "1.45rem",
                color: "var(--text-primary)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span>{meta.title}</span>
              <span
                style={{
                  display: "inline-flex",
                  padding: "3px 10px",
                  borderRadius: 999,
                  border: "1px solid var(--border-color)",
                  background: "rgba(148, 125, 100, 0.12)",
                  color: "var(--bronze, #947d64)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                Task {meta.taskNumber}
              </span>
            </h2>
            <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: 1.5 }}>{meta.subtitle}</p>
          </header>

          {MONEY_MODEL_SECTIONS.map((section, idx) => (
            <section
              key={section.id}
              id={`money-model-${section.id}`}
              style={{
                marginBottom: idx === MONEY_MODEL_SECTIONS.length - 1 ? 0 : 28,
                paddingBottom: idx === MONEY_MODEL_SECTIONS.length - 1 ? 0 : 28,
                borderBottom:
                  idx === MONEY_MODEL_SECTIONS.length - 1
                    ? "none"
                    : "1px solid var(--border-color)",
              }}
            >
              <button
                type="button"
                onClick={() => toggle(section.id)}
                aria-expanded
                title="Collapse this section"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  margin: "0 0 12px",
                  padding: 0,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  font: "inherit",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  color: "var(--text-primary)",
                }}
              >
                <ChevronDown size={18} aria-hidden style={{ flexShrink: 0, opacity: 0.7 }} />
                <span>{section.title}</span>
              </button>
              <SectionBody section={section} />
            </section>
          ))}
        </article>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {MONEY_MODEL_SECTIONS.map((section) => (
            <CardSection
              key={section.id}
              id={`money-model-${section.id}`}
              title={section.title}
              open={openIds.has(section.id)}
              onToggle={() => toggle(section.id)}
            >
              <SectionBody section={section} />
            </CardSection>
          ))}
        </div>
      )}
    </div>
  );
};
