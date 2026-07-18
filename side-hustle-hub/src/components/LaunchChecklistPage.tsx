import { useEffect, useState } from "react";
import { BookOpen, Check, ClipboardList, Lock, LogIn, Unlock, UserPlus, ArrowRight } from "lucide-react";
import { SITE_NAME } from "../lib/site-config";
import {
  CHECKLIST_PHASE_LABELS,
  CHECKLIST_PREVIEW_COUNT,
  LAUNCH_CHECKLIST_ITEMS,
  type ChecklistItem,
  getChecklistPreview,
} from "../lib/launch-checklist";
import {
  getLaunchGuidePeekSections,
  type GuidePeek,
  type GuidePeekNav,
} from "../lib/launch-guide-peeks";
import { fetchMemberProgress, saveMemberProgress } from "../lib/gysh-member-progress";
import { ApiError } from "../lib/api";

type LaunchChecklistPageProps = {
  isLoggedIn: boolean;
  onGoToJoin: () => void;
  onGoToLogin: () => void;
  onOpenGuide: (nav: GuidePeekNav) => void;
};

export function LaunchChecklistPage({
  isLoggedIn,
  onGoToJoin,
  onGoToLogin,
  onOpenGuide,
}: LaunchChecklistPageProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [progressError, setProgressError] = useState("");
  const unlocked = isLoggedIn;
  const { visible, locked } = getChecklistPreview(LAUNCH_CHECKLIST_ITEMS);
  const shownItems = unlocked ? LAUNCH_CHECKLIST_ITEMS : visible;
  const guideSections = getLaunchGuidePeekSections();

  useEffect(() => {
    if (!unlocked) {
      setCompleted({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const payload = await fetchMemberProgress<Record<string, boolean>>("launch_checklist");
        if (!cancelled) setCompleted(payload ?? {});
      } catch (e) {
        if (!cancelled) {
          setProgressError(
            e instanceof ApiError ? e.message : "Could not load guide progress from the database.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  const toggle = (id: string) => {
    if (!unlocked) return;
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      void saveMemberProgress("launch_checklist", next).catch((e) => {
        setProgressError(
          e instanceof ApiError ? e.message : "Could not save guide progress to the database.",
        );
      });
      return next;
    });
  };

  const doneCount = LAUNCH_CHECKLIST_ITEMS.filter((item) => completed[item.id]).length;

  return (
    <div className="static-page launch-checklist-page" data-testid="launch-checklist-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">Member playbook</span>
        <h2>GYSH Side Hustle Guide</h2>
        <p>
          A practical launch sequence for {SITE_NAME} members — pick a pilot, protect your time and money,
          land early customers, then grow with numbers instead of guesswork.
        </p>
        {unlocked ? (
          <p className="launch-checklist-progress">
            <Unlock size={16} aria-hidden />
            {doneCount} of {LAUNCH_CHECKLIST_ITEMS.length} steps marked complete — saved to your member account
          </p>
        ) : (
          <p className="launch-checklist-teaser-note">
            <Lock size={16} aria-hidden />
            Preview below — the full guide unlocks when you sign in as a member.
          </p>
        )}
        {progressError && (
          <p style={{ marginTop: 8, color: "var(--crimson)", fontSize: "0.85rem" }}>{progressError}</p>
        )}
      </section>

      <section className="glass launch-checklist-panel" aria-label="Side hustle guide">
        <div className="launch-checklist-panel-head">
          <ClipboardList size={22} style={{ color: "var(--crimson)" }} aria-hidden />
          <div>
            <h3>{unlocked ? "Your launch steps" : "Guide preview"}</h3>
            <p>
              {unlocked
                ? "Check items off as you go. Progress syncs to the database when you are signed in."
                : `Showing ${CHECKLIST_PREVIEW_COUNT} of ${LAUNCH_CHECKLIST_ITEMS.length} steps.`}
            </p>
          </div>
          <span className={`glow-badge ${unlocked ? "emerald" : "pink"}`} style={{ fontSize: "0.65rem" }}>
            {unlocked ? "Members" : "Locked"}
          </span>
        </div>

        <ul className="launch-checklist-list">
          {shownItems.map((item, index) => (
            <ChecklistRow
              key={item.id}
              item={item}
              index={index}
              interactive={unlocked}
              completed={!!completed[item.id]}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </ul>

        {!unlocked && locked.length > 0 && (
          <div className="kids-guide-lock launch-checklist-lock">
            <div className="kids-guide-lock-overlay">
              <Lock size={20} />
              <strong>Members unlock the full guide</strong>
              <p>
                {locked.length} more step{locked.length === 1 ? "" : "s"} — pricing, legal basics, warm
                outreach, first deliveries, and reinvestment.
              </p>
              <div className="launch-checklist-cta-row">
                <button type="button" className="btn btn-primary" onClick={onGoToJoin} style={{ gap: 6 }}>
                  <UserPlus size={16} /> Join GYSH
                </button>
                <button type="button" className="btn btn-secondary" onClick={onGoToLogin} style={{ gap: 6 }}>
                  <LogIn size={16} /> Sign in
                </button>
              </div>
            </div>
            <ul className="launch-checklist-list launch-checklist-list--blurred" aria-hidden="true">
              {locked.map((item, i) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  index={CHECKLIST_PREVIEW_COUNT + i}
                  interactive={false}
                  completed={false}
                  onToggle={() => undefined}
                />
              ))}
            </ul>
          </div>
        )}
      </section>

      <section
        className="glass launch-checklist-guides"
        aria-label="Launch Guides sneak peeks"
        data-testid="launch-checklist-guides"
      >
        <div className="launch-checklist-panel-head">
          <BookOpen size={22} style={{ color: "var(--bronze)" }} aria-hidden />
          <div>
            <h3>Launch Guides</h3>
            <p>
              Organized sneak peeks by audience. Everyone can browse — open a guide for the full
              roadmap (member gating still applies where it does today).
            </p>
          </div>
        </div>

        <div className="launch-guide-peek-sections">
          {guideSections.map((section) => (
            <div
              key={section.id}
              className="launch-guide-peek-section"
              data-testid={`guide-peek-section-${section.id}`}
            >
              <header className="launch-guide-peek-section-head">
                <h4>{section.label}</h4>
                <p>{section.subtitle}</p>
              </header>
              <ul className="launch-guide-peek-list">
                {section.guides.map((guide) => (
                  <GuidePeekRow key={guide.id} guide={guide} onOpen={() => onOpenGuide(guide.nav)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GuidePeekRow({ guide, onOpen }: { guide: GuidePeek; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        className="launch-guide-peek-item"
        onClick={onOpen}
        data-testid={`guide-peek-${guide.id}`}
      >
        <span className="launch-guide-peek-item-text">
          <span className="launch-guide-peek-item-meta">
            {guide.memberGuide ? (
              <span className="flat-label flat-label--area">Member guide</span>
            ) : (
              <span className="flat-label flat-label--accent">Open</span>
            )}
          </span>
          <strong>{guide.title}</strong>
          <span className="launch-guide-peek-blurb">{guide.peek}</span>
        </span>
        <ArrowRight size={16} className="launch-guide-peek-arrow" aria-hidden />
      </button>
    </li>
  );
}

function ChecklistRow({
  item,
  index,
  interactive,
  completed,
  onToggle,
}: {
  item: ChecklistItem;
  index: number;
  interactive: boolean;
  completed: boolean;
  onToggle: () => void;
}) {
  const Tag = interactive ? "button" : "div";
  return (
    <li>
      <Tag
        type={interactive ? "button" : undefined}
        className={`checklist-item launch-checklist-item${completed ? " completed" : ""}`}
        onClick={interactive ? onToggle : undefined}
        aria-pressed={interactive ? completed : undefined}
      >
        <span className="checklist-checkbox" aria-hidden>
          {completed ? <Check size={12} /> : null}
        </span>
        <span className="checklist-text">
          <span className="launch-checklist-item-meta">
            <span className="flat-label flat-label--area">{CHECKLIST_PHASE_LABELS[item.phase]}</span>
            <span className="launch-checklist-step-num">Step {index + 1}</span>
          </span>
          <strong>{item.title}</strong>
          <span className="launch-checklist-item-desc">{item.description}</span>
        </span>
      </Tag>
    </li>
  );
}
