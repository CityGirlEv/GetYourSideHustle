import { Download } from "lucide-react";
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
import { downloadMemberUserGuidePdf } from "../../lib/user-guide-pdf";
import { GuideChecklist, GuideToc } from "./GuideChecklist";

const CHAPTERS = memberChapters({
  kids: kidsHero,
  teens: teensHero,
  adult: adultHero,
  senior: seniorHero,
});

export function MemberUserGuide() {
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
              onClick={() => void downloadMemberUserGuidePdf()}
              data-testid="member-guide-pdf"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
      </header>

      <GuideToc entries={MEMBER_TOC} />

      <section className="manual-section" id="guide-big-picture">
        <h3 className="manual-section__title">
          <span className="manual-section__num">1</span>
          The big picture
        </h3>
        <GuideChecklist guideId="member" items={MEMBER_BIG_PICTURE} />
      </section>

      <section className="manual-section" id="guide-age-chapters">
        <h3 className="manual-section__title">
          <span className="manual-section__num">2</span>
          Age chapters
        </h3>
        <div className="manual-chapters">
          {CHAPTERS.map((ch, i) => {
            const align = i % 2 === 0 ? "right" : "left";
            return (
              <section key={ch.id} className="manual-chapter" id={`guide-${ch.id}`}>
                <h4 className="manual-chapter__title">
                  <span className="manual-section__num">{ch.number}</span>
                  {ch.title}
                </h4>
                <div className={`manual-section__body has-figure`}>
                  <figure className={`manual-figure manual-figure--${align}`}>
                    <div className="manual-figure__frame">
                      <img src={ch.image} alt={ch.imageAlt} loading="lazy" decoding="async" />
                    </div>
                    <figcaption>{ch.imageAlt}</figcaption>
                  </figure>
                  <p className="manual-lede">{ch.ages}</p>
                  <GuideChecklist guideId={`member-${ch.id}`} items={ch.items} />
                  <div className="manual-clear" />
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="manual-section" id="guide-membership">
        <h3 className="manual-section__title">
          <span className="manual-section__num">3</span>
          Membership levels
        </h3>
        <GuideChecklist guideId="member-membership" items={MEMBER_MEMBERSHIP} />
        <p className="manual-footnote">
          Consulting rates are the same for Kids, Teens, Adults, and Seniors. Kids/Teens often pay with
          parent-funded GYSH credits.
        </p>
      </section>

      <section className="manual-section" id="guide-quick-start">
        <h3 className="manual-section__title">
          <span className="manual-section__num">4</span>
          Quick start
        </h3>
        <GuideChecklist guideId="member-quick-start" items={MEMBER_QUICK_START} />
      </section>
    </article>
  );
}
