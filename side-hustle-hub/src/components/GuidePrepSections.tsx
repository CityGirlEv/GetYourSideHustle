import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { GuideKit } from "../lib/guide-tools";
import {
  YOUTH_SPORTS_HELPER_NOTES_WORKSHEET,
  YOUTH_SPORTS_HELPER_REALITY_CHECK,
} from "../lib/youth-sports-helper-guide";
import {
  JUNIOR_GIVE_BACK_TEACH_NOTES_WORKSHEET,
  JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK,
} from "../lib/junior-give-back-teach-guide";
import {
  KIDS_KINDNESS_SHARE_NOTES_WORKSHEET,
  KIDS_KINDNESS_SHARE_REALITY_CHECK,
} from "../lib/kids-kindness-share-guide";
import {
  KIDS_PIGGY_FIRST_GOAL_NOTES_WORKSHEET,
  KIDS_PIGGY_FIRST_GOAL_REALITY_CHECK,
} from "../lib/kids-piggy-first-goal-guide";
import {
  formatGuideToolLine,
  formatPricingLine,
  deliveryDriverToolsDisclaimer,
  estateSaleToolsDisclaimer,
  genealogyToolsDisclaimer,
  kidsPartyGameHostToolsDisclaimer,
  leadFollowupToolsDisclaimer,
  localContentPhotoToolsDisclaimer,
  personalShopperToolsDisclaimer,
  youthSportsHelperToolsDisclaimer,
  juniorGiveBackTeachToolsDisclaimer,
  kidsKindnessShareToolsDisclaimer,
  kidsPiggyFirstGoalToolsDisclaimer,
  appointmentSetterToolsDisclaimer,
  mothersHelperToolsDisclaimer,
  babysittingToolsDisclaimer,
  digitalProductsToolsDisclaimer,
  rideshareToolsDisclaimer,
  localEventContentToolsDisclaimer,
  propertyMgmtToolsDisclaimer,
  juniorReinvestCeoToolsDisclaimer,
  kidsReinvestJarToolsDisclaimer,
  airbnbTurnoverCheckerToolsDisclaimer,
  guideToolsDisclaimer,
  prerequisitesDisclaimer,
  pricingDisclaimer,
  suppliesDisclaimer,
} from "../lib/guide-tools";
import {
  MOTHERS_HELPER_NOTES_WORKSHEET,
  MOTHERS_HELPER_REALITY_CHECK,
} from "../lib/mothers-helper-guide";
import {
  FOOD_DELIVERY_NOTES_WORKSHEET,
  FOOD_DELIVERY_REALITY_CHECK,
} from "../lib/food-delivery-guide";
import {
  ESTATE_SALE_NOTES_WORKSHEET,
  ESTATE_SALE_REALITY_CHECK,
} from "../lib/estate-sale-antique-resales-guide";
import {
  GENEALOGY_NOTES_WORKSHEET,
  GENEALOGY_REALITY_CHECK,
} from "../lib/genealogy-family-history-guide";
import {
  KIDS_PARTY_GAME_HOST_NOTES_WORKSHEET,
  KIDS_PARTY_GAME_HOST_REALITY_CHECK,
} from "../lib/kids-party-game-host-guide";
import {
  LEAD_FOLLOWUP_NOTES_WORKSHEET,
  LEAD_FOLLOWUP_REALITY_CHECK,
} from "../lib/lead-followup-assistant-guide";
import {
  APPOINTMENT_SETTER_NOTES_WORKSHEET,
  APPOINTMENT_SETTER_REALITY_CHECK,
} from "../lib/appointment-setter-guide";
import {
  ONLINE_RESEARCH_ASSISTANT_NOTES_WORKSHEET,
  ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK,
  onlineResearchAssistantToolsDisclaimer,
} from "../lib/online-research-assistant-guide";
import {
  LOCAL_CONTENT_PHOTO_NOTES_WORKSHEET,
  LOCAL_CONTENT_PHOTO_REALITY_CHECK,
} from "../lib/local-content-photographer-guide";
import {
  PERSONAL_SHOPPER_NOTES_WORKSHEET,
  PERSONAL_SHOPPER_REALITY_CHECK,
} from "../lib/personal-shopper-guide";
import {
  BABYSITTING_NOTES_WORKSHEET,
  BABYSITTING_REALITY_CHECK,
} from "../lib/babysitting-guide";
import {
  DIGITAL_PRODUCTS_NOTES_WORKSHEET,
  DIGITAL_PRODUCTS_REALITY_CHECK,
} from "../lib/digital-products-guide";
import {
  RIDESHARE_NOTES_WORKSHEET,
  RIDESHARE_REALITY_CHECK,
} from "../lib/rideshare-guide";
import {
  LOCAL_EVENT_CONTENT_NOTES_WORKSHEET,
  LOCAL_EVENT_CONTENT_REALITY_CHECK,
} from "../lib/local-event-content-creator-guide";
import {
  PROPERTY_MGMT_NOTES_WORKSHEET,
  PROPERTY_MGMT_REALITY_CHECK,
} from "../lib/property-mgmt-guide";
import {
  AIRBNB_TURNOVER_CHECKER_NOTES_WORKSHEET,
  AIRBNB_TURNOVER_CHECKER_REALITY_CHECK,
} from "../lib/airbnb-turnover-checker-guide";
import {
  JUNIOR_REINVEST_CEO_NOTES_WORKSHEET,
  JUNIOR_REINVEST_CEO_REALITY_CHECK,
} from "../lib/junior-reinvest-ceo-guide";
import {
  KIDS_REINVEST_JAR_NOTES_WORKSHEET,
  KIDS_REINVEST_JAR_REALITY_CHECK,
} from "../lib/kids-reinvest-jar-guide";

