import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Download, Sparkles } from "lucide-react";
import adultHero from "../assets/match-finder-adult-hero.png";
import kidsHero from "../assets/kids-find-my-hustle-hero.png";
import teensHero from "../assets/junior-find-my-side-hustle-hero.png";
import seniorHero from "../assets/senior-side-hustle-hero.png";
import masterHero from "../assets/guides-library-hero.png";
import membershipHero from "../assets/membership-hero.png";
import communityHero from "../assets/gysh-community-hero.png";
import {
  getMarketingGuide,
  marketingGuideToc,
  type MarketingGuideId,
  type MarketingSection,
} from "../lib/marketing-guides";
import { reservePdfTab } from "../lib/open-pdf";
import { downloadMarketingGuidePdf } from "../lib/user-guide-pdf";
import { GuideChecklist, GuideToc } from "./admin/GuideChecklist";

const HERO_BY_GUIDE: Record<MarketingGuideId, string> = {
  adult: adultHero,
  kids: kidsHero,
  teens: teensHero,
  seniors: seniorHero,
  master: masterHero,
};

type ImageKey = "hero" | "secondary" | "membership" | "community" | "guides";

const IMAGE_CAPTIONS: Record<ImageKey, string> = {
  hero: "Match Wizard — age-appropriate questions, ranked Side Hustles you can start.",
  secondary: "Product snapshot — the GYSH experience for this audience.",
  membership: "Membership ladder — Free through Elite with clear consulting time.",
  community: "Community & Workshops — momentum after the first match.",
  guides: "Launch Guides library — real steps, costs, and next actions for every hustle.",
};

function resolveImage(guideId: MarketingGuideId, key?: ImageKey): string | undefined {
  if (!key) return undefined;
  if (key === "hero" || key === "secondary") return HERO_BY_GUIDE[guideId];
  if (key === "membership") return membershipHero;
  if (key === "community") return communityHero;
  if (key === "guides") return masterHero;
  return undefined;
}

function figureAlign(sectionIndex: number, imageIndex: number): "left" | "right" {
  return (sectionIndex + imageIndex) % 2 === 0 ? "right" : "left";
}

function allClosedMap(ids: string[]): Record<string, boolean> {
  return Object.fromEntries(ids.map((id) => [id, false]));
}

type MarketingManualProps = {
  guideId: MarketingGuideId;
  onBack?: () => void;
  onGoToJoin?: () => void;
  onOpenMatchWizard?: () => void;
};

