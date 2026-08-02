import React, { useEffect, useState } from "react";
import {
  Smile,
  ShieldAlert,
  Coins,
  Dog,
  BookOpen,
  Palette,
  Laptop,
  Gift,
  CirclePlay,
  ExternalLink,
  Sparkles,
  Star,
  Compass,
  ArrowLeft,
  ArrowRight,
  Clock,
  Trees,
  Heart,
  Users,
  Gamepad2,
  Lock,
  Unlock,
  BadgeCheck,
  BookMarked,
} from "lucide-react";
import {
  KEVINA_BIO,
  KEVINA_CHANNEL_HANDLE,
  KEVINA_CHANNEL_NAME,
  KEVINA_CHANNEL_URL,
  KEVINA_FEATURED_EPISODES,
  KEVINA_UPLOADS_PLAYLIST,
} from "../lib/kevina-starr";
import {
  getTeamJoinCopy,
  isKidsCornerMember,
  writeTeamMembership,
  type KidsAudience,
} from "../lib/kids-team";
import { guidesForAudience, themeLabel, type KidsGuide } from "../lib/kids-guides";
import {
  FREE_GUIDE_SIGNUP_NOTE,
  guideTierBadgeLabel,
  guideTierMembershipNote,
  kidsGuideMinTier,
  resolveGuideAccess,
} from "../lib/guide-access";
import { JoinToUnlockCta } from "./JoinToUnlockCta";
import { submitJuniorSignup } from "../lib/junior-signup";
import { saveMemberProgress } from "../lib/gysh-member-progress";
import { trackGyshEvent } from "../lib/gysh-analytics";
import { hasBlueprintAccess } from "../lib/free-member-session";
import {
  clearPendingBlueprint,
  peekPendingBlueprintFor,
  savePendingBlueprintAsync,
} from "../lib/pending-blueprint";
import { listSavedBlueprints, saveBlueprintToAccount, type SavedBlueprint } from "../lib/blueprints-api";
import { blueprintAgeGroupTitle, blueprintMatchLabel } from "../lib/blueprint-match-labels";
import { SideHustleBlueprintResults } from "./SideHustleBlueprintResults";
import { WizardStartHereBanner } from "./WizardStartHereBanner";
import juniorSideHustleTeam from "../assets/junior-side-hustle-team.png";
import juniorJoinTeamHero from "../assets/junior-join-team-hero.png";
import kidsJoinTeamHero from "../assets/kids-join-team-hero.png";
import juniorSideHustleHero from "../assets/junior-side-hustle-hero.png";
import kidsFindMyHustleHero from "../assets/kids-find-my-hustle-hero.png";
import juniorFindMySideHustleHero from "../assets/junior-find-my-side-hustle-hero.png";
import piggyBankSavingsHero from "../assets/piggy-bank-savings-hero.png";
import kidsHustleIdeasHero from "../assets/kids-hustle-ideas-hero.png";
import kidsGuidesHero from "../assets/kids-guides-hero.png";
import juniorGuidesHero from "../assets/junior-guides-hero.png";
import juniorMyBankHero from "../assets/junior-my-bank-hero.png";

interface JrHustle {
  id: string;
  name: string;
  desc: string;
  pay: string;
  difficulty: string;
  icon: React.ReactNode;
  safety: string;
  nextSteps: string[];
  /** Which Kids Corner audience list shows this card */
  audiences: ("kids" | "junior")[];
  /** Matching tags for the kids wizard */
  tags: {
    ages: ("young" | "mid" | "older")[];
    interests: ("animals" | "creative" | "outdoors" | "helping" | "tech" | "ai")[];
    place: ("outdoor" | "indoor" | "either")[];
    time: ("short" | "medium" | "long")[];
  };
}

type AudienceMode = KidsAudience;
import {
  JUNIOR_CORNER_TABS,
  KIDS_CORNER_TABS,
  type JuniorTab,
  type KidsTab,
} from "../lib/audience-nav";

type KidsCornerProps = {
  /** GYSH portal login — also unlocks member guides. */
  isLoggedIn?: boolean;
  /** Real signed-in account (loads assigned Blueprints even for parent coaches / admins). */
  hasAccountLogin?: boolean;
  /** Profile Switcher → Unlogged in User */
  previewAsGuest?: boolean;
  /** Account plan (free / starter / pro / elite). Team join without account → free. */
  membershipTier?: string | null;
  /** Navigate to Join with Kids or Teens membership lane selected. */
  onGoToJoin?: (audience: "kids" | "junior") => void;
  /** Open the dedicated Kids/Teens Dashboard (youth login). */
  onOpenDashboard?: () => void;
  /** Open the full Guides library. */
  onOpenGuidesLibrary?: () => void;
  /** Open Seniors guides / corner. */
  onOpenSeniors?: () => void;
  /** Deep-link from checklist / Match Wizard / Site Map entry points. */
  entryFocus?: {
    mode: AudienceMode;
    tab: "stories" | "wizard" | "jobs" | "piggy" | "guides" | "join";
  } | null;
};

const JR_HUSTLES: JrHustle[] = [
  {
    id: "dog-walk",
    name: "Neighborhood Dog Walker",
    desc: "Help out busy neighbors by taking their friendly dogs for fun outdoor walks around the neighborhood.",
    pay: "$10 – $20 / walk",
    difficulty: "Very Easy",
    icon: <Dog size={24} style={{ color: "var(--crimson)" }} />,
    safety: "Always walk dogs with an adult nearby. Keep them on a short leash and stick to familiar sidewalks.",
    nextSteps: [
      "Ask a parent which neighbors they trust.",
      "Practice walking a family pet first.",
      "Set a simple rate (e.g. $12 per walk) and a schedule.",
    ],
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["animals", "outdoors"],
      place: ["outdoor"],
      time: ["short", "medium"],
    },
  },
  {
    id: "yard-help",
    name: "Yard & Garden Helper",
    desc: "Help rake leaves, water flowers, pull weeds, or shovel snow — great for fresh air and pocket money.",
    pay: "$15 – $30 / yard",
    difficulty: "Easy",
    icon: <Gift size={24} style={{ color: "var(--accent-emerald)" }} />,
    safety: "Never use heavy power tools like lawnmowers alone. Ask an adult to show you how to use hand tools safely.",
    nextSteps: [
      "Offer to help a neighbor or grandparent with one small job.",
      "Wear gloves and sunscreen.",
      "Track earnings in the Piggy Bank tab.",
    ],
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["outdoors", "helping"],
      place: ["outdoor"],
      time: ["medium", "long"],
    },
  },
  {
    id: "crafts",
    name: "Creative Sticker & Keychain Crafting",
    desc: "Draw pictures, write fun quotes, or bake clay charms to sell to friends, family, or school fairs.",
    pay: "$1 – $5 / item",
    difficulty: "Medium",
    icon: <Palette size={24} style={{ color: "var(--crimson)" }} />,
    safety: "Ask a parent for help when baking clay in the oven or shipping sticker envelopes to customers.",
    nextSteps: [
      "Make a tiny sample set (5 stickers or 3 charms).",
      "Price each item with a parent.",
      "Share at a school fair, family table, or community board.",
    ],
    audiences: ["kids", "junior"],
    tags: {
      ages: ["young", "mid", "older"],
      interests: ["creative"],
      place: ["indoor", "either"],
      time: ["short", "medium", "long"],
    },
  },
  {
    id: "tech-helper",
    name: "Senior Tech Helper",
    desc: "Help grandparents or neighbors learn to send pictures, make video calls, or play simple online games.",
    pay: "$10 – $20 / hour",
    difficulty: "Easy",
    icon: <Laptop size={24} style={{ color: "#5c4033" }} />,
    safety: "Never share your own private codes or passwords, and only help neighbors that your parents know well.",
    nextSteps: [
      "Pick one skill to teach (e.g. FaceTime or photo sharing).",
      "Practice with a family member first.",
      "Offer 30-minute “tech buddy” sessions.",
    ],
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["tech", "helping"],
      place: ["indoor", "either"],
      time: ["short", "medium"],
    },
  },
  {
    id: "homework",
    name: "Homework Helper & Reader",
    desc: "Help younger kids practice reading, spelling, or easy math flashcards — patience pays!",
    pay: "$10 – $15 / hour",
    difficulty: "Medium",
    icon: <BookOpen size={24} style={{ color: "#6b4f3a" }} />,
    safety: "Host all study helper sessions in public spaces like the school library or with parents present.",
    nextSteps: [
      "Ask a parent to introduce you to a trusted family.",
      "Keep sessions short (20–30 minutes).",
      "Bring flashcards or a favorite easy reader.",
    ],
    audiences: ["kids", "junior"],
    tags: {
      ages: ["older"],
      interests: ["helping"],
      place: ["indoor", "either"],
      time: ["short", "medium"],
    },
  },
  {
    id: "book-publishing-kids",
    name: "Book Publishing (Storybooks)",
    desc: "Write and illustrate a short storybook — a Digital side hustle kids can do with a parent. Print copies for family, school fairs, or publish an ebook together (Amazon KDP with a guardian).",
    pay: "Gifts · fair sales · ebook royalties (parent-managed)",
    difficulty: "Medium",
    icon: <BookMarked size={24} style={{ color: "var(--crimson)" }} />,
    safety: "A parent or guardian must own any publishing account, payments, and online listings. Never share your real name, school, or photos with strangers.",
    nextSteps: [
      "Write a short story (one chapter or picture-book length) and sketch simple illustrations.",
      "Ask a parent to help format pages and print a family edition or school-fair copies.",
      "With a guardian, explore ebook publishing (KDP) — parents handle the account and money.",
    ],
    audiences: ["kids", "junior"],
    tags: {
      ages: ["young", "mid", "older"],
      interests: ["creative"],
      place: ["indoor", "either"],
      time: ["medium", "long"],
    },
  },
  {
    id: "create-games-kids",
    name: "Create Games with AI",
    desc: "Invent simple game ideas with a parent nearby — use kid-friendly AI tools for stories, characters, art, and level ideas. Share your creation at a school fair, family game night, or class project (not for strangers online).",
    pay: "School fair / family tips · or just for fun!",
    difficulty: "Easy",
    icon: <Gamepad2 size={24} style={{ color: "var(--crimson)" }} />,
    safety: "Always create with a parent nearby. Never share your real name, school, address, or photos with AI tools or strangers. Stick to parent-approved apps.",
    nextSteps: [
      "Brainstorm one tiny game idea together (maze, quiz, or choose-your-adventure).",
      "Ask a parent to help you use a safe AI tool for a story, character drawing, or level map.",
      "Playtest with family, then show it at a school fair or family night — track any tips in the Piggy Bank.",
    ],
    audiences: ["kids"],
    tags: {
      ages: ["young", "mid"],
      interests: ["creative", "tech", "ai"],
      place: ["indoor"],
      time: ["short", "medium", "long"],
    },
  },
  {
    id: "create-games-junior",
    name: "Create Games with AI",
    desc: "Use AI for game concepts, sprites, dialogue, and simple web or mobile prototypes — tools like Cursor or Antigravity can help you build. Publish a school project, itch.io demo, or portfolio piece (with parent/guardian approval).",
    pay: "Tips · school credit · itch.io / commissions ($0 – $200+)",
    difficulty: "Medium",
    icon: <Gamepad2 size={24} style={{ color: "var(--accent-emerald)" }} />,
    safety: "Use parent-approved accounts. Never share personal info, school details, or payment cards in chats. Get a guardian’s OK before publishing or taking paid work.",
    nextSteps: [
      "Pick a tiny scope: one-level platformer, quiz game, or visual novel scene.",
      "Use AI for concepts, sprite ideas, and dialogue — then build a simple prototype (web or mobile) with a coding helper like Cursor or Antigravity.",
      "Playtest with friends, then share as a school project or free itch.io demo with guardian approval.",
    ],
    audiences: ["junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["creative", "tech", "ai"],
      place: ["indoor"],
      time: ["medium", "long"],
    },
  },
];