export type PrepTabId =
  | "all"
  | "prereqs"
  | "pricing"
  | "supplies"
  | "tools"
  | "steps"
  | "calculator"
  | "notes";

/**
 * Tabs whose dedicated-tab body is rendered only by staff afterTabs editors.
 * Show All still lists every section (including these) so staff can preview the
 * full guide layout; the Notes tab alone stays editor-owned to avoid a blank panel.
 *
 * Prerequisites, Tools, Steps, Suggested Pricing, and Supply List always use the
 * normal member-facing panels; staff still get inline editors via afterTabs.
 */
export function guidePrepAfterTabsOwnsPanel(canEditGuideContent: boolean): PrepTabId[] | undefined {
  return canEditGuideContent ? ["notes"] : undefined;
}

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

/** Prerequisites, pricing, supplies, tools — and optional Steps / Calculator / Notes — as tabs. */
export function GuidePrepSections({
  kit,
  testIdPrefix = "guide",
  stepsTab,
  calculatorTab,
  notesTab,
  focusSignal,
  afterTabs,
  expandAllSections = false,
  afterTabsOwnsPanel,
  guideId,
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
  /** Per-guide member notes + attachments. */
  notesTab?: {
    content: ReactNode;
  };
  /** Parent can jump to a tab (e.g. Launch Revenue Calculator). */
  focusSignal?: GuidePrepFocusSignal | null;
  /** Rendered between the tab menu and the panels (e.g. admin editor keyed to the active tab). */
  afterTabs?: ReactNode | ((activeTab: PrepTabId) => ReactNode);
  /** Keep Show All sections expanded (still collapsible). */
  expandAllSections?: boolean;
  /** Tabs whose body is already rendered in afterTabs (avoid duplicate panel content). */
  afterTabsOwnsPanel?: PrepTabId[];
  /** Stable id — resets Show All expansion when the open guide changes (not on every kit object recreate). */
  guideId?: string;
}) {
  const supplies = kit.supplies;
  const pricing = kit.suggestedPricing;
  const [checkedSupplies, setCheckedSupplies] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<PrepTabId>("all");
  /** Show All: missing key = expanded. Explicit `false` collapses a section. */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const ownedByAfterTabs = new Set(afterTabsOwnsPanel ?? []);

  useEffect(() => {
    if (!focusSignal?.tab) return;
    setActiveTab(focusSignal.tab);
  }, [focusSignal?.nonce, focusSignal?.tab]);

  useEffect(() => {
    // Reset only when switching guides — not when parent recreates the kit object each render.
    setOpenSections({});
    if (expandAllSections) setActiveTab("all");
  }, [guideId, expandAllSections]);

  const tabs = useMemo((): PrepTab[] => {
    const realityCheck =
      guideId === "food-delivery" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {FOOD_DELIVERY_REALITY_CHECK.title}
          </strong>
          <p>{FOOD_DELIVERY_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "estate-sale-listing-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {ESTATE_SALE_REALITY_CHECK.title}
          </strong>
          <p>{ESTATE_SALE_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "family-history-organizer" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {GENEALOGY_REALITY_CHECK.title}
          </strong>
          <p>{GENEALOGY_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "kids-party-game-host" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_PARTY_GAME_HOST_REALITY_CHECK.title}
          </strong>
          <p>{KIDS_PARTY_GAME_HOST_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "lead-followup-assistant" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {LEAD_FOLLOWUP_REALITY_CHECK.title}
          </strong>
          <p>{LEAD_FOLLOWUP_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "appointment-setter" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {APPOINTMENT_SETTER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{APPOINTMENT_SETTER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "online-research-assistant" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "mothers-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {MOTHERS_HELPER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{MOTHERS_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "babysitting" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {BABYSITTING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{BABYSITTING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "digital-products" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {DIGITAL_PRODUCTS_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{DIGITAL_PRODUCTS_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "rideshare" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {RIDESHARE_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{RIDESHARE_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "local-event-content-creator" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {LOCAL_EVENT_CONTENT_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{LOCAL_EVENT_CONTENT_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "property-mgmt" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {PROPERTY_MGMT_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{PROPERTY_MGMT_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "airbnb-turnover-checker" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {AIRBNB_TURNOVER_CHECKER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{AIRBNB_TURNOVER_CHECKER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "junior-reinvest-ceo" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {JUNIOR_REINVEST_CEO_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{JUNIOR_REINVEST_CEO_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "kids-reinvest-jar" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_REINVEST_JAR_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{KIDS_REINVEST_JAR_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "local-content-photographer" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {LOCAL_CONTENT_PHOTO_REALITY_CHECK.title}
          </strong>
          <p>{LOCAL_CONTENT_PHOTO_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "personal-shopper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {PERSONAL_SHOPPER_REALITY_CHECK.title}
          </strong>
          <p>{PERSONAL_SHOPPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "youth-sports-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {YOUTH_SPORTS_HELPER_REALITY_CHECK.title}
          </strong>
          <p>{YOUTH_SPORTS_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "junior-give-back-teach" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK.title}
          </strong>
          <p>{JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "kids-kindness-share" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_KINDNESS_SHARE_REALITY_CHECK.title}
          </strong>
          <p>{KIDS_KINDNESS_SHARE_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "kids-piggy-first-goal" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_PIGGY_FIRST_GOAL_REALITY_CHECK.title}
          </strong>
          <p>{KIDS_PIGGY_FIRST_GOAL_REALITY_CHECK.body}</p>
        </aside>
      ) : null;

    const list: PrepTab[] = [
      {
        id: "prereqs",
        label: "Prerequisites",
        panelClass: "gysh-section-panel--prereqs",
        testId: `${testIdPrefix}-prerequisites`,
        content: (
          <>
            {realityCheck}
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
        label: pricing.tabLabel?.trim() || "Suggested Pricing",
        panelClass: "gysh-section-panel--pricing",
        testId: `${testIdPrefix}-pricing`,
        content: (
          <>
            <p className="gysh-section-panel__lede">{pricingDisclaimer()}</p>
            {pricing.intro ? (
              <div
                className="gysh-section-panel__intro"
                data-testid={`${testIdPrefix}-pricing-intro`}
              >
                {pricing.intro.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : null}
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
          {guideId === "estate-sale-listing-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {estateSaleToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "family-history-organizer" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {genealogyToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-party-game-host" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsPartyGameHostToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "lead-followup-assistant" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {leadFollowupToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "appointment-setter" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {appointmentSetterToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "online-research-assistant" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {onlineResearchAssistantToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "mothers-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {mothersHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "babysitting" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {babysittingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "digital-products" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {digitalProductsToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "rideshare" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {rideshareToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "local-event-content-creator" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {localEventContentToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "property-mgmt" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {propertyMgmtToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "airbnb-turnover-checker" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {airbnbTurnoverCheckerToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "junior-reinvest-ceo" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {juniorReinvestCeoToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-reinvest-jar" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsReinvestJarToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "local-content-photographer" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {localContentPhotoToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "personal-shopper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {personalShopperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "youth-sports-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {youthSportsHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "junior-give-back-teach" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {juniorGiveBackTeachToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-kindness-share" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsKindnessShareToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-piggy-first-goal" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsPiggyFirstGoalToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : (
            <p className="gysh-section-panel__lede">
              {guideId === "food-delivery"
                ? deliveryDriverToolsDisclaimer()
                : guideToolsDisclaimer()}
            </p>
          )}
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

    if (notesTab) {
      list.push({
        id: "notes",
        label: "Notes",
        panelClass: "gysh-section-panel--notes",
        testId: `${testIdPrefix}-notes`,
        content: (
          <>
            {guideId === "food-delivery" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-delivery-worksheet`}
              >
                <summary>My Delivery Strategy worksheet</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {FOOD_DELIVERY_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you log weekly
                  results.
                </p>
              </details>
            ) : guideId === "estate-sale-listing-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-estate-sale-worksheet`}
              >
                <summary>Reseller Field Notebook</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {ESTATE_SALE_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you log finds and
                  lessons.
                </p>
              </details>
            ) : guideId === "family-history-organizer" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-genealogy-worksheet`}
              >
                <summary>Family History Research Notebook</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {GENEALOGY_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you log research.
                </p>
              </details>
            ) : guideId === "kids-party-game-host" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-party-host-worksheet`}
              >
                <summary>My Party Host Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_PARTY_GAME_HOST_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan parties.
                </p>
              </details>
            ) : guideId === "lead-followup-assistant" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-lead-followup-worksheet`}
              >
                <summary>Lead Follow-Up Client Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {LEAD_FOLLOWUP_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you manage clients.
                </p>
              </details>
            ) : guideId === "appointment-setter" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-appointment-setter-worksheet`}
              >
                <summary>My Appointment Setting Business</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {APPOINTMENT_SETTER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you manage bookings.
                </p>
              </details>
            ) : guideId === "online-research-assistant" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-online-research-worksheet`}
              >
                <summary>My Online Research Business</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {ONLINE_RESEARCH_ASSISTANT_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you run projects.
                </p>
              </details>
            ) : guideId === "mothers-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-mothers-helper-worksheet`}
              >
                <summary>My Mother's Helper Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {MOTHERS_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan jobs.
                </p>
              </details>
            ) : guideId === "babysitting" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-babysitting-worksheet`}
              >
                <summary>My Babysitting Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {BABYSITTING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan sits.
                </p>
              </details>
            ) : guideId === "digital-products" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-digital-products-worksheet`}
              >
                <summary>My Digital Product Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {DIGITAL_PRODUCTS_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you launch.
                </p>
              </details>
            ) : guideId === "rideshare" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-rideshare-worksheet`}
              >
                <summary>My Rideshare Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {RIDESHARE_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you log shifts.
                </p>
              </details>
            ) : guideId === "local-event-content-creator" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-local-event-worksheet`}
              >
                <summary>My Local Event Content Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {LOCAL_EVENT_CONTENT_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan events.
                </p>
              </details>
            ) : guideId === "property-mgmt" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-property-mgmt-worksheet`}
              >
                <summary>My Property Management Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {PROPERTY_MGMT_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you manage properties.
                </p>
              </details>
            ) : guideId === "airbnb-turnover-checker" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-turnover-checker-worksheet`}
              >
                <summary>My Airbnb Turnover Checker Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {AIRBNB_TURNOVER_CHECKER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below. Never store access codes in public notes.
                </p>
              </details>
            ) : guideId === "junior-reinvest-ceo" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-junior-reinvest-worksheet`}
              >
                <summary>My CEO Money Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {JUNIOR_REINVEST_CEO_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you split earnings.
                </p>
              </details>
            ) : guideId === "kids-reinvest-jar" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-kids-reinvest-worksheet`}
              >
                <summary>My Grow-Your-Hustle Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_REINVEST_JAR_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you split coins.
                </p>
              </details>
            ) : guideId === "local-content-photographer" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-content-photo-worksheet`}
              >
                <summary>Content Shoot Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {LOCAL_CONTENT_PHOTO_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan shoots.
                </p>
              </details>
            ) : guideId === "personal-shopper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-personal-shopper-worksheet`}
              >
                <summary>Personal Shopper Client Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {PERSONAL_SHOPPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you shop.
                </p>
              </details>
            ) : guideId === "youth-sports-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-youth-sports-helper-worksheet`}
              >
                <summary>Practice Helper Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {YOUTH_SPORTS_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you help at practice.
                </p>
              </details>
            ) : guideId === "junior-give-back-teach" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-junior-give-back-worksheet`}
              >
                <summary>My Give-Back Teaching Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {JUNIOR_GIVE_BACK_TEACH_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan your session.
                </p>
              </details>
            ) : guideId === "kids-kindness-share" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-kids-kindness-worksheet`}
              >
                <summary>My Give-Back Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_KINDNESS_SHARE_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you help.
                </p>
              </details>
            ) : guideId === "kids-piggy-first-goal" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-kids-piggy-worksheet`}
              >
                <summary>My First Savings Goal</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_PIGGY_FIRST_GOAL_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you save.
                </p>
              </details>
            ) : null}
            {notesTab.content}
          </>
        ),
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
  }, [kit, pricing, supplies, checkedSupplies, testIdPrefix, stepsTab, calculatorTab, notesTab, guideId]);

  const sectionTabs = tabs.filter((t) => t.id !== "all");
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const showAll = activeTab === "all";
  const afterTabsNode =
    typeof afterTabs === "function" ? afterTabs(activeTab) : afterTabs;

  const selectTab = (id: PrepTabId) => {
    setActiveTab(id);
    // When jumping to a section from Show All, keep that section expanded if we return later.
    if (id !== "all") {
      setOpenSections((prev) => ({ ...prev, [id]: true }));
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      // Default is open; first click collapses.
      ...prev,
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
            onClick={() => selectTab(tab.id)}
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
            const open = expandAllSections ? openSections[tab.id] !== false : openSections[tab.id] !== false;
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
      ) : ownedByAfterTabs.has(active.id) ? null : (
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

      {afterTabsNode}
    </div>
  );
}
