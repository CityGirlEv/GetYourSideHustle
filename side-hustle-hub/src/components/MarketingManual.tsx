import { useMemo, useState } from "react";
import { ArrowRight, Download, Sparkles } from "lucide-react";
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
import { downloadMarketingGuidePdf } from "../lib/user-guide-pdf";
import { GuideChecklist, GuideToc } from "./admin/GuideChecklist";

const HERO_BY_GUIDE: Record<MarketingGuideId, string> = {
  adult: adultHero,
  kids: kidsHero,
  teens: teensHero,
  seniors: seniorHero,
  master: masterHero,
};

type ImageKey = "hero" | "secondary" | "membership" | "community";

const IMAGE_CAPTIONS: Record<ImageKey, string> = {
  hero: "Match Wizard — age-right questions, ranked Side Hustles you can start.",
  secondary: "Product snapshot — the GYSH experience for this audience.",
  membership: "Membership ladder — Free through Elite with clear consulting time.",
  community: "Community & Workshops — momentum after the first match.",
};

function resolveImage(guideId: MarketingGuideId, key?: ImageKey): string | undefined {
  if (!key) return undefined;
  if (key === "hero" || key === "secondary") return HERO_BY_GUIDE[guideId];
  if (key === "membership") return membershipHero;
  if (key === "community") return communityHero;
  return undefined;
}

function figureAlign(sectionIndex: number, imageIndex: number): "left" | "right" {
  return (sectionIndex + imageIndex) % 2 === 0 ? "right" : "left";
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
}: {
  src: string;
  caption: string;
  align: "left" | "right";
  priority?: boolean;
}) {
  return (
    <figure className={`manual-figure manual-figure--${align}`}>
      <div className="manual-figure__frame">
        <img
          src={src}
          alt=""
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
  const showInlineFigure = Boolean(img && (hasProse || section.intro || section.kind === "perks" || section.kind === "cta"));

  return (
    <div className={`manual-section__body${showInlineFigure ? " has-figure" : ""}`}>
      {showInlineFigure && img && caption && (
        <ManualFigure src={img} caption={caption} align={align} />
      )}
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
      <div className="manual-clear" />
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
  const [pdfBusy, setPdfBusy] = useState(false);
  const cover = HERO_BY_GUIDE[guideId];

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

  const handlePdf = async () => {
    setPdfBusy(true);
    try {
      await downloadMarketingGuidePdf(guideId, {
        hero: cover,
        membership: membershipHero,
        community: communityHero,
      });
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
              <Download size={16} /> {pdfBusy ? "Building PDF…" : "Download PDF"}
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

      <GuideToc
        entries={toc.map((e) => ({
          id: e.id,
          label: `${e.number}. ${e.label}`,
        }))}
      />

      {doc.sections.map((section, sectionIndex) => {
        const img = resolveImage(guideId, section.imageKey);
        const caption = section.imageKey ? IMAGE_CAPTIONS[section.imageKey] : undefined;
        const ord = imageOrdinal.get(section.id) ?? 0;
        const align = figureAlign(sectionIndex, ord);

        return (
          <section
            key={section.id}
            className="manual-section"
            id={`guide-${section.id}`}
          >
            <h3 className="manual-section__title">
              <span className="manual-section__num">{section.number}</span>
              {section.title}
            </h3>

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
          </section>
        );
      })}
    </article>
  );
}
