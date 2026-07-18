import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Heart,
  Smile,
  Users,
} from "lucide-react";
import matchFinderWizardHero from "../assets/match-finder-wizard-hero.png";

type FindMineWizardSelectorProps = {
  onKids: () => void;
  onJunior: () => void;
  onAdult: () => void;
  onSenior: () => void;
};

/** Shared labels — keep in sync for UI + Vitest. */
export const FIND_MINE_WIZARD_GROUPS = [
  {
    id: "kids",
    label: "Kids",
    ages: "Ages 4–12",
    bands: "Matches for ages 4–8 and 9–12",
    title: "GYSH Kids Match Wizard",
    copy:
      "Parent-guided, safe first Side Hustles. Parents become GYSH Coaches — and parental consent is required through age 12.",
    icon: Smile,
    accent: "pink",
  },
  {
    id: "junior",
    label: "Teens",
    ages: "Ages 13–17",
    bands: "Matches for ages 13–14 and 15–17",
    title: "GYSH Teens Match Wizard",
    copy:
      "Teen-ready skills and safe earning, with parents still in the coach seat. Questions scale up for middle and older teens.",
    icon: Users,
    accent: "emerald",
  },
  {
    id: "adult",
    label: "Adults",
    ages: "Ages 18–54",
    bands: "Budget, hours, strengths & goals",
    title: "GYSH Adults Match Wizard",
    copy:
      "Ranked matches from your time, budget, strengths, and goals — built for real adult schedules and launch plans.",
    icon: BriefcaseBusiness,
    accent: "purple",
  },
  {
    id: "senior",
    label: "Seniors",
    ages: "Ages 55+",
    bands: "Flexible pace for 55+",
    title: "GYSH Seniors Match Wizard",
    copy:
      "Flexible matches for retirees, second careers, and 55+ earners who want experience-friendly pacing.",
    icon: Heart,
    accent: "amber",
  },
] as const;

export const FIND_MINE_FAMILY_LEAD =
  "GYSH is a family adventure: four GYSH Match Wizards — Kids, Teens, Adult, and Senior — each with questions customized to that stage of life.";

export const FIND_MINE_FAMILY_TEASER =
  "Pick your age group — Kids, Teens, Adult, or Senior — and get matched for your stage of life.";

function AgeBubble({
  group,
  onClick,
}: {
  group: (typeof FIND_MINE_WIZARD_GROUPS)[number];
  onClick: () => void;
}) {
  const Icon = group.icon;
  return (
    <button
      type="button"
      className={`find-mine-age-bubble find-mine-age-bubble--${group.id}`}
      data-testid={`find-mine-card-${group.id}`}
      onClick={onClick}
      title={group.copy}
    >
      <span className={`glow-badge ${group.accent}`}>{group.ages}</span>
      <span className="find-mine-age-bubble__main">
        <span className="find-mine-selector-icon">
          <Icon size={18} aria-hidden />
        </span>
        <span className="find-mine-age-bubble__text">
          <strong>{group.label}</strong>
          <em>{group.bands}</em>
        </span>
        <span className="find-mine-age-bubble__go" aria-hidden>
          <ArrowRight size={16} />
        </span>
      </span>
    </button>
  );
}

export function FindMineWizardSelector({
  onKids,
  onJunior,
  onAdult,
  onSenior,
}: FindMineWizardSelectorProps) {
  const [descOpen, setDescOpen] = useState(false);
  const handlers = {
    kids: onKids,
    junior: onJunior,
    adult: onAdult,
    senior: onSenior,
  };
  return (
    <div className="find-mine-selector" data-testid="find-mine-selector">
      <section className="find-mine-promo" aria-label="GYSH Match Wizard">
        <div className="find-mine-promo__hero find-mine-promo__hero--split">
          <div className="find-mine-promo__frame">
            <img
              src={matchFinderWizardHero}
              alt="GYSH Match Wizard — smart matches for Kids, Teens, Adults, and Seniors. Family fun, real skills, your future."
              className="find-mine-promo__img"
              width={1600}
              height={900}
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <aside className="find-mine-promo__side" aria-label="Choose a GYSH Match Wizard">
            <div className="find-mine-promo__side-top">
              <p data-testid="find-mine-selector-lead" className="find-mine-promo__lead find-mine-promo__teaser">
                {FIND_MINE_FAMILY_TEASER}
              </p>

              <button
                type="button"
                className="find-mine-promo__more-btn"
                aria-expanded={descOpen}
                aria-controls="find-mine-description"
                data-testid="find-mine-desc-toggle"
                onClick={() => setDescOpen((o) => !o)}
              >
                {descOpen ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
                {descOpen ? "Hide details" : "More about GYSH Match Wizard"}
              </button>

              {descOpen && (
                <div id="find-mine-description" className="find-mine-promo__details" data-testid="find-mine-description">
                  <p className="find-mine-promo__lead">{FIND_MINE_FAMILY_LEAD}</p>
                  <ol className="find-mine-promo__family-points">
                    <li>
                      <strong>Kids (4–12):</strong> we match ages <strong>4–8</strong> and{" "}
                      <strong>9–12</strong>. Parents become <strong>GYSH Coaches</strong>; parental
                      consent is required through age 12.
                    </li>
                    <li>
                      <strong>Teens (13–17):</strong> we match ages <strong>13–14</strong> and{" "}
                      <strong>15–17</strong> with bigger skills and safer independence — still coach-
                      friendly for parents.
                    </li>
                    <li>
                      <strong>Adult &amp; Senior:</strong> questions focus on budget, hours, strengths,
                      and pace so every generation finds a fit you can try together or on your own.
                    </li>
                  </ol>
                  <p className="find-mine-promo__family-note" data-testid="find-mine-family-note">
                    Make it a family night: kids and teens take their wizards with a GYSH Coach nearby, while
                    adults and seniors run theirs for career, retirement, or second-act ideas — then compare
                    matches and cheer each other on.
                  </p>
                </div>
              )}
            </div>

            <div
              className="find-mine-promo__age-bubbles"
              role="group"
              aria-label="GYSH Match Wizards by age"
            >
              {FIND_MINE_WIZARD_GROUPS.map((group) => (
                <AgeBubble key={group.id} group={group} onClick={handlers[group.id]} />
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
