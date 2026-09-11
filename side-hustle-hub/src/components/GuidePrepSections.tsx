import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { GuideKit } from "../lib/guide-tools";
import {
  formatGuideToolLine,
  formatPricingLine,
  guideToolsDisclaimer,
  prerequisitesDisclaimer,
  pricingDisclaimer,
  suppliesDisclaimer,
} from "../lib/guide-tools";

export type PrepTabId =
  | "all"
  | "prereqs"
  | "pricing"
  | "supplies"
  | "tools"
  | "steps"
  | "calculator";

type PrepTab = {
  id: PrepTabId;
  label: string;
  panelClass: string;
  testId: string;
  content: ReactNode;
};

export type GuidePrepFocusSignal = {
  tab: PrepTabId;
  nonce: number;
};

/** Prerequisites, pricing, supplies, tools — and optional Steps / Calculator — as tabs. */
export function GuidePrepSections({
  kit,
  testIdPrefix = "guide",
  stepsTab,
  calculatorTab,
  focusSignal,
}: {
  kit: GuideKit;
  testIdPrefix?: string;
  /** When set, adds a final tab for the launch checklist steps. */
  stepsTab?: {
    count: number;
    content: ReactNode;
  };
  /** Per-guide revenue / profit estimator. */
  calculatorTab?: {
    content: ReactNode;
  };
  /** Parent can jump to a tab (e.g. Launch Revenue Calculator). */
  focusSignal?: GuidePrepFocusSignal | null;
}) {
  const supplies = kit.supplies;
  const pricing = kit.suggestedPricing;
  const [checkedSupplies, setCheckedSupplies] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<PrepTabId>("all");
  /** Show All: missing key = expanded. Explicit `false` collapses a section. */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!focusSignal?.tab) return;
    setActiveTab(focusSignal.tab);
  }, [focusSignal?.nonce, focusSignal?.tab]);

  useEffect(() => {
    // Reset so Show All opens fully expanded for the next guide.
    setOpenSections({});
  }, [kit, stepsTab?.count, calculatorTab]);

  const tabs = useMemo((): PrepTab[] => {
    const list: PrepTab[] = [
      {
        id: "prereqs",
        label: "Prerequisites",
        panelClass: "gysh-section-panel--prereqs",
        testId: `${testIdPrefix}-prerequisites`,
        content: (
          <>
            <p className="gysh-section-panel__lede">{prerequisitesDisclaimer()}</p>
            <ul className="gysh-section-panel__list">
              {kit.prerequisites.map((p) => (
                <li key={p.id}>
                  <strong>{p.label}:</strong> {p.detail}
                </li>
              ))}
            </ul>
          </>
        ),
      },
    ];

    if (pricing && pricing.items.length > 0) {
      list.push({
        id: "pricing",
        label: "Suggested Pricing",
        panelClass: "gysh-section-panel--pricing",
        testId: `${testIdPrefix}-pricing`,
        content: (
          <>
            <p className="gysh-section-panel__lede">{pricingDisclaimer()}</p>
            <ul className="gysh-section-panel__list">
              {pricing.items.map((item) => (
                <li key={item.id}>{formatPricingLine(item)}</li>
              ))}
            </ul>
            {pricing.raiseTip ? (
              <p className="gysh-section-panel__foot">
                <strong>Raise tip:</strong> {pricing.raiseTip}
              </p>
            ) : null}
          </>
        ),
      });
    }

    if (supplies && supplies.items.length > 0) {
      list.push({
        id: "supplies",
        label: "Supply List",
        panelClass: "gysh-section-panel--supplies",
        testId: `${testIdPrefix}-supplies`,
        content: (
          <>
            <p className="gysh-section-panel__lede">{suppliesDisclaimer()}</p>
            <p className="gysh-section-panel__highlight">
              <strong>Estimated cost to gather supplies before your first paid job:</strong>{" "}
              {supplies.starterKitTotal}
            </p>
            <ol className="gysh-supply-checklist" data-testid={`${testIdPrefix}-supply-checklist`}>
              {supplies.items.map((item, index) => {
                const checked = !!checkedSupplies[item.id];
                return (
                  <li key={item.id} className={checked ? "is-checked" : undefined}>
                    <label className="gysh-supply-checklist__row">
                      <span className="gysh-supply-checklist__num" aria-hidden>
                        {index + 1}.
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setCheckedSupplies((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }))
                        }
                        aria-label={`Got ${item.name}`}
                      />
                      <span className="gysh-supply-checklist__body">
                        <strong>{item.name}</strong>
                        <span className="gysh-supply-checklist__meta">
                          Qty: {item.qty} · Est. {item.estCost}
                          {item.optional ? " · optional" : ""}
                          {item.notes ? ` — ${item.notes}` : ""}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ol>
            <p className="gysh-section-panel__foot gysh-supply-checklist__print-hint">
              Tip: use Download PDF for a printable numbered checklist with empty checkboxes.
            </p>
          </>
        ),
      });
    }

    list.push({
      id: "tools",
      label: "Tools",
      panelClass: "gysh-section-panel--tools",
      testId: `${testIdPrefix}-tools`,
      content: (
        <>
          <p className="gysh-section-panel__lede">{guideToolsDisclaimer()}</p>
          <ul className="gysh-section-panel__list">
            {kit.tools.map((tool) => (
              <li key={tool.id}>
                {formatGuideToolLine(tool)}
                {tool.url ? (
                  <>
                    {" "}
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      Open {tool.name}
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
          {kit.externalLinks && kit.externalLinks.length > 0 ? (
            <div className="gysh-section-panel__links">
              <strong>Exact outside links</strong>
              <ul className="gysh-section-panel__list">
                {kit.externalLinks.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                    {link.note ? ` — ${link.note}` : ""} ({link.url})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ),
    });

    if (stepsTab && stepsTab.count > 0) {
      list.push({
        id: "steps",
        label: `Show ${stepsTab.count} step${stepsTab.count === 1 ? "" : "s"}`,
        panelClass: "gysh-section-panel--steps",
        testId: `${testIdPrefix}-steps`,
        content: stepsTab.content,
      });
    }

    if (calculatorTab) {
      list.push({
        id: "calculator",
        label: "Revenue Calculator",
        panelClass: "gysh-section-panel--calculator",
        testId: `${testIdPrefix}-calculator`,
        content: calculatorTab.content,
      });
    }

    return [
      {
        id: "all" as const,
        label: "Show All",
        panelClass: "gysh-section-panel--all",
        testId: `${testIdPrefix}-show-all`,
        content: null,
      },
      ...list,
    ];
  }, [kit, pricing, supplies, checkedSupplies, testIdPrefix, stepsTab, calculatorTab]);

  const sectionTabs = tabs.filter((t) => t.id !== "all");
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const showAll = activeTab === "all";

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      // Default is open; first click collapses.
      [id]: prev[id] === false,
    }));
  };

  return (
    <div className="guide-prep-sections guide-prep-sections--tabs" data-testid={`${testIdPrefix}-prep-tabs`}>
      <div
        className="guide-prep-tabs"
        role="tablist"
        aria-label="Guide sections"
        data-testid={`${testIdPrefix}-prep-tablist`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${testIdPrefix}-tab-${tab.id}`}
            aria-selected={active.id === tab.id}
            aria-controls={
              tab.id === "all" ? `${testIdPrefix}-panel-all` : `${testIdPrefix}-panel-${tab.id}`
            }
            data-testid={
              tab.id === "all"
                ? `${testIdPrefix}-tab-all`
                : tab.id === "steps"
                  ? `${testIdPrefix}-steps-toggle`
                  : `${testIdPrefix}-tab-${tab.id}`
            }
            className={`guide-prep-tab${active.id === tab.id ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showAll ? (
        <div
          className="guide-prep-show-all"
          id={`${testIdPrefix}-panel-all`}
          role="tabpanel"
          aria-labelledby={`${testIdPrefix}-tab-all`}
          data-testid={`${testIdPrefix}-show-all`}
        >
          {sectionTabs.map((tab) => {
            const open = openSections[tab.id] !== false;
            const panelId = `${testIdPrefix}-collapse-${tab.id}`;
            return (
              <section
                key={tab.id}
                className={`gysh-section-panel gysh-section-panel--collapsible ${tab.panelClass} guide-prep-${tab.id === "prereqs" ? "prereqs" : tab.id}${open ? " is-open" : ""}`}
                aria-label={tab.label}
                data-testid={tab.testId}
              >
                <button
                  type="button"
                  className="gysh-section-heading gysh-section-heading--toggle"
                  aria-expanded={open}
                  aria-controls={panelId}
                  data-testid={`${testIdPrefix}-collapse-toggle-${tab.id}`}
                  onClick={() => toggleSection(tab.id)}
                >
                  <span className="gysh-section-heading__chevron" aria-hidden>
                    {open ? "▾" : "▸"}
                  </span>
                  <span>{tab.label.replace(/^Show /, "")}</span>
                </button>
                {open ? (
                  <div className="gysh-section-panel__body" id={panelId}>
                    {tab.content}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : (
        <section
          className={`gysh-section-panel ${active.panelClass} guide-prep-${active.id === "prereqs" ? "prereqs" : active.id}`}
          role="tabpanel"
          id={`${testIdPrefix}-panel-${active.id}`}
          aria-labelledby={`${testIdPrefix}-tab-${active.id}`}
          data-testid={active.testId}
          aria-label={active.label}
        >
          <h3 className="gysh-section-heading">{active.label.replace(/^Show /, "")}</h3>
          <div className="gysh-section-panel__body">{active.content}</div>
        </section>
      )}
    </div>
  );
}