function ManualFigure({
  src,
  caption,
  align,
  priority,
  variant = "inline",
}: {
  src: string;
  caption: string;
  align: "left" | "right";
  priority?: boolean;
  /** masthead = large lead art; inline = wraps with section copy */
  variant?: "inline" | "masthead";
}) {
  return (
    <figure
      className={`manual-figure manual-figure--${align}${variant === "masthead" ? " manual-figure--masthead" : ""}`}
    >
      <div className="manual-figure__frame">
        <img
          src={src}
          alt={caption}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function SectionBody({
  section,
  img,
  caption,
  align,
}: {
  section: MarketingSection;
  img?: string;
  caption?: string;
  align: "left" | "right";
}) {
  const hasProse = Boolean(section.prose?.length);
  const showInlineFigure = Boolean(
    img && (hasProse || section.intro || section.kind === "perks" || section.kind === "cta"),
  );

  return (
    <div
      className={`manual-section__body${showInlineFigure ? ` has-figure has-figure--${align}` : ""}`}
    >
      {showInlineFigure && img && caption && (
        <ManualFigure src={img} caption={caption} align={align} />
      )}
      <div className="manual-section__copy">
        {section.intro && <p className="manual-lede">{section.intro}</p>}
        {section.kind === "prose" && section.prose && (
          <div className="manual-prose">
            {section.prose.map((p, i) => (
              <p key={`${section.id}-p-${i}`}>{p}</p>
            ))}
          </div>
        )}
        {section.callout && (
          <aside className="manual-callout">
            <strong>{section.callout.title}</strong>
            <span>{section.callout.body}</span>
          </aside>
        )}
      </div>
    </div>
  );
}

export function MarketingManual({
  guideId,
  onBack,
  onGoToJoin,
  onOpenMatchWizard,
}: MarketingManualProps) {
  const doc = getMarketingGuide(guideId);
  const toc = marketingGuideToc(doc);
  const sectionIds = useMemo(() => doc.sections.map((s) => s.id), [doc.sections]);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    allClosedMap(sectionIds),
  );
  const cover = HERO_BY_GUIDE[guideId];

  useEffect(() => {
    setOpenSections(allClosedMap(sectionIds));
  }, [guideId, sectionIds]);

  const imageOrdinal = useMemo(() => {
    let n = 0;
    const map = new Map<string, number>();
    doc.sections.forEach((s) => {
      if (s.imageKey) {
        map.set(s.id, n);
        n += 1;
      }
    });
    return map;
  }, [doc.sections]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: true }));
  };

  const expandAll = () => {
    setOpenSections(Object.fromEntries(sectionIds.map((id) => [id, true])));
  };

  const collapseAll = () => {
    setOpenSections(Object.fromEntries(sectionIds.map((id) => [id, false])));
  };

  const handlePdf = async () => {
    // Must open the tab in the click turn — after await, blob tabs often ERR_FILE_NOT_FOUND.
    const tab = reservePdfTab();
    setPdfBusy(true);
    try {
      await downloadMarketingGuidePdf(
        guideId,
        {
          hero: cover,
          membership: membershipHero,
          community: communityHero,
          // Prefer the lighter library hero — the bookshelf fill can stall PDF open.
          guides: masterHero,
        },
        tab,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "PDF failed to generate.";
      try {
        if (tab && !tab.closed) {
          tab.document.open();
          tab.document.write(
            `<!doctype html><title>PDF error</title><body style="font-family:system-ui;padding:2rem">
              <h1>Couldn’t open PDF</h1><p>${message}</p>
              <p>Close this tab and try Open PDF again. If it keeps failing, allow pop-ups for this site.</p>
            </body>`,
          );
          tab.document.close();
        } else {
          tab?.close();
          window.alert(`Couldn’t open PDF: ${message}`);
        }
      } catch {
        tab?.close();
        window.alert(`Couldn’t open PDF: ${message}`);
      }
      console.error("[GYSH] marketing PDF failed", err);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <article className="manual marketing-manual" data-testid={`marketing-manual-${guideId}`}>
      <header className="manual-masthead">
        <ManualFigure
          src={cover}
          caption={IMAGE_CAPTIONS.hero}
          align="left"
          variant="masthead"
          priority
        />
        <div className="manual-masthead__copy">
          <p className="manual-eyebrow">
            <Sparkles size={14} aria-hidden /> {doc.eyebrow}
          </p>
          <span className="glow-badge free">{doc.audienceBadge}</span>
          <h2 className="manual-title">{doc.title}</h2>
          <p className="manual-tagline">{doc.tagline}</p>
          <p className="manual-lead">{doc.lead}</p>
          <div className="manual-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void handlePdf()}
              disabled={pdfBusy}
              data-testid={`marketing-guide-pdf-${guideId}`}
            >
              <Download size={16} /> {pdfBusy ? "Opening PDF…" : "Open PDF"}
            </button>
            {onOpenMatchWizard && (
              <button type="button" className="btn btn-outline" onClick={onOpenMatchWizard}>
                Open Match Wizard
              </button>
            )}
            {onGoToJoin && (
              <button type="button" className="btn btn-outline" onClick={onGoToJoin}>
                Join GYSH
              </button>
            )}
            {onBack && (
              <button type="button" className="btn btn-outline" onClick={onBack}>
                Back to Guides
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="manual-section-controls" role="group" aria-label="Section expand controls">
        <button
          type="button"
          className="btn btn-outline manual-section-controls__btn"
          onClick={expandAll}
          data-testid="marketing-manual-expand-all"
        >
          Expand all
        </button>
        <button
          type="button"
          className="btn btn-outline manual-section-controls__btn"
          onClick={collapseAll}
          data-testid="marketing-manual-collapse-all"
        >
          Collapse all
        </button>
      </div>

      <GuideToc entries={toc} onNavigate={expandSection} />

      {doc.sections.map((section, sectionIndex) => {
        const img = resolveImage(guideId, section.imageKey);
        const caption = section.imageKey ? IMAGE_CAPTIONS[section.imageKey] : undefined;
        const ord = imageOrdinal.get(section.id) ?? 0;
        const align = figureAlign(sectionIndex, ord);
        const open = openSections[section.id] === true;
        const panelId = `manual-panel-${guideId}-${section.id}`;

        return (
          <section
            key={section.id}
            className={`manual-section${open ? " is-open" : " is-collapsed"}`}
            id={`guide-${section.id}`}
          >
            <h3 className="manual-section__title">
              <button
                type="button"
                className="manual-section__toggle"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggleSection(section.id)}
                data-testid={`manual-section-toggle-${section.id}`}
              >
                {open ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
                <span className="manual-section__num">{section.number}</span>
                <span className="manual-section__label">{section.title}</span>
              </button>
            </h3>

            {open && (
              <div id={panelId} className="manual-section__panel">
                <SectionBody section={section} img={img} caption={caption} align={align} />

                {section.kind === "checklist" && section.items && (
                  <GuideChecklist guideId={`mkt-${guideId}-${section.id}`} items={section.items} />
                )}
                {section.kind === "journey" && section.journey && (
                  <ol className="manual-journey">
                    {section.journey.map((step, i) => (
                      <li key={step.id}>
                        <div className="manual-journey__card">
                          <span className="manual-journey__label">{step.label}</span>
                          <p>{step.detail}</p>
                        </div>
                        {i < section.journey!.length - 1 && (
                          <ArrowRight className="manual-journey__arrow" size={20} aria-hidden />
                        )}
                      </li>
                    ))}
                  </ol>
                )}
                {section.kind === "perks" && section.perks && (
                  <div className="manual-perks">
                    {section.perks.map((tier) => (
                      <article
                        key={tier.tierId}
                        className={`manual-perk${tier.tierId === "pro" ? " is-highlight" : ""}`}
                      >
                        <header>
                          <h4>{tier.name}</h4>
                          <span>{tier.priceLine}</span>
                        </header>
                        <GuideChecklist
                          guideId={`mkt-${guideId}-perk-${tier.tierId}`}
                          items={tier.bullets.map((text, i) => ({
                            id: `${tier.tierId}-${i}`,
                            text,
                          }))}
                        />
                      </article>
                    ))}
                  </div>
                )}
                {section.kind === "cta" && section.cta && (
                  <div className="manual-cta">
                    <h4>{section.cta.headline}</h4>
                    <p>{section.cta.body}</p>
                    <GuideChecklist
                      guideId={`mkt-${guideId}-cta`}
                      items={section.cta.bullets.map((text, i) => ({
                        id: `cta-${i}`,
                        text,
                      }))}
                    />
                    <div className="manual-actions">
                      {onOpenMatchWizard && (
                        <button type="button" className="btn btn-primary" onClick={onOpenMatchWizard}>
                          Start Match Wizard
                        </button>
                      )}
                      {onGoToJoin && (
                        <button type="button" className="btn btn-outline" onClick={onGoToJoin}>
                          View membership
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </article>
  );
}
