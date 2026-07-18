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
    <article className="user-guide user-guide--member" data-testid="member-user-guide">
      <header className="user-guide__hero">
        <div className="user-guide__hero-text">
          <p className="user-guide__eyebrow">{MEMBER_GUIDE_META.eyebrow}</p>
          <h2>{MEMBER_GUIDE_META.title}</h2>
          <p className="user-guide__lead">{MEMBER_GUIDE_META.lead}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary user-guide__pdf-btn"
          onClick={() => downloadMemberUserGuidePdf()}
          data-testid="member-guide-pdf"
        >
          <Download size={16} /> Download PDF
        </button>
      </header>

      <GuideToc entries={MEMBER_TOC} />

      <section className="user-guide__section" id="guide-big-picture">
        <h3>1. The big picture</h3>
        <GuideChecklist guideId="member" items={MEMBER_BIG_PICTURE} />
      </section>

      <section className="user-guide__section" id="guide-age-chapters">
        <h3>2. Age chapters</h3>
        <div className="user-guide__chapters">
          {CHAPTERS.map((ch) => (
            <section key={ch.id} className="user-guide-chapter" id={`guide-${ch.id}`}>
              <div className="user-guide-chapter__media">
                <img src={ch.image} alt={ch.imageAlt} loading="lazy" decoding="async" />
              </div>
              <div className="user-guide-chapter__body">
                <span className="glow-badge free">{ch.ages}</span>
                <h4>{ch.title}</h4>
                <GuideChecklist guideId={`member-${ch.id}`} items={ch.items} />
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="user-guide__section" id="guide-membership">
        <h3>3. Membership levels</h3>
        <GuideChecklist guideId="member-membership" items={MEMBER_MEMBERSHIP} />
        <p className="user-guide__footnote">
          Consulting rates are the same for Kids, Teens, Adults, and Seniors. Kids/Teens often pay with
          parent-funded GYSH credits.
        </p>
      </section>

      <section className="user-guide__section" id="guide-quick-start">
        <h3>4. Quick start</h3>
        <GuideChecklist guideId="member-quick-start" items={MEMBER_QUICK_START} />
      </section>
    </article>
  );
}