function hustlesForMode(mode: AudienceMode): JrHustle[] {
  return JR_HUSTLES.filter((h) => h.audiences.includes(mode));
}

function SafetyCallout() {
  return (
    <div className="kids-safety-callout">
      <ShieldAlert size={20} style={{ color: "var(--crimson)", flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong>Parents &amp; safety first:</strong> Before starting any hustle, talk it over at home.
        Never go into anyone&apos;s house alone, never share private details, and keep schoolwork first.
      </div>
    </div>
  );
}

function KidsStoriesTab() {
  const [activeVideo, setActiveVideo] = useState(KEVINA_FEATURED_EPISODES[0].videoId);
  const activeEpisode =
    KEVINA_FEATURED_EPISODES.find((e) => e.videoId === activeVideo) ?? KEVINA_FEATURED_EPISODES[0];

  return (
    <div className="kids-earth-stage">
      <section className="kids-kevina-hero">
        <div className="kids-kevina-inline">
          <div className="kids-video-pane">
            <span className="glow-badge pink" style={{ marginBottom: 12 }}>
              <Star size={12} /> Meet Kevina Starr
            </span>
            <div className="kids-video-frame">
              <iframe
                title="Kevina Starr Stories"
                src={`https://www.youtube.com/embed/${activeVideo}?rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="kids-video-caption">
              Now playing: <strong>{activeEpisode.title}</strong>
              {" · "}
              <a
                href={`https://www.youtube.com/playlist?list=${KEVINA_UPLOADS_PLAYLIST}`}
                target="_blank"
                rel="noreferrer"
              >
                Full uploads playlist
              </a>
            </p>
          </div>

          <div className="glass kids-about-pane">
            <h2>
              <Sparkles size={22} /> About Kevina
            </h2>
            <p className="kids-channel-line">
              Powered by <strong>{KEVINA_CHANNEL_NAME}</strong> ({KEVINA_CHANNEL_HANDLE})
            </p>
            <p className="kids-bio">{KEVINA_BIO}</p>
            <div className="kids-hero-actions">
              <a
                href={KEVINA_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: "none" }}
              >
                <CirclePlay size={16} /> Subscribe on YouTube
              </a>
              <a
                href={`${KEVINA_CHANNEL_URL}/videos`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ textDecoration: "none" }}
              >
                <ExternalLink size={16} /> Watch all stories
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="kids-stories-block" id="kids-featured-stories" data-testid="kids-featured-stories">
        <div className="kids-stories-head">
          <h3>Featured Stories</h3>
          <p>Pick a story — the player above updates instantly.</p>
        </div>
        <div className="kids-stories-grid">
          {KEVINA_FEATURED_EPISODES.map((ep) => {
            const selected = ep.videoId === activeVideo;
            return (
              <button
                key={ep.videoId}
                type="button"
                onClick={() => setActiveVideo(ep.videoId)}
                className={`kids-story-card ${selected ? "is-selected" : ""}`}
              >
                <img
                  className="kids-story-thumb"
                  src={`https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`}
                  alt={`${ep.title} — Kevina Starr story thumbnail`}
                  aria-hidden="true"
                  loading="lazy"
                />
                <div className="kids-story-body">
                  <span className="glow-badge cyan" style={{ fontSize: "0.9375rem" }}>
                    {ep.theme}
                  </span>
                  <strong>{ep.title}</strong>
                  <p>{ep.hustleLesson}</p>
                  <span className="kids-try-this">Try this: {ep.activity}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="kids-spark-note glass">
          <h4>Glow Getter → Side Hustle Spark</h4>
          <p>
            After story time, open the <strong>GYSH Match Wizard</strong> to discover a safe kid job,
            browse <strong>Hustle Ideas</strong> for fun ways to earn, or set a goal in the{" "}
            <strong>Piggy Bank</strong>.
          </p>
        </div>
      </section>
    </div>
  );
}

function JuniorTeamImage({
  className,
  src = juniorSideHustleTeam,
  alt = "Teens Side Hustle Team — Join the Teens GYSH Team today! Young minds, big ideas, bright futures.",
}: {
  className?: string;
  src?: string;
  alt?: string;
}) {
  return (
    <div className={["junior-team-frame", className].filter(Boolean).join(" ")}>
      <img
        src={src}
        alt={alt}
        className="junior-team-img"
        decoding="async"
      />
    </div>
  );
}

function MatchFinderWizardHero({ mode = "kids" }: { mode?: AudienceMode }) {
  const isKids = mode === "kids";
  return (
    <div className="match-finder-wizard-hero">
      <img
        src={isKids ? kidsFindMyHustleHero : juniorFindMySideHustleHero}
        alt={
          isKids
            ? "GYSH Kids Match Wizard — Discover side jobs that match your skills, interests, and goals. Ages 4–12."
            : "GYSH Teens Match Wizard (ages 13–17) — Discover side hustles that match your interests, skills, and goals."
        }
        className="match-finder-wizard-hero-img"
        decoding="async"
      />
    </div>
  );
}

function JoinTeamTab({
  mode,
  isMember,
  isLoggedIn,
  onJoined,
  onGoToJoin,
  onOpenGuides,
}: {
  mode: AudienceMode;
  isMember: boolean;
  isLoggedIn: boolean;
  onJoined: () => void;
  onGoToJoin?: (audience: "kids" | "junior") => void;
  onOpenGuides: () => void;
}) {
  const copy = getTeamJoinCopy(mode);
  const [showModal, setShowModal] = useState(false);
  const [childName, setChildName] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signupResult, setSignupResult] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const closeModal = () => {
    setShowModal(false);
    setSignupResult(null);
    setChildName("");
    setChildEmail("");
    setParentEmail("");
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSignupResult(null);
    try {
      const res = await submitJuniorSignup({
        team: mode,
        childName: childName.trim(),
        childEmail: childEmail.trim(),
        ...(mode === "kids" ? { parentEmail: parentEmail.trim() } : {}),
      });
      setSignupResult({ kind: "success", message: res.message });
      // Kids: local preview until parent consents. Teens (13+): active immediately.
      writeTeamMembership(mode, true);
      if (isLoggedIn) {
        const kind = mode === "kids" ? "kids_team" : "junior_team";
        void saveMemberProgress(kind, { joined: true });
      }
      onJoined();
    } catch (err) {
      setSignupResult({
        kind: "error",
        message: err instanceof Error ? err.message : "Sign-up failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="kids-earth-stage">
      <section className="kids-join-hero">
        <div className="kids-join-layout">
          <div className="kids-join-media-pane">
            <span
              className={`glow-badge ${mode === "kids" ? "pink" : "emerald"}`}
              style={{ marginBottom: 10 }}
            >
              <Users size={12} /> {copy.teamName}
            </span>
            <JuniorTeamImage
              className="junior-team-frame--spotlight"
              src={mode === "junior" ? juniorJoinTeamHero : kidsJoinTeamHero}
              alt={
                mode === "kids"
                  ? "Kids Side Hustle Team — Join the Kids GYSH Team! Young minds, big ideas, bright futures. Meet Malik, Isabella, Ethan, Aaliyah, Kai, and Sophie."
                  : "Join GYSH Teens Side Hustle Team (ages 13–17) — grow your skills, earn money, build your future. Safe community, challenges, and member benefits."
              }
            />
            <p className="kids-video-caption">
              {mode === "kids"
                ? "Young minds, big ideas, bright futures — join the Kids Corner team and unlock the full journey."
                : "Grow your skills. Earn money. Build your future — join the Teens Side Hustle Team and unlock the full journey."}
            </p>
            <section
              className="glass kids-join-values kids-join-values--under-media"
              data-testid="kids-join-values"
            >
              <h3>{copy.valuesTitle}</h3>
              <div className="kids-join-values-grid">
                {copy.values.map((v) => (
                  <article key={v.title} className="kids-join-value-card">
                    <strong>{v.title}</strong>
                    <p>{v.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="glass kids-join-pane">
            <h2 className="kids-join-pane-title" data-testid="kids-join-pane-title">
              <BadgeCheck size={20} style={{ color: "var(--crimson)" }} aria-hidden />
              <span>{copy.headline}</span>
              <span
                className={`glow-badge ${mode === "kids" ? "pink" : "emerald"} kids-audience-age-badge`}
              >
                {copy.ages}
              </span>
            </h2>
            {!isMember ? (
              <div className="kids-join-cta-row kids-join-cta-row--top" data-testid="kids-join-cta-row">
                <button
                  type="button"
                  className="btn btn-join-green"
                  onClick={() => {
                    if (onGoToJoin) {
                      onGoToJoin(mode === "junior" ? "junior" : "kids");
                      return;
                    }
                    setShowModal(true);
                  }}
                  style={{ gap: 6 }}
                  data-testid="kids-join-cta-btn"
                >
                  <BadgeCheck size={16} /> {copy.ctaLabel}
                </button>
              </div>
            ) : (
              <p className="kids-member-banner" data-testid="kids-join-member-banner">
                <Unlock size={16} /> You&apos;re on the <strong>{copy.teamName}</strong> — member
                guides are unlocked.
              </p>
            )}
            <p className="kids-join-pane-lead">{copy.lead}</p>
            <p className="kids-join-parent-note">{copy.parentNote}</p>
            <h3 className="kids-join-perks-heading">
              <Sparkles size={18} /> Team perks
            </h3>
            <ul className="kids-perk-list kids-perk-list--inline">
              {copy.perks.map((p) => (
                <li key={p.title} className="kids-perk-item kids-perk-item--inline">
                  <BadgeCheck size={14} aria-hidden="true" />
                  <strong>{p.title}</strong>
                  <span>{p.detail}</span>
                </li>
              ))}
            </ul>
            <div className="kids-join-cta-row kids-join-cta-row--bottom" data-testid="kids-join-browse-row">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onOpenGuides}
                style={{ gap: 6 }}
                data-testid="kids-join-browse-btn"
              >
                <BookMarked size={16} /> Browse member guides
              </button>
              {onGoToJoin && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => onGoToJoin(mode === "junior" ? "junior" : "kids")}
                  style={{ gap: 6 }}
                >
                  <Users size={16} /> Full GYSH Join page
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <SafetyCallout />

      {showModal && (
        <div className="kids-join-modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="kids-join-modal glass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kids-join-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="kids-join-modal-title">Join {copy.teamName}</h3>

            {signupResult?.kind === "success" ? (
              <>
                <div className="kids-safety-callout" style={{ marginTop: 4 }}>
                  <BadgeCheck size={20} style={{ color: "var(--accent-emerald)", flexShrink: 0, marginTop: 2 }} />
                  <div>{signupResult.message}</div>
                </div>
                <div className="kids-join-modal-actions">
                  <button type="button" className="btn btn-primary" onClick={closeModal}>
                    Done
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={(e) => void submitSignup(e)}>
                {mode === "kids" ? (
                  <p>
                    Parental consent is required through age 12. Enter your first name and email, plus
                    your parent/guardian&apos;s email — we&apos;ll send them a permission link. Your
                    Kids team access activates once they approve.
                  </p>
                ) : (
                  <p>
                    Ages 13+ can join with your own email — parental consent is not required. Enter
                    your first name and email to activate Teens team access.
                  </p>
                )}
                <div className="kids-safety-callout" style={{ marginTop: 4, marginBottom: 14 }}>
                  <ShieldAlert size={20} style={{ color: "var(--crimson)", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Safety first:</strong> Never share your address, phone number, school, or
                    other private details.
                    {mode === "kids"
                      ? " We only need a first name and email from you — your parent fills in the rest."
                      : " Keep a trusted adult nearby when trying new hustles online."}
                  </div>
                </div>

                {signupResult?.kind === "error" && (
                  <div className="consent-alert is-error" style={{ marginBottom: 12 }}>
                    {signupResult.message}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Your first name</label>
                  <input
                    className="text-input"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="First name only"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your email</label>
                  <input
                    className="text-input"
                    type="email"
                    required
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                  />
                </div>
                {mode === "kids" && (
                  <div className="form-group">
                    <label className="form-label">Parent / guardian email</label>
                    <input
                      className="text-input"
                      type="email"
                      required
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="kids-join-modal-actions">
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ gap: 6 }}>
                    <Unlock size={16} />{" "}
                    {submitting ? "Sending…" : mode === "kids" ? "Request to join" : "Join team"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GuideCard({
  guide,
  isMember,
  membershipTier,
  onJoinCta,
  collapseSteps = true,
}: {
  guide: KidsGuide;
  isMember: boolean;
  membershipTier?: string | null;
  onJoinCta: () => void;
  /** Start with steps collapsed (default). Use false only if a deep-link should expand. */
  collapseSteps?: boolean;
}) {
  const minTier = kidsGuideMinTier(guide.id);
  const access = resolveGuideAccess({ isMember, membershipTier, minTier });
  const [stepsOpen, setStepsOpen] = useState(!collapseSteps);
  const isFreePlan = minTier === "free";

  return (
    <article className={`glass kids-guide-card ${access.unlocked ? "is-free" : "is-gated"}`}>
      <div className="kids-guide-card-head">
        <div>
          <span className={`glow-badge ${isFreePlan ? "free" : "pink"}`} style={{ fontSize: "0.9375rem" }}>
            {guideTierBadgeLabel(minTier)}
          </span>
          <span className="kids-guide-theme">{themeLabel(guide.theme)}</span>
          <h3>{guide.title}</h3>
          <p className="kids-guide-tier-note">{guideTierMembershipNote(minTier)}</p>
        </div>
        {access.unlocked ? (
          <Unlock size={18} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
        ) : (
          <Lock size={18} style={{ color: "var(--crimson)", flexShrink: 0 }} />
        )}
      </div>
      <p className="kids-guide-summary">{guide.summary}</p>

      {access.unlocked ? (
        <>
          <button
            type="button"
            className="kids-guide-steps-toggle"
            onClick={() => setStepsOpen((o) => !o)}
            aria-expanded={stepsOpen}
          >
            {stepsOpen ? "Hide steps" : `Show ${guide.steps.length} steps`}
          </button>

          {stepsOpen && (
            <>
              <ol className="kids-guide-steps">
                {guide.steps.map((step, i) => (
                  <li key={step.title}>
                    <strong>
                      Step {i + 1}: {step.title}
                    </strong>
                    <span>{step.body}</span>
                  </li>
                ))}
              </ol>
              <p className="kids-guide-parent-tip">
                <strong>Parent tip:</strong> {guide.parentTip}
              </p>
            </>
          )}
        </>
      ) : (
        <div className="kids-guide-lock kids-guide-lock--desc-only">
          <Lock size={18} aria-hidden />
          <JoinToUnlockCta access={access} onJoin={onJoinCta} onUpgrade={onJoinCta} />
        </div>
      )}
    </article>
  );
}

function GuidesTab({
  mode,
  isMember,
  membershipTier,
  onJoinCta,
  onOpenGuidesLibrary,
  onSwitchAudience,
  onOpenSeniors,
}: {
  mode: AudienceMode;
  isMember: boolean;
  membershipTier?: string | null;
  onJoinCta: () => void;
  onOpenGuidesLibrary?: () => void;
  onSwitchAudience?: (next: AudienceMode) => void;
  onOpenSeniors?: () => void;
}) {
  const guides = guidesForAudience(mode);
  const freePlan = guides.filter((g) => kidsGuideMinTier(g.id) === "free");
  const members = guides.filter((g) => kidsGuideMinTier(g.id) !== "free");
  const isKids = mode === "kids";

  return (
    <div className="kids-guides-wrap">
      <div className="kids-guides-hero-row">
        <div className="kids-guides-left">
          <div className="kids-guides-media-pane">
            <img
              src={isKids ? kidsGuidesHero : juniorGuidesHero}
              alt={
                isKids
                  ? "Kids Corner Guides — Explore. Learn. Create. Earn. Fun guides to help kids discover skills, build confidence, and earn money."
                  : "Teens Side Hustle Guides — Simple steps to big ideas."
              }
              className="kids-guides-hero-img"
              width={1024}
              height={682}
              decoding="async"
            />
          </div>

          <div className="kids-guides-under-picture">
            <h3 className="kids-guides-section-title">Starter, Pro &amp; Elite guides</h3>
            <div className="kids-guides-grid kids-guides-grid--under-picture">
              {members.map((g) => (
                <GuideCard
                  key={g.id}
                  guide={g}
                  isMember={isMember}
                  membershipTier={membershipTier}
                  onJoinCta={onJoinCta}
                />
              ))}
            </div>
            <SafetyCallout />
          </div>
        </div>

        <div className="glass kids-junior-intro kids-guides-side-panel">
          <h2>
            <BookMarked size={24} style={{ color: "var(--crimson)" }} />{" "}
            {isKids ? "GYSH Kids Corner Guides" : "GYSH Teens Side Hustle Guides"}
            <span
              className={`glow-badge ${isKids ? "pink" : "emerald"} kids-audience-age-badge`}
            >
              {isKids ? "Ages 4–12" : "Ages 13–17"}
            </span>
          </h2>
          <p>
            Every guide unlocks with a membership level. Free Guides need{" "}
            <strong>Free Membership</strong> ({FREE_GUIDE_SIGNUP_NOTE}); others show Starter, Pro, or Elite
            on the card. Join the{" "}
            <strong>{isKids ? "Kids Corner GYSH Team" : "Teens Side Hustle Team"}</strong> to get started.
          </p>
          {!isMember && (
            <div style={{ marginTop: 8 }}>
              <JoinToUnlockCta
                access={resolveGuideAccess({ isMember: false, minTier: "free" })}
                onJoin={onJoinCta}
              />
            </div>
          )}

          <h3 className="kids-guides-section-title">Free with Free Membership</h3>
          <div className="kids-guides-grid kids-guides-grid--beside">
            {freePlan.map((g) => (
              <GuideCard
                key={g.id}
                guide={g}
                isMember={isMember}
                membershipTier={membershipTier}
                onJoinCta={onJoinCta}
              />
            ))}
          </div>

          {(onOpenGuidesLibrary || onSwitchAudience || onOpenSeniors) && (
            <nav className="kids-guides-more-links" aria-label="More GYSH guides">
              <h3 className="kids-guides-section-title">More guides</h3>
              <div className="kids-guides-more-links__row">
                {onSwitchAudience && (
                  <button
                    type="button"
                    className="kids-guides-more-link"
                    onClick={() => onSwitchAudience(isKids ? "junior" : "kids")}
                  >
                    <BookMarked size={16} aria-hidden />
                    <span>
                      {isKids ? "Teens guides" : "Kids guides"}
                      <small>{isKids ? "Ages 13–17" : "Ages 4–12"}</small>
                    </span>
                    <ArrowRight size={14} aria-hidden />
                  </button>
                )}
                {onOpenSeniors && (
                  <button type="button" className="kids-guides-more-link" onClick={onOpenSeniors}>
                    <BookMarked size={16} aria-hidden />
                    <span>
                      Seniors guides
                      <small>Ages 55+</small>
                    </span>
                    <ArrowRight size={14} aria-hidden />
                  </button>
                )}
                {onOpenGuidesLibrary && (
                  <button
                    type="button"
                    className="kids-guides-more-link is-master"
                    onClick={onOpenGuidesLibrary}
                  >
                    <BookOpen size={16} aria-hidden />
                    <span>
                      All GYSH Guides
                      <small>Adults · Kids · Teens · Seniors</small>
                    </span>
                    <ArrowRight size={14} aria-hidden />
                  </button>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function KidsModeToggles({
  mode,
  onModeChange,
}: {
  mode: AudienceMode;
  onModeChange: (next: AudienceMode) => void;
}) {
  return (
    <div className="kids-mode-bar" role="tablist" aria-label="Kids Corner age groups">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "kids"}
        onClick={() => onModeChange("kids")}
        className={`kids-mode-btn ${mode === "kids" ? "active" : ""}`}
      >
        <Users size={16} aria-hidden />
        <span className="kids-mode-label">Kids</span>
        <span className="kids-mode-ages">Ages 4–12</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "junior"}
        onClick={() => onModeChange("junior")}
        className={`kids-mode-btn ${mode === "junior" ? "active" : ""}`}
      >
        <Smile size={16} aria-hidden />
        <span className="kids-mode-label">Teens</span>
        <span className="kids-mode-ages">Ages 13–17</span>
      </button>
    </div>
  );
}

function KidsAudienceHeading({ mode, compact = false }: { mode: AudienceMode; compact?: boolean }) {
  if (mode === "kids") {
    return (
      <h2 className={`kids-intro-title${compact ? " kids-intro-title--compact" : ""}`}>
        <Star size={compact ? 20 : 22} style={{ color: "var(--crimson)" }} aria-hidden />
        <span className="kids-intro-title-text">GYSH Kid&apos;s Side Hustles</span>
        <span className="glow-badge pink kids-audience-age-badge">Ages 4–12</span>
      </h2>
    );
  }
  return (
    <h2
      className={`kids-intro-title${compact ? " kids-intro-title--compact kids-intro-title--teens" : ""}`}
    >
      <Smile size={compact ? 20 : 22} style={{ color: "var(--crimson)" }} aria-hidden />
      <span className="kids-intro-title-text">GYSH Teens Side Hustles</span>
      <span className="glow-badge emerald kids-audience-age-badge">Ages 13–17</span>
    </h2>
  );
}

function KidsHustleWizard({
  mode,
  onModeChange,
  onOpenPiggy,
  isLoggedIn = false,
  hasAccountLogin = false,
  previewAsGuest = false,
  onUnlockBlueprint,
  onOpenDashboard,
}: {
  mode: AudienceMode;
  onModeChange: (next: AudienceMode) => void;
  onOpenPiggy: () => void;
  isLoggedIn?: boolean;
  /** Real portal session (parent/family account) — not lightweight team join. */
  hasAccountLogin?: boolean;
  previewAsGuest?: boolean;
  onUnlockBlueprint?: () => void;
  onOpenDashboard?: () => void;
}) {
  const ageGroup = mode === "junior" ? "junior" : "kids";
  /** Parent sitting with their kid: portal login unlocks + owns the Blueprint. */
  const parentOwnsSave = hasAccountLogin && !previewAsGuest;
  const unlocked =
    parentOwnsSave ||
    hasBlueprintAccess({
      isLoggedIn,
      ageGroup,
      hasTeamMembership: isKidsCornerMember(mode, isLoggedIn),
      previewAsGuest,
    });

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    age: "",
    interest: "",
    place: "",
    time: "",
  });
  const [rankedIds, setRankedIds] = useState<string[] | null>(null);
  const [rankedPcts, setRankedPcts] = useState<Record<string, number>>({});
  const [savedToFamily, setSavedToFamily] = useState(false);

  /** Kids/Teens wizard runs by a logged-in parent save to the parent profile (not a kid login). */
  const saveToParentProfile = (
    nextAnswers: Record<string, string>,
    nextIds: string[],
    nextPcts: Record<string, number> = {},
  ) => {
    if (!parentOwnsSave) return;
    void saveBlueprintToAccount({
      ageGroup,
      answers: nextAnswers,
      resultIds: nextIds,
      resultPcts: nextPcts,
      childProfileId: null,
    }).then((bp) => {
      if (bp) setSavedToFamily(true);
    });
  };

  useEffect(() => {
    trackGyshEvent("find_side_hustle_started", { age_group: ageGroup });
    const pending = peekPendingBlueprintFor(ageGroup);
    if (!pending || !unlocked) return;
    const restored = {
      age: String(pending.answers.age ?? ""),
      interest: String(pending.answers.interest ?? ""),
      place: String(pending.answers.place ?? ""),
      time: String(pending.answers.time ?? ""),
    };
    if (!restored.age || !restored.interest) return;
    setAnswers(restored);
    setRankedIds(pending.resultIds.length ? pending.resultIds : null);
    let restoredPcts =
      pending.resultPcts && typeof pending.resultPcts === "object"
        ? { ...pending.resultPcts }
        : {};
    // Older pending kids runs had no % — rebuild from answers when possible.
    if (!Object.keys(restoredPcts).length && pending.resultIds.length) {
      const pool = hustlesForMode(mode);
      const scored = pool
        .map((h) => {
          let score = 0;
          const age = restored.age as "young" | "mid" | "older";
          const interest = restored.interest as JrHustle["tags"]["interests"][number];
          const place = restored.place as "outdoor" | "indoor" | "either";
          const time = restored.time as "short" | "medium" | "long";
          if (h.tags.ages.includes(age)) score += 3;
          if (h.tags.interests.includes(interest)) score += 4;
          if (place === "either" || h.tags.place.includes(place) || h.tags.place.includes("either")) {
            score += 2;
          }
          if (h.tags.time.includes(time)) score += 2;
          return { id: h.id, score };
        })
        .sort((a, b) => b.score - a.score);
      const maxScore = Math.max(scored[0]?.score ?? 1, 1);
      restoredPcts = Object.fromEntries(
        scored.map((row) => [row.id, Math.round((row.score / maxScore) * 100)]),
      );
    }
    setRankedPcts(restoredPcts);
    trackGyshEvent("blueprint_unlocked", { age_group: ageGroup });
    trackGyshEvent("blueprint_saved", { age_group: ageGroup });
    if (parentOwnsSave && pending.resultIds.length) {
      saveToParentProfile(restored, pending.resultIds, restoredPcts);
    }
    clearPendingBlueprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ageOptions =
    mode === "kids"
      ? [
          { label: "Ages 4 – 8", value: "young" },
          { label: "Ages 9 – 12", value: "mid" },
        ]
      : [
          { label: "Ages 13 – 14", value: "mid" },
          { label: "Ages 15 – 17", value: "older" },
        ];

  const steps = [
    {
      key: "age",
      title: "How old are you?",
      subtitle: "Pick the group that fits you best.",
      icon: <Users size={24} style={{ color: "var(--crimson)" }} />,
      options: ageOptions,
    },
    {
      key: "interest",
      title: "What sounds most fun?",
      subtitle: "Pick what you’d happily do for an afternoon.",
      icon: <Heart size={24} style={{ color: "var(--crimson)" }} />,
      options: [
        { label: "Animals & pets", value: "animals" },
        { label: "Making art & crafts", value: "creative" },
        { label: "Being outside", value: "outdoors" },
        { label: "Helping people", value: "helping" },
        { label: "Tech & gadgets", value: "tech" },
        { label: "AI & making games", value: "ai" },
      ],
    },
    {
      key: "place",
      title: "Where do you like to work?",
      subtitle: "Indoor, outdoor, or a mix.",
      icon: <Trees size={24} style={{ color: "var(--accent-emerald)" }} />,
      options: [
        { label: "Mostly outdoors", value: "outdoor" },
        { label: "Mostly indoors", value: "indoor" },
        { label: "Either is fine", value: "either" },
      ],
    },
    {
      key: "time",
      title: "How much time do you have?",
      subtitle: "School and rest come first!",
      icon: <Clock size={24} style={{ color: "#6b4f3a" }} />,
      options: [
        { label: "A little (under 1 hour)", value: "short" },
        { label: "A bit (1 – 3 hours / week)", value: "medium" },
        { label: "More free time (3+ hours)", value: "long" },
      ],
    },
  ];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [steps[currentStep].key]: value }));
  };

  const scoreHustle = (h: JrHustle, ans: Record<string, string> = answers) => {
    let score = 0;
    const age = ans.age as "young" | "mid" | "older";
    const interest = ans.interest as JrHustle["tags"]["interests"][number];
    const place = ans.place as "outdoor" | "indoor" | "either";
    const time = ans.time as "short" | "medium" | "long";

    if (h.tags.ages.includes(age)) score += 3;
    if (h.tags.interests.includes(interest)) score += 4;
    if (place === "either" || h.tags.place.includes(place) || h.tags.place.includes("either")) {
      score += 2;
    }
    if (h.tags.time.includes(time)) score += 2;
    return score;
  };

  /** Relative match % — same approach as Adult/Senior (top score = 100%). */
  const buildRankedMatches = (ans: Record<string, string>) => {
    const pool = hustlesForMode(mode);
    const scored = pool
      .map((h) => ({ hustle: h, score: scoreHustle(h, ans) }))
      .sort((a, b) => b.score - a.score);
    const maxScore = Math.max(scored[0]?.score ?? 1, 1);
    const fallback = mode === "kids" ? "crafts" : "tech-helper";
    if (!scored.length) {
      return { ids: [fallback], pcts: { [fallback]: 100 } as Record<string, number> };
    }
    const pcts: Record<string, number> = {};
    const ids = scored.map((row) => {
      pcts[row.hustle.id] = Math.round((row.score / maxScore) * 100);
      return row.hustle.id;
    });
    return { ids, pcts };
  };

  const tierForKidRank = (index: number, pct: number) => {
    if (index === 0) return "Best match";
    if (pct >= 70 || index === 1) return "Strong match";
    return "Good fit";
  };

  const calculateResult = () => {
    const { ids: nextIds, pcts: nextPcts } = buildRankedMatches(answers);
    setRankedIds(nextIds);
    setRankedPcts(nextPcts);
    void savePendingBlueprintAsync({
      ageGroup,
      answers,
      resultIds: nextIds,
      resultPcts: nextPcts,
      returnView: "kids",
      returnTab: "wizard",
    });
    trackGyshEvent("find_side_hustle_completed", {
      age_group: ageGroup,
      match_count: nextIds.length,
    });
    if (!unlocked) {
      trackGyshEvent("partial_blueprint_viewed", {
        age_group: ageGroup,
        match_count: nextIds.length,
        unlocked: false,
      });
    } else {
      trackGyshEvent("blueprint_unlocked", { age_group: ageGroup, match_count: nextIds.length });
      if (parentOwnsSave) {
        trackGyshEvent("blueprint_saved", {
          age_group: ageGroup,
          match_count: nextIds.length,
          source: "parent_coach",
        });
        saveToParentProfile(answers, nextIds, nextPcts);
        clearPendingBlueprint();
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((p) => p + 1);
    } else {
      calculateResult();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({ age: "", interest: "", place: "", time: "" });
    setRankedIds(null);
    setRankedPcts({});
    setSavedToFamily(false);
    clearPendingBlueprint();
    trackGyshEvent("wizard_retaken", { age_group: ageGroup });
  };

  const handleUnlock = () => {
    if (rankedIds) {
      void savePendingBlueprintAsync({
        ageGroup,
        answers,
        resultIds: rankedIds,
        resultPcts: rankedPcts,
        returnView: "kids",
        returnTab: "wizard",
      });
    }
    trackGyshEvent("blueprint_unlock_clicked", { age_group: ageGroup });
    trackGyshEvent("registration_started_from_blueprint", { age_group: ageGroup });
    onUnlockBlueprint?.();
  };

  const step = steps[currentStep];
  const progressPercent = (currentStep / steps.length) * 100;
  const selected = answers[step?.key];
  const rankedHustles = (rankedIds ?? [])
    .map((id) => hustlesForMode(mode).find((h) => h.id === id))
    .filter((h): h is JrHustle => Boolean(h));

  return (
    <div className="kids-wizard-wrap">
      <div className="kids-wizard-top">
        <div className="kids-wizard-mode-row">
          <KidsAudienceHeading mode={mode} compact />
          <KidsModeToggles mode={mode} onModeChange={onModeChange} />
        </div>
        {rankedIds === null ? (
          <div className="kids-wizard-intro" data-testid="kids-wizard-welcome">
            {mode === "junior" ? (
              <p>
                Welcome! Try the <strong>GYSH Match Wizard</strong>, browse safe <strong>Ideas</strong>, set savings
                goals in <strong>My Bank</strong>, and explore <strong>Guides</strong> — with a parent nearby.
              </p>
            ) : (
              <p>
                Welcome! Try the <strong>GYSH Match Wizard</strong>, browse <strong>Ideas</strong>, save in the{" "}
                <strong>Piggy Bank</strong>, and explore <strong>Guides</strong> — with a parent nearby.
              </p>
            )}
          </div>
        ) : null}
        {rankedIds === null ? (
          <KidAssignedBlueprintCard
            mode={mode}
            canLoad={hasAccountLogin && !previewAsGuest}
            compact
            onOpenDashboard={onOpenDashboard}
          />
        ) : null}
      </div>

      <div className="kids-wizard-inline">
        <div className="kids-wizard-media-pane">
          <MatchFinderWizardHero mode={mode} />
        </div>
        <div className="kids-wizard-side">
          <div className="kids-wizard-card glass">
            {rankedIds === null ? (
              <>
                <div className="kids-wizard-progress-meta">
                  <span>{mode === "junior" ? "GYSH Teens Match Wizard" : "GYSH Kids Match Wizard"}</span>
                  <span>
                    Question {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <div className="kids-wizard-progress-bar">
                  <div className="kids-wizard-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>

                {currentStep === 0 && <WizardStartHereBanner />}
                <div className="kids-wizard-header">
                  <div className="kids-wizard-icon">{step.icon}</div>
                  <div className="kids-wizard-header-copy">
                    <h2>{step.title}</h2>
                    <p>{step.subtitle}</p>
                  </div>
                </div>

                <div className="kids-wizard-options">
                  {step.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`kids-wizard-option ${selected === opt.value ? "is-selected" : ""}`}
                      onClick={() => handleSelect(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <p className="kids-wizard-tip">
                  {mode === "junior"
                    ? "Tip: Answer with a parent nearby. Matches stay age-appropriate and safer to try."
                    : "Tip: Pick what feels true — with a parent nearby. Matches stay safe and age-appropriate."}
                </p>

                <div className="kids-wizard-nav">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="btn btn-outline"
                    style={{ visibility: currentStep === 0 ? "hidden" : "visible", gap: 6 }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!selected}
                    className="btn btn-primary"
                    style={{ gap: 6 }}
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        See my matches <Sparkles size={16} />
                      </>
                    ) : (
                      <>
                        Next <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <SideHustleBlueprintResults
                ageGroup={ageGroup}
                matches={rankedHustles.map((h, index) => {
                  const pct = rankedPcts[h.id];
                  const tier = tierForKidRank(index, typeof pct === "number" ? pct : 0);
                  return {
                    id: h.id,
                    title: h.name,
                    description: h.desc,
                    pct,
                    tier,
                    badge: h.difficulty,
                    icon: h.icon,
                    whyFits: `${tier} for your age, interests, place, and time — a safe Side Hustle to start earning and learning.`,
                    benefits: h.nextSteps.slice(0, 3),
                    safetyNote: h.safety,
                    meta: [
                      { label: "Est. pay", value: h.pay },
                      { label: "Difficulty", value: h.difficulty },
                    ],
                  };
                })}
                unlocked={unlocked}
                onUnlock={handleUnlock}
                onRetake={resetQuiz}
                extraActions={
                  unlocked ? (
                    <>
                      {parentOwnsSave ? (
                        <p className="kids-wizard-saved-note" data-testid="kids-wizard-saved-to-parent">
                          {savedToFamily
                            ? "Saved to your family Dashboard — you can assign it to a kid anytime."
                            : "Saving to your family Dashboard…"}
                        </p>
                      ) : null}
                      <button type="button" onClick={onOpenPiggy} className="btn btn-primary" style={{ gap: 6 }}>
                        <Coins size={16} /> Set a Piggy Bank goal
                      </button>
                    </>
                  ) : undefined
                }
              >
                {unlocked && <SafetyCallout />}
              </SideHustleBlueprintResults>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HustleIdeaCard({ jh }: { jh: JrHustle }) {
  return (
    <div className="glass kids-hustle-card">
      <div className="kids-hustle-card-head">
        <div className="kids-hustle-card-title">
          <div className="kids-hustle-icon">{jh.icon}</div>
          <h3>{jh.name}</h3>
        </div>
        <span className="glow-badge emerald" style={{ fontSize: "0.9375rem" }}>
          {jh.difficulty}
        </span>
      </div>
      <p>{jh.desc}</p>
      <div className="kids-hustle-card-meta">
        <div>
          <span>Est. Pay Rate</span>
          <strong>{jh.pay}</strong>
        </div>
        <div>
          <span>Safety Tip</span>
          <strong>{jh.safety}</strong>
        </div>
      </div>
    </div>
  );
}

function JobsTab({ mode }: { mode: AudienceMode }) {
  const isKids = mode === "kids";
  const title = isKids ? "Side Hustle Ideas" : "Side Hustle Ideas";
  const blurb = isKids
    ? "Safe, parent-approved ways to earn pocket money — lemonade, pet help, crafts, and more. Pick one, talk it over at home, then track progress in the Piggy Bank."
    : "Safe Teen hustles for ages 13–17 — dog walking, crafts, yard help, tech buddy, and more. Pick one, then track progress in My Bank.";
  const jobs = hustlesForMode(mode);
  const sideCount = isKids ? 2 : 1;
  const sideJobs = jobs.slice(0, sideCount);
  const belowJobs = jobs.slice(sideCount);

  return (
    <div className="kids-junior-jobs kids-junior-jobs--split">
      <div className={`kids-jobs-split ${isKids ? "kids-jobs-split--kids" : "kids-jobs-split--junior"}`}>
        <div className="kids-jobs-hero-pane">
          {isKids ? (
            <img
              src={kidsHustleIdeasHero}
              alt="Kids Side Hustle Ideas — Fun, creative, easy ways to earn and learn for ages 4–12. Art and crafts, garden help, baking, tech help, gift wrapping, lemonade stand, pet care, and tutor or reader."
              className="kids-jobs-hero-img"
              decoding="async"
            />
          ) : (
            <>
              <JuniorTeamImage
                className="junior-team-frame--jobs"
                src={juniorSideHustleHero}
                alt="Teens Hustle Ideas — safe side hustles for ages 13–17."
              />
              <p className="kids-video-caption">
                Browse with the <strong>Teens Side Hustle Team</strong> — safe hustles, parent-approved.
              </p>
            </>
          )}
        </div>

        <div className="glass kids-junior-intro kids-jobs-side-panel">
          <h2>
            <Smile size={24} style={{ color: "var(--crimson)" }} /> {title}
            <span
              className={`glow-badge ${isKids ? "pink" : "emerald"} kids-audience-age-badge`}
            >
              {isKids ? "Ages 4–12" : "Ages 13–17"}
            </span>
          </h2>
          <p>{blurb}</p>
          <SafetyCallout />
          <div className="kids-junior-list kids-junior-list--side">
            {sideJobs.map((jh) => (
              <HustleIdeaCard key={jh.id} jh={jh} />
            ))}
          </div>
        </div>
      </div>

      {belowJobs.length > 0 && (
        <div className="kids-junior-list kids-junior-list--below">
          {belowJobs.map((jh) => (
            <HustleIdeaCard key={jh.id} jh={jh} />
          ))}
        </div>
      )}
    </div>
  );
}

function PiggyBankTab() {
  const [goalName, setGoalName] = useState("Cool Bicycle");
  const [goalCost, setGoalCost] = useState(150);
  const [customGoalTitle, setCustomGoalTitle] = useState("");
  const [customGoalPrice, setCustomGoalPrice] = useState(50);
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [hustleRate, setHustleRate] = useState(15);

  const finalGoalTitle = isCustomGoal ? customGoalTitle || "My Goal" : goalName;
  const finalGoalCost = isCustomGoal ? customGoalPrice : goalCost;
  const tasksNeeded = Math.ceil(finalGoalCost / hustleRate);

  const selectPredefinedGoal = (name: string, price: number) => {
    setIsCustomGoal(false);
    setGoalName(name);
    setGoalCost(price);
  };

  return (
    <div className="kids-piggy-wrap">
      <div className="kids-piggy-inline">
        <div className="kids-piggy-media-pane">
          <img
            src={piggyBankSavingsHero}
            alt="Piggy Bank Savings Calculator — Pick a goal. Set your pace. Watch your dreams add up!"
            className="kids-piggy-hero-img"
            width={1024}
            height={682}
            decoding="async"
          />
        </div>

        <div className="glass kids-piggy-card">
        <h2>
          <Coins size={22} style={{ color: "var(--crimson)" }} /> GYSH Piggy Bank Savings Calculator
        </h2>
        <p>
          Pick a goal or write a custom one. Set your pay rate to see how many tasks you need!
        </p>

        <div className="kids-piggy-goals">
          <span className="kids-piggy-label">Select goal</span>
          <div className="kids-piggy-goal-grid">
            <button
              type="button"
              onClick={() => selectPredefinedGoal("New Video Game", 60)}
              className={`btn btn-outline ${goalName === "New Video Game" && !isCustomGoal ? "active" : ""}`}
            >
              Video Game ($60)
            </button>
            <button
              type="button"
              onClick={() => selectPredefinedGoal("Cool Bicycle", 150)}
              className={`btn btn-outline ${goalName === "Cool Bicycle" && !isCustomGoal ? "active" : ""}`}
            >
              Bicycle ($150)
            </button>
            <button
              type="button"
              onClick={() => selectPredefinedGoal("Tablet / iPad", 250)}
              className={`btn btn-outline ${goalName === "Tablet / iPad" && !isCustomGoal ? "active" : ""}`}
            >
              Tablet ($250)
            </button>
            <button
              type="button"
              onClick={() => setIsCustomGoal(true)}
              className={`btn btn-outline ${isCustomGoal ? "active" : ""}`}
            >
              Custom Goal
            </button>
          </div>
        </div>

        {isCustomGoal && (
          <div className="kids-piggy-custom">
            <input
              type="text"
              placeholder="What is your goal? (e.g. Lego Set)"
              value={customGoalTitle}
              onChange={(e) => setCustomGoalTitle(e.target.value)}
              className="text-input"
            />
            <div className="kids-piggy-price-row">
              <span>Goal Price ($):</span>
              <input
                type="number"
                value={customGoalPrice}
                onChange={(e) => setCustomGoalPrice(Math.max(1, Number(e.target.value)))}
                className="text-input"
                style={{ width: 100 }}
              />
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">
            <span>My Pay Rate Per Task ($)</span>
            <span className="form-label-value">${hustleRate}</span>
          </label>
          <input
            type="range"
            min="2"
            max="50"
            step="1"
            value={hustleRate}
            onChange={(e) => setHustleRate(Number(e.target.value))}
            className="range-slider"
          />
        </div>

        <div className="kids-piggy-result">
          <span>To buy your target:</span>
          <h3>
            {finalGoalTitle} (${finalGoalCost})
          </h3>
          <div className="kids-piggy-count">
            <span>You need to complete:</span>
            <strong>{tasksNeeded}</strong>
            <span>{tasksNeeded === 1 ? "Hustle / Task" : "Hustles / Tasks"}</span>
          </div>
          <div className="kids-piggy-bar-meta">
            <span>Piggy Bank Status</span>
            <span>
              {hustleRate >= finalGoalCost
                ? "100%"
                : `${Math.round((hustleRate / finalGoalCost) * 100)}% filled per job`}
            </span>
          </div>
          <div className="kids-piggy-bar">
            <div
              style={{
                width: `${Math.min(100, Math.round((hustleRate / finalGoalCost) * 100))}%`,
              }}
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function JuniorBankTab() {
  const [goalName, setGoalName] = useState("Laptop");
  const [goalCost, setGoalCost] = useState(700);
  const [customGoalTitle, setCustomGoalTitle] = useState("");
  const [customGoalPrice, setCustomGoalPrice] = useState(500);
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [earningsPerGig, setEarningsPerGig] = useState(40);
  const [savingsPercent, setSavingsPercent] = useState(60);

  const finalGoalTitle = isCustomGoal ? customGoalTitle || "My Goal" : goalName;
  const finalGoalCost = isCustomGoal ? customGoalPrice : goalCost;
  const savedPerGig = Math.max(1, Math.round(earningsPerGig * (savingsPercent / 100)));
  const gigsNeeded = Math.ceil(finalGoalCost / savedPerGig);

  const selectGoal = (name: string, price: number) => {
    setIsCustomGoal(false);
    setGoalName(name);
    setGoalCost(price);
  };

  return (
    <div className="kids-piggy-wrap junior-bank-wrap">
      <div className="kids-piggy-inline">
        <div className="kids-piggy-media-pane">
          <img
            src={juniorMyBankHero}
            alt="My Bank Roll — Set your goal. Build your hustle. Stack your future."
            className="kids-piggy-hero-img"
            width={1024}
            height={682}
            decoding="async"
          />
        </div>

        <div className="glass kids-piggy-card">
          <h2>
            <Coins size={22} style={{ color: "var(--accent-emerald)" }} /> GYSH My Bank Goal Planner
          </h2>
          <p>
            Plan for a bigger teen goal, estimate earnings from each gig, and choose how much to save
            while keeping some money available to spend or give.
          </p>

          <div className="kids-piggy-goals">
            <span className="kids-piggy-label">Choose a goal</span>
            <div className="kids-piggy-goal-grid">
              {[
                ["Laptop", 700],
                ["Starter Fund", 300],
                ["Course / Cert", 500],
                ["Car Fund", 2000],
              ].map(([name, price]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => selectGoal(String(name), Number(price))}
                  className={`btn btn-outline ${goalName === name && !isCustomGoal ? "active" : ""}`}
                >
                  {name} (${Number(price).toLocaleString()})
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomGoal(true)}
                className={`btn btn-outline ${isCustomGoal ? "active" : ""}`}
              >
                Custom Goal
              </button>
            </div>
          </div>

          {isCustomGoal && (
            <div className="kids-piggy-custom">
              <input
                type="text"
                placeholder="What are you saving for?"
                value={customGoalTitle}
                onChange={(e) => setCustomGoalTitle(e.target.value)}
                className="text-input"
              />
              <div className="kids-piggy-price-row">
                <span>Goal amount ($):</span>
                <input
                  type="number"
                  value={customGoalPrice}
                  onChange={(e) => setCustomGoalPrice(Math.max(1, Number(e.target.value)))}
                  className="text-input"
                  style={{ width: 110 }}
                />
              </div>
            </div>
          )}

          <div className="form-group junior-bank-slider">
            <label className="form-label">
              <span>Average earnings per gig</span>
              <span className="form-label-value">${earningsPerGig}</span>
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={earningsPerGig}
              onChange={(e) => setEarningsPerGig(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="form-group junior-bank-slider">
            <label className="form-label">
              <span>Put into savings</span>
              <span className="form-label-value">{savingsPercent}% (${savedPerGig}/gig)</span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={savingsPercent}
              onChange={(e) => setSavingsPercent(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="kids-piggy-result junior-bank-result">
            <span>To reach your goal:</span>
            <h3>{finalGoalTitle} (${finalGoalCost.toLocaleString()})</h3>
            <div className="kids-piggy-count">
              <span>Estimated gigs needed:</span>
              <strong>{gigsNeeded}</strong>
              <span>at ${savedPerGig} saved from each gig</span>
            </div>
            <div className="junior-bank-split">
              <span><strong>{savingsPercent}%</strong> save</span>
              <span><strong>{100 - savingsPercent}%</strong> spend or give</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KidAssignedBlueprintCard({
  mode,
  canLoad,
  compact = false,
  onOpenDashboard,
}: {
  mode: AudienceMode;
  /** Signed-in account that can call /api/blueprints */
  canLoad: boolean;
  /** Tighter card for inside the Match Wizard panel */
  compact?: boolean;
  onOpenDashboard?: () => void;
}) {
  const [rows, setRows] = useState<SavedBlueprint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canLoad) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void listSavedBlueprints()
      .then((list) => {
        if (cancelled) return;
        const age = mode === "junior" ? "junior" : "kids";
        // Show age-matching Blueprints, plus anything explicitly assigned to this kid
        // (parent may have mapped an adult/teen result onto their profile).
        const matched = list.filter(
          (bp) => bp.ageGroup === age || Boolean(bp.childProfileId),
        );
        const assigned = matched.filter((bp) => Boolean(bp.childProfileId));
        setRows(assigned.length > 0 ? assigned : matched.filter((bp) => bp.ageGroup === age));
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canLoad, mode]);

  if (!canLoad || loading || rows.length === 0) return null;

  const bandLabel = mode === "junior" ? "Teens" : "Kids";

  return (
    <div
      className={`kids-assigned-blueprint${compact ? " kids-assigned-blueprint--compact" : ""}`}
      data-testid="kids-assigned-blueprint"
    >
      <h3>
        <Compass size={18} aria-hidden />{" "}
        {rows.some((bp) => bp.childProfileId)
          ? "Your assigned Side Hustle Blueprint"
          : "Saved Side Hustle Blueprint"}
      </h3>
      <p>
        {compact
          ? rows.some((bp) => bp.childProfileId)
            ? `Saved matches for this ${bandLabel} profile — from your parent coach or a wizard you already finished.`
            : `Parent-coached ${bandLabel} Match Wizard results saved on your family Dashboard.`
          : rows.some((bp) => bp.childProfileId)
            ? `Your parent coach mapped a Match Wizard result to this ${bandLabel} page.`
            : `These ${bandLabel} matches are saved on the parent/family account (run together, then assign to a kid anytime).`}
      </p>
      {rows.map((bp) => (
        <div key={bp.id} className="kids-assigned-blueprint-block">
          <strong>{blueprintAgeGroupTitle(bp.ageGroup)}</strong>
          <ol className="kids-assigned-blueprint-matches">
            {(bp.resultIds ?? []).slice(0, 3).map((id) => {
              const pct = bp.resultPcts?.[id];
              return (
                <li key={id}>
                  <strong>{blueprintMatchLabel(bp.ageGroup, id)}</strong>
                  {typeof pct === "number" ? <em>{pct}% match</em> : null}
                </li>
              );
            })}
          </ol>
        </div>
      ))}
      {onOpenDashboard ? (
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: 10 }}
          data-testid="kids-assigned-open-dashboard"
          onClick={onOpenDashboard}
        >
          Open my Dashboard
        </button>
      ) : null}
    </div>
  );
}

export const KidsCorner: React.FC<KidsCornerProps> = ({
  isLoggedIn = false,
  hasAccountLogin = false,
  previewAsGuest = false,
  membershipTier = null,
  onGoToJoin,
  onOpenDashboard,
  onOpenGuidesLibrary,
  onOpenSeniors,
  entryFocus = null,
}) => {
  /** Only a real portal session can load/save Blueprints on the parent/family account. */
  const canLoadBlueprints = hasAccountLogin && !previewAsGuest;
  const [mode, setMode] = useState<AudienceMode>("kids");
  const [kidsTab, setKidsTab] = useState<KidsTab>("wizard");
  const [juniorTab, setJuniorTab] = useState<JuniorTab>("join");
  /** Bumped after lightweight team join so localStorage membership re-reads. */
  const [memberVersion, setMemberVersion] = useState(0);

  useEffect(() => {
    if (!entryFocus) return;
    setMode(entryFocus.mode);
    if (entryFocus.mode === "kids") {
      setKidsTab(entryFocus.tab);
    } else {
      const juniorTabId: JuniorTab =
        entryFocus.tab === "stories" ? "wizard" : entryFocus.tab;
      setJuniorTab(juniorTabId);
    }
  }, [entryFocus]);

  const isMember = (() => {
    void memberVersion;
    // Profile Switcher → Unlogged in User must see the locked guest experience,
    // even if a lightweight team join is still in localStorage.
    if (previewAsGuest) return false;
    return isKidsCornerMember(mode, isLoggedIn);
  })();

  /** Team join / free session without a paid plan → Free Membership tier for guide gates. */
  const effectiveGuideTier = membershipTier ?? (isMember ? "free" : null);

  const refreshMembership = () => setMemberVersion((n) => n + 1);

  const kidsTabIcons: Record<KidsTab, React.ReactNode> = {
    stories: <Star size={16} />,
    wizard: <Compass size={16} />,
    jobs: <Smile size={16} />,
    piggy: <Coins size={16} />,
    guides: <BookMarked size={16} />,
    join: <BadgeCheck size={16} />,
  };
  const juniorTabIcons: Record<JuniorTab, React.ReactNode> = {
    wizard: <Compass size={16} />,
    jobs: <Smile size={16} />,
    piggy: <Coins size={16} />,
    guides: <BookMarked size={16} />,
    join: <BadgeCheck size={16} />,
  };
  const kidsTabs = KIDS_CORNER_TABS.map((t) => ({
    id: t.id,
    label: t.label,
    icon: kidsTabIcons[t.id],
  }));
  const juniorTabs = JUNIOR_CORNER_TABS.map((t) => ({
    id: t.id,
    label: t.label,
    icon: juniorTabIcons[t.id],
  }));

  const handleModeChange = (next: AudienceMode) => {
    if (next === mode) return;

    // Keep the user on the equivalent tab when flipping Kids ↔ Teens
    // (Ideas, Piggy Bank ↔ My Bank, Guides, Join, Match Wizard).
    const currentTab = mode === "kids" ? kidsTab : juniorTab;
    const mappedJunior = ((): JuniorTab => {
      if (currentTab === "stories") return "wizard";
      if (
        currentTab === "wizard" ||
        currentTab === "jobs" ||
        currentTab === "piggy" ||
        currentTab === "guides" ||
        currentTab === "join"
      ) {
        return currentTab;
      }
      return "wizard";
    })();
    const mappedKids = ((): KidsTab => {
      if (
        currentTab === "wizard" ||
        currentTab === "jobs" ||
        currentTab === "piggy" ||
        currentTab === "guides" ||
        currentTab === "join" ||
        currentTab === "stories"
      ) {
        return currentTab === "stories" ? "stories" : currentTab;
      }
      return "wizard";
    })();

    setMode(next);
    if (next === "junior") setJuniorTab(mappedJunior);
    else setKidsTab(mappedKids);
  };

  const onWizard = (mode === "kids" ? kidsTab : juniorTab) === "wizard";

  return (
    <div className="kids-corner-page">
      {!onWizard && (
        <header className="kids-page-header kids-page-header--with-modes">
          <KidsAudienceHeading mode={mode} />
          <KidsModeToggles mode={mode} onModeChange={handleModeChange} />
        </header>
      )}

      {mode === "kids" ? (
        <>
          {kidsTab !== "wizard" ? (
            <KidAssignedBlueprintCard
              mode="kids"
              canLoad={canLoadBlueprints}
              onOpenDashboard={onOpenDashboard}
            />
          ) : null}

          <div className="kids-tab-bar" role="tablist" aria-label="Kids Corner sections">
            {kidsTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={kidsTab === t.id}
                onClick={() => setKidsTab(t.id)}
                className={`nav-link-btn ${kidsTab === t.id ? "active" : ""}`}
                style={{ borderRadius: 10 }}
                data-testid={t.id === "stories" ? "kids-stories-tab" : undefined}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {kidsTab === "stories" && <KidsStoriesTab />}
          {kidsTab === "wizard" && (
            <KidsHustleWizard
              mode="kids"
              onModeChange={handleModeChange}
              onOpenPiggy={() => setKidsTab("piggy")}
              isLoggedIn={isLoggedIn}
              hasAccountLogin={hasAccountLogin}
              previewAsGuest={previewAsGuest}
              onUnlockBlueprint={onGoToJoin ? () => onGoToJoin("kids") : undefined}
              onOpenDashboard={onOpenDashboard}
            />
          )}
          {kidsTab === "jobs" && <JobsTab mode="kids" />}
          {kidsTab === "piggy" && <PiggyBankTab />}
          {kidsTab === "guides" && (
            <GuidesTab
              mode="kids"
              isMember={isMember}
              membershipTier={effectiveGuideTier}
              onJoinCta={() =>
                onGoToJoin ? onGoToJoin("kids") : setKidsTab("join")
              }
              onOpenGuidesLibrary={onOpenGuidesLibrary}
              onSwitchAudience={handleModeChange}
              onOpenSeniors={onOpenSeniors}
            />
          )}
          {kidsTab === "join" && (
            <JoinTeamTab
              mode="kids"
              isMember={isMember}
              isLoggedIn={isLoggedIn}
              onJoined={refreshMembership}
              onGoToJoin={onGoToJoin}
              onOpenGuides={() => setKidsTab("guides")}
            />
          )}
        </>
      ) : (
        <>
          {juniorTab !== "wizard" ? (
            <KidAssignedBlueprintCard
              mode="junior"
              canLoad={canLoadBlueprints}
              onOpenDashboard={onOpenDashboard}
            />
          ) : null}

          <div className="kids-tab-bar" role="tablist" aria-label="Teens Corner sections">
            {juniorTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={juniorTab === t.id}
                onClick={() => setJuniorTab(t.id)}
                className={`nav-link-btn ${juniorTab === t.id ? "active" : ""}`}
                style={{ borderRadius: 10 }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {juniorTab === "wizard" && (
            <KidsHustleWizard
              mode="junior"
              onModeChange={handleModeChange}
              onOpenPiggy={() => setJuniorTab("piggy")}
              isLoggedIn={isLoggedIn}
              hasAccountLogin={hasAccountLogin}
              previewAsGuest={previewAsGuest}
              onUnlockBlueprint={onGoToJoin ? () => onGoToJoin("junior") : undefined}
              onOpenDashboard={onOpenDashboard}
            />
          )}
          {juniorTab === "jobs" && <JobsTab mode="junior" />}
          {juniorTab === "piggy" && <JuniorBankTab />}
          {juniorTab === "guides" && (
            <GuidesTab
              mode="junior"
              isMember={isMember}
              membershipTier={effectiveGuideTier}
              onJoinCta={() =>
                onGoToJoin ? onGoToJoin("junior") : setJuniorTab("join")
              }
              onOpenGuidesLibrary={onOpenGuidesLibrary}
              onSwitchAudience={handleModeChange}
              onOpenSeniors={onOpenSeniors}
            />
          )}
          {juniorTab === "join" && (
            <JoinTeamTab
              mode="junior"
              isMember={isMember}
              isLoggedIn={isLoggedIn}
              onJoined={refreshMembership}
              onGoToJoin={onGoToJoin}
              onOpenGuides={() => setJuniorTab("guides")}
            />
          )}
        </>
      )}
    </div>
  );
};
