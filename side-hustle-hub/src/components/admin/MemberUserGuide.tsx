import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import kidsHero from "../../assets/kids-find-my-hustle-hero.png";
import teensHero from "../../assets/junior-find-my-side-hustle-hero.png";
import adultHero from "../../assets/match-finder-adult-hero.png";
import seniorHero from "../../assets/senior-side-hustle-hero.png";
import {
  MEMBER_BIG_PICTURE,
  MEMBER_GUIDE_META,
  MEMBER_MEMBERSHIP,
  MEMBER_QUICK_START,
  MEMBER_TOC,
  memberChapters,
} from "../../lib/user-guide-content";
import { reservePdfTab } from "../../lib/open-pdf";
import { downloadMemberUserGuidePdf } from "../../lib/user-guide-pdf";
import { GuideChecklist, GuideToc } from "./GuideChecklist";

const CHAPTERS = memberChapters({
  kids: kidsHero,
  teens: teensHero,
  adult: adultHero,
  senior: seniorHero,
});

const TOP_SECTION_IDS = ["big-picture", "age-chapters", "membership", "quick-start"] as const;

function allClosedMap(ids: readonly string[]): Record<string, boolean> {
  return Object.fromEntries(ids.map((id) => [id, false]));
}

export function MemberUserGuide() {
  const sectionIds = useMemo(
    () => [...TOP_SECTION_IDS, ...CHAPTERS.map((c) => c.id)],
    [],
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    allClosedMap(sectionIds),
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandSection = (id: string) => {
    setOpenSections((prev) => {
      const next = { ...prev, [id]: true };
      // Opening a chapter also opens the Age chapters parent.
      if (CHAPTERS.some((c) => c.id === id)) next["age-chapters"] = true;
      return next;
    });
  };

  const expandAll = () => {
    setOpenSections(Object.fromEntries(sectionIds.map((id) => [id, true])));
  };

  const collapseAll = () => {
    setOpenSections(Object.fromEntries(sectionIds.map((id) => [id, false])));
  };

  return (
    <article className="manual user-guide user-guide--member" data-testid="member-user-guide">
      <header className="manual-masthead manual-masthead--text-only">
        <div className="manual-masthead__copy">
          <p className="manual-eyebrow">{MEMBER_GUIDE_META.eyebrow}</p>
          <h2 className="manual-title">{MEMBER_GUIDE_META.title}</h2>
          <p className="manual-lead">{MEMBER_GUIDE_META.lead}</p>
          <div className="manual-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const tab = reservePdfTab();
                void downloadMemberUserGuidePdf(
                  {
                    kids: kidsHero,
                    teens: teensHero,
                    adult: adultHero,
                    senior: seniorHero,
                  },
                  tab,
                ).catch(() => tab?.close());
              }}
              data-testid="member-guide-pdf"
            >
              <Download size={16} /> Open PDF
            </button>
          </div>
        </div>
      </header>

      <div className="manual-toc-bar">
        <GuideToc entries={MEMBER_TOC} onNavigate={expandSection} />
        <div className="manual-toc-bar__actions manual-section-controls">
          <button
            type="button"
            className="btn btn-outline manual-toc-bar__btn"
            onClick={expandAll}
            data-testid="member-guide-expand-all"
          >
            Expand all
          </button>
          <button
            type="button"
            className="btn btn-outline manual-toc-bar__btn"
            onClick={collapseAll}
            data-testid="member-guide-collapse-all"
          >
            Collapse all
          </button>
        </div>
      </div>

      <section
        className={`manual-section${openSections["big-picture"] ? " is-open" : " is-collapsed"}`}
        id="guide-big-picture"
      >
        <h3 className="manual-section__title">
          <button
            type="button"
            className="manual-section__toggle"
            aria-expanded={!!openSections["big-picture"]}
            aria-controls="member-panel-big-picture"
            onClick={() => toggleSection("big-picture")}
          >
            {openSections["big-picture"] ? (
              <ChevronDown size={18} aria-hidden />
            ) : (
              <ChevronRight size={18} aria-hidden />
            )}
            <span className="manual-section__num">1</span>
            <span className="manual-section__label">The big picture</span>
          </button>
        </h3>
        {openSections["big-picture"] && (
          <div id="member-panel-big-picture" className="manual-section__panel">
            <GuideChecklist guideId="member" items={MEMBER_BIG_PICTURE} />
          </div>
        )}
      </section>

      <section
        className={`manual-section${openSections["age-chapters"] ? " is-open" : " is-collapsed"}`}
        id="guide-age-chapters"
      >
        <h3 className="manual-section__title">
          <button
            type="button"
            className="manual-section__toggle"
            aria-expanded={!!openSections["age-chapters"]}
            aria-controls="member-panel-age-chapters"
            onClick={() => toggleSection("age-chapters")}
          >
            {openSections["age-chapters"] ? (
              <ChevronDown size={18} aria-hidden />
            ) : (
              <ChevronRight size={18} aria-hidden />
            )}
            <span className="manual-section__num">2</span>
            <span className="manual-section__label">Age chapters</span>
          </button>
        </h3>
        {openSections["age-chapters"] && (
          <div id="member-panel-age-chapters" className="manual-section__panel">
            <div className="manual-chapters">
              {CHAPTERS.map((ch, i) => {
                const align = i % 2 === 0 ? "right" : "left";
                const open = openSections[ch.id] !== false;
                return (
                  <section
                    key={ch.id}
                    className={`manual-chapter${open ? " is-open" : " is-collapsed"}`}
                    id={`guide-${ch.id}`}
                  >
                    <h4 className="manual-chapter__title">
                      <button
                        type="button"
                        className="manual-section__toggle"
                        aria-expanded={open}
                        aria-controls={`member-panel-${ch.id}`}
                        onClick={() => toggleSection(ch.id)}
                      >
                        {open ? (
                          <ChevronDown size={16} aria-hidden />
                        ) : (
                          <ChevronRight size={16} aria-hidden />
                        )}
                        <span className="manual-section__num">{ch.number}</span>
                        <span className="manual-section__label">{ch.title}</span>
                      </button>
                    </h4>
                    {open && (
                      <div id={`member-panel-${ch.id}`} className="manual-section__panel">
                        <div className={`manual-section__body has-figure has-figure--${align}`}>
                          <figure className={`manual-figure manual-figure--${align}`}>
                            <div className="manual-figure__frame">
                              <img
                                src={ch.image}
                                alt={ch.imageAlt}
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <figcaption>{ch.imageAlt}</figcaption>
                          </figure>
                          <div className="manual-section__copy">
                            <p className="manual-lede">{ch.ages}</p>
                            <GuideChecklist guideId={`member-${ch.id}`} items={ch.items} />
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section
        className={`manual-section${openSections.membership ? " is-open" : " is-collapsed"}`}
        id="guide-membership"
      >
        <h3 className="manual-section__title">
          <button
            type="button"
            className="manual-section__toggle"
            aria-expanded={!!openSections.membership}
            aria-controls="member-panel-membership"
            onClick={() => toggleSection("membership")}
          >
            {openSections.membership ? (
              <ChevronDown size={18} aria-hidden />
            ) : (
              <ChevronRight size={18} aria-hidden />
            )}
            <span className="manual-section__num">3</span>
            <span className="manual-section__label">Membership levels</span>
          </button>
        </h3>
        {openSections.membership && (
          <div id="member-panel-membership" className="manual-section__panel">
            <GuideChecklist guideId="member-membership" items={MEMBER_MEMBERSHIP} />
            <p className="manual-footnote">
              Consulting rates are the same for Kids, Teens, Adults, and Seniors. Kids/Teens often pay
              with parent-funded GYSH credits.
            </p>
          </div>
        )}
      </section>

      <section
        className={`manual-section${openSections["quick-start"] ? " is-open" : " is-collapsed"}`}
        id="guide-quick-start"
      >
        <h3 className="manual-section__title">
          <button
            type="button"
            className="manual-section__toggle"
            aria-expanded={!!openSections["quick-start"]}
            aria-controls="member-panel-quick-start"
            onClick={() => toggleSection("quick-start")}
          >
            {openSections["quick-start"] ? (
              <ChevronDown size={18} aria-hidden />
            ) : (
              <ChevronRight size={18} aria-hidden />
            )}
            <span className="manual-section__num">4</span>
            <span className="manual-section__label">Quick start</span>
          </button>
        </h3>
        {openSections["quick-start"] && (
          <div id="member-panel-quick-start" className="manual-section__panel">
            <GuideChecklist guideId="member-quick-start" items={MEMBER_QUICK_START} />
          </div>
        )}
      </section>
    </article>
  );
}
