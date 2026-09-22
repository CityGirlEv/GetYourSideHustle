import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, ChevronRight, Download, MapPin, Mic2, Users, Video } from "lucide-react";
import {
  AUDIENCE_LABELS,
  STATUS_LABELS,
  fetchWorkshops,
  findWorkshopById,
  parseWorkshopRegisterParam,
  parseWorkshopCardParam,
  submitWorkshopRegistration,
  workshopIsPreRegistration,
  workshopScheduleLabel,
  workshopCardAnchorId,
  workshopCapacityLabel,
  workshopCompleteGuideUnlocked,
  workshopPublicSlug,
  type GuestSpeaker,
  type Workshop,
  type WorkshopStatus,
  type WorkshopAudience,
} from "../lib/workshops";
import {
  workshopMemberAccessLabel,
  workshopRequiresMember,
  workshopSneakPeek,
  workshopPublicTags,
} from "../lib/workshop-playbooks";
import { ApiError } from "../lib/api";
import { downloadWorkshopSneakPeekPdf } from "../lib/workshop-sneak-peek-pdf";
import { reservePdfTab } from "../lib/open-pdf";
import {
  WORKSHOP_FREE_MEMBERSHIP_NEED,
  saveWorkshopRegistrationJoinReturn,
  workshopMemberGateDirections,
} from "../lib/workshop-member-gate";
import workshopsHero from "../assets/workshops-hero.png";

type Filter = "all" | WorkshopStatus;

function workshopPrimaryCtaLabel(w: Workshop): string {
  if (!w.registrationOpen) return "View Registration";
  if (w.status === "waitlist") return "Join Waitlist";
  if (workshopIsPreRegistration(w)) return "Pre-Register";
  return "Reserve Spot";
}

function workshopCardTags(workshop: Workshop): string[] {
  return workshopPublicTags(workshop.id, workshop.tags);
}

const CAPACITY_LIMIT_PHRASE = /(limited to \d+ participants max\.?)/i;

function WorkshopNoteWithCapacity({ text }: { text: string }) {
  const match = text.match(CAPACITY_LIMIT_PHRASE);
  if (!match || match.index == null) return text;
  const hit = match[1]!;
  return (
    <>
      {text.slice(0, match.index)}
      <strong className="workshops-capacity">{hit}</strong>
      {text.slice(match.index + hit.length)}
    </>
  );
}

function WorkshopSneakPeekLink({
  workshopId,
  className,
  canDownloadGuide = false,
}: {
  workshopId: string;
  className?: string;
  canDownloadGuide?: boolean;
}) {
  const peek = workshopSneakPeek(workshopId);
  if (!peek) return null;

  const onDownloadPdf = (event: { preventDefault: () => void; stopPropagation: () => void }) => {
    event.preventDefault();
    event.stopPropagation();
    const tab = reservePdfTab();
    void downloadWorkshopSneakPeekPdf(workshopId, tab).catch((err) => {
      console.error("[GYSH] workshop sneak peek PDF failed", err);
      try {
        tab?.close();
      } catch {
        /* ignore */
      }
    });
  };

  return (
    <details className={["workshops-sneak-peek", className].filter(Boolean).join(" ")} data-testid="workshop-sneak-peek">
      <summary className="workshops-sneak-peek__link" data-testid="workshop-sneak-peek-toggle">
        Prerequisites
        <ChevronRight size={18} className="workshops-sneak-peek__arrow" aria-hidden />
      </summary>
      <div className="workshops-sneak-peek__body" data-testid="workshop-sneak-peek-body">
        <header className="workshops-sneak-peek__header">
          <p className="workshops-sneak-peek__kicker">{peek.kicker}</p>
          <h5>{peek.title}</h5>
          <p className="workshops-sneak-peek__tools">• {peek.tools} •</p>
          {canDownloadGuide ? (
            <button
              type="button"
              className="btn btn-outline workshops-sneak-peek__pdf"
              data-testid="workshop-sneak-peek-pdf"
              onClick={onDownloadPdf}
            >
              <Download size={16} aria-hidden />
              Download complete guide PDF
            </button>
          ) : (
            <p className="workshops-sneak-peek__locked" data-testid="workshop-guide-locked">
              The complete workshop guide stays with GYSH admin until the class date is set. We'll
              email it to you then (PDF attached).
            </p>
          )}
        </header>
        <section>
          <h6>Table of Contents</h6>
          <ol>
            {peek.toc.map((item, i) => (
              <li key={item}>
                {i + 1}. {item}
              </li>
            ))}
          </ol>
        </section>
        <section className="workshops-sneak-peek__cover" data-testid="workshop-sneak-peek-cover">
          <h6>{peek.coverLead}</h6>
          <ul className="workshops-sneak-peek__cover-items">
            {peek.coverItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <aside className="workshops-sneak-peek__copyright">
            <h6>{peek.copyrightHeading}</h6>
            {peek.copyrightLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </aside>
        </section>
        <section>
          <h6>{peek.rulesHeading}</h6>
          <ul>
            {peek.rules.map((item) => (
              <li key={item.code}>
                <span className="workshops-sneak-peek__code">{item.code}</span> ☐ {item.text}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h6>{peek.beforeClassHeading}</h6>
          <ul>
            {peek.beforeClass.map((item) => (
              <li key={item.code}>
                <span className="workshops-sneak-peek__code">{item.code}</span> ☐ {item.text}
              </li>
            ))}
          </ul>
        </section>
        <section data-testid="workshop-sneak-peek-credits">
          <h6>{peek.creditsHeading}</h6>
          <p>{peek.creditsIntro}</p>
          <ul className="workshops-sneak-peek__credit-plans">
            {peek.creditPlans.map((plan) => (
              <li key={plan.tool}>
                <strong>{plan.tool}.</strong> {plan.pricing} {plan.notes}
              </li>
            ))}
          </ul>
          <h6>{peek.creditsImportantHeading}</h6>
          <p>{peek.creditsImportantLead}</p>
          <p>Plan for:</p>
          <ul>
            {peek.creditsPlanFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{peek.creditsTip}</p>
          <p>{peek.creditsDisclaimer}</p>
        </section>
      </div>
    </details>
  );
}

export function WorkshopsHub({
  onAddWorkshopSeat,
  isLoggedIn = false,
  isAdmin = false,
  memberName = "",
  memberEmail = "",
  onGoToJoin,
  onGoToLogin,
}: {
  onAddWorkshopSeat?: () => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  memberName?: string;
  memberEmail?: string;
  onGoToJoin?: () => void;
  onGoToLogin?: () => void;
} = {}) {
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [audienceFilter, setAudienceFilter] = useState<"all" | WorkshopAudience>("all");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [speakers, setSpeakers] = useState<GuestSpeaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringFor, setRegisteringFor] = useState<Workshop | null>(null);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: "",
    attendeeCount: 1,
    notes: "",
  });
  const [registrationStatus, setRegistrationStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [submittingRegistration, setSubmittingRegistration] = useState(false);
  const [focusedWorkshopId, setFocusedWorkshopId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchWorkshops();
      if (cancelled) return;
      setWorkshops(data.workshops);
      setSpeakers(data.speakers);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const speakersById = Object.fromEntries(speakers.map((s) => [s.id, s]));

  const filtered = workshops.filter((w) => {
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    if (audienceFilter !== "all" && w.audience !== audienceFilter && w.audience !== "all") return false;
    return true;
  });

  const upcomingCount = workshops.filter((w) => w.status === "upcoming" || w.status === "waitlist").length;

  const syncRegisterQuery = (workshopId: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (workshopId) url.searchParams.set("register", workshopPublicSlug(workshopId));
    else url.searchParams.delete("register");
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
      window.history.replaceState(window.history.state, "", next);
    }
  };

  const openRegistration = (workshop: Workshop) => {
    setRegisteringFor(workshop);
    setRegistrationStatus(null);
    setRegistrationForm({
      name: memberName || "",
      email: memberEmail || "",
      phone: "",
      attendeeCount: 1,
      notes: "",
    });
    syncRegisterQuery(workshop.id);
  };

  const closeRegistration = () => {
    setRegisteringFor(null);
    setRegistrationStatus(null);
    syncRegisterQuery(null);
  };

  useEffect(() => {
    if (loading || registeringFor) return;
    const wanted = parseWorkshopRegisterParam();
    if (!wanted) return;
    const match = findWorkshopById(wanted, workshops);
    if (match) openRegistration(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once after catalog load
  }, [loading, workshops]);

  useEffect(() => {
    if (loading || registeringFor) return;
    if (parseWorkshopRegisterParam()) return;
    const wanted = parseWorkshopCardParam();
    if (!wanted) return;
    const match = findWorkshopById(wanted, workshops);
    if (!match) return;
    setStatusFilter("all");
    setAudienceFilter("all");
    setFocusedWorkshopId(match.id);
    const anchor = workshopCardAnchorId(match.id);
    window.requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [loading, workshops, registeringFor]);

  const handleRegistrationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!registeringFor || !registeringFor.registrationOpen) return;
    if (workshopRequiresMember(registeringFor.id) && !isLoggedIn) {
      setRegistrationStatus({
        kind: "error",
        message: "Join Free (or sign in) to pre-register. Need Free membership or higher to attend.",
      });
      return;
    }
    setSubmittingRegistration(true);
    setRegistrationStatus(null);
    try {
      const res = await submitWorkshopRegistration({
        workshopId: registeringFor.id,
        ...registrationForm,
      });
      setRegistrationStatus({
        kind: "success",
        message: res.message || "Registration received. Check your email for confirmation.",
      });
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      setRegistrationStatus({
        kind: "error",
        message:
          status === 401
            ? "Join Free (or sign in) to pre-register. Need Free membership or higher to attend."
            : err instanceof Error
              ? err.message
              : "Registration failed. Please try again.",
      });
    } finally {
      setSubmittingRegistration(false);
    }
  };

  if (registeringFor) {
    const isOpen = registeringFor.registrationOpen && registeringFor.status !== "past";
    const isPreReg = workshopIsPreRegistration(registeringFor);
    const eventSpeakers = registeringFor.speakerIds
      .map((id) => speakersById[id])
      .filter(Boolean);
    const needsMember = workshopRequiresMember(registeringFor.id);
    const memberOk = !needsMember || isLoggedIn;
    const accessLabel = workshopMemberAccessLabel(registeringFor.id);
    const formUnlocked = isOpen && memberOk && !submittingRegistration;

    return (
      <div className="workshops-registration-page">
        <button
          type="button"
          className="btn btn-outline"
          onClick={closeRegistration}
          style={{ width: "fit-content" }}
        >
          <ArrowLeft size={14} /> Back to workshops
        </button>

        <section className="workshops-registration-layout">
          <article className="workshops-registration-summary glass">
            <div className="workshops-card-top">
              <span className={`glow-badge ${isOpen ? "emerald" : "amber"}`}>
                {isOpen
                  ? isPreReg
                    ? "Pre-Registration Open"
                    : "Registration Open"
                  : "Registration Closed"}
              </span>
              <WorkshopSneakPeekLink
                workshopId={registeringFor.id}
                className="workshops-sneak-peek--page"
                canDownloadGuide={workshopCompleteGuideUnlocked({
                  isAdmin,
                  date: registeringFor.date,
                })}
              />
              {accessLabel ? <span className="glow-badge free">{accessLabel}</span> : null}
            </div>
            <h2>{registeringFor.title}</h2>
            <p>{registeringFor.blurb}</p>
            <div className="workshops-card-meta">
              <span>
                <Calendar size={14} /> {workshopScheduleLabel(registeringFor)}
              </span>
              <span>
                {registeringFor.format === "In-Person" || registeringFor.format === "Hybrid" ? (
                  <MapPin size={14} />
                ) : (
                  <Video size={14} />
                )}{" "}
                {registeringFor.format}
              </span>
              <span>
                <Users size={14} /> {AUDIENCE_LABELS[registeringFor.audience]}
              </span>
              {workshopCapacityLabel(registeringFor) ? (
                <span className="workshops-capacity" data-testid="workshop-capacity">
                  <Users size={14} /> {workshopCapacityLabel(registeringFor)}
                </span>
              ) : null}
            </div>
            {eventSpeakers.length > 0 && (
              <div className="workshops-card-speakers">
                {eventSpeakers.map((sp) => (
                  <span key={sp.id} className="workshops-speaker-chip">
                    <span className="workshops-chip-dot" style={{ background: sp.accent }} />
                    {sp.name}
                  </span>
                ))}
              </div>
            )}
            <div className="workshops-registration-note">
              {isOpen ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>
                <WorkshopNoteWithCapacity
                  text={
                    isOpen
                      ? registeringFor.registrationNote || "Registration is open for this workshop."
                      : registeringFor.registrationNote ||
                        "Registration is not open yet. Admins will open this once the date is confirmed."
                  }
                />
              </span>
            </div>
          </article>

          <form className="workshops-registration-form glass" onSubmit={(e) => void handleRegistrationSubmit(e)}>
            <h3>{isPreReg ? "Pre-Register Interest" : "Workshop Registration"}</h3>
            <p data-testid="workshop-registration-intro">
              {isOpen ? (
                !memberOk ? (
                  <>
                    <strong>{WORKSHOP_FREE_MEMBERSHIP_NEED}</strong>{" "}
                    {workshopMemberGateDirections(registeringFor.id, registeringFor.title)}
                  </>
                ) : isPreReg ? (
                  "Tell us you're interested — date and time are TBD. We'll email you when the schedule is confirmed."
                ) : (
                  "Save your spot for this event."
                )
              ) : (
                "Registration fields are previewed here and will unlock when Admin opens registration."
              )}
            </p>
            {registrationStatus && (
              <div className={`workshops-registration-alert is-${registrationStatus.kind}`}>
                {registrationStatus.message}
              </div>
            )}
            {!memberOk ? (
              <div className="workshop-member-gate" data-testid="workshop-member-gate">
                <button
                  type="button"
                  className="btn btn-primary"
                  data-testid="workshop-join-free"
                  onClick={() => {
                    saveWorkshopRegistrationJoinReturn(registeringFor.id);
                    onGoToJoin?.();
                  }}
                >
                  Create a FREE account
                </button>
                {onGoToLogin ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    data-testid="workshop-sign-in"
                    onClick={() => {
                      saveWorkshopRegistrationJoinReturn(registeringFor.id);
                      onGoToLogin();
                    }}
                  >
                    Sign in
                  </button>
                ) : null}
              </div>
            ) : null}
            <fieldset disabled={!formUnlocked}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  className="text-input"
                  required
                  value={registrationForm.name}
                  onChange={(e) => setRegistrationForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="text-input"
                  type="email"
                  required
                  value={registrationForm.email}
                  onChange={(e) => setRegistrationForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="text-input"
                  value={registrationForm.phone}
                  onChange={(e) => setRegistrationForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Seats</label>
                <select
                  className="select-input"
                  value={registrationForm.attendeeCount}
                  onChange={(e) => setRegistrationForm((prev) => ({ ...prev, attendeeCount: Number(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="text-input"
                  rows={4}
                  value={registrationForm.notes}
                  onChange={(e) => setRegistrationForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </fieldset>
            <button type="submit" className="btn btn-primary" disabled={!formUnlocked}>
              {isOpen
                ? submittingRegistration
                  ? "Submitting…"
                  : workshopPrimaryCtaLabel(registeringFor)
                : "Registration Disabled"}
            </button>
            {isOpen && onAddWorkshopSeat ? (
              <button
                type="button"
                className="btn btn-outline"
                data-testid="workshops-add-seat-to-cart"
                style={{ width: "100%", marginTop: 10 }}
                onClick={onAddWorkshopSeat}
              >
                Add workshop seat to cart
              </button>
            ) : null}
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="workshops-hub">
      <section className="workshops-hero-row" aria-label="Workshops and guest speakers">
        <div className="workshops-visual-hero">
          <div className="workshops-visual-hero__band">
            <div className="workshops-visual-hero__frame">
              <img
                src={workshopsHero}
                alt="Get Your Side Hustle Workshops & Guest Speakers — Learn, Connect, Grow. Practical strategies, live Q&A, real stories, and topics from finding your side hustle to scaling and freedom."
                className="workshops-visual-hero__img"
                width={1024}
                height={682}
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>

        <div className="workshops-hero glass">
          <span className="glow-badge pink">
            <Mic2 size={12} /> Live Learning
          </span>
          <h2>GYSH Workshops & Guest Speakers</h2>
          <p>
            GYSH partnership sessions — Tina leads kids & family glow labs; Evelyn hosts adult build tracks
            on Airbnb, AI agents, Shopify, and apps. Guest experts join throughout the season. Dates and times
            are TBD until the schedule is confirmed. Extra seats are $40 or 40 credits on Join.
          </p>
          <div className="workshops-hero-stats">
            <div className="workshops-stat">
              <Calendar size={18} />
              <strong>{loading ? "…" : upcomingCount}</strong>
              <span>Upcoming sessions</span>
            </div>
            <div className="workshops-stat">
              <Users size={18} />
              <strong>{loading ? "…" : speakers.length}</strong>
              <span>Speakers & hosts</span>
            </div>
            <div className="workshops-stat">
              <Video size={18} />
              <strong>Zoom + Hybrid</strong>
              <span>Formats</span>
            </div>
          </div>
        </div>
      </section>

      <section className="workshops-schedule">
        <div className="workshops-schedule-head">
          <h3>Workshop Schedule</h3>
          <div className="workshops-filters">
            {(["all", "upcoming", "waitlist", "past"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`btn btn-outline ${statusFilter === f ? "active" : ""}`}
                style={{ padding: "6px 14px", fontSize: "0.9375rem" }}
                onClick={() => setStatusFilter(f)}
              >
                {f === "all" ? "All" : STATUS_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="workshops-audience-filters">
          {(["all", "adult", "kids", "family"] as const).map((a) => (
            <button
              key={a}
              type="button"
              className={`nav-link-btn ${audienceFilter === a ? "active" : ""}`}
              style={{ borderRadius: 10, fontSize: "0.9375rem" }}
              onClick={() => setAudienceFilter(a)}
            >
              {a === "all" ? "All audiences" : AUDIENCE_LABELS[a]}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "var(--text-primary)", padding: 24 }}>Loading workshops…</p>
        ) : (
          <div className="workshops-grid">
            {filtered.map((w) => (
              <article
                key={w.id}
                id={workshopCardAnchorId(w.id)}
                data-testid={workshopCardAnchorId(w.id)}
                className={`workshops-card glass ${w.status === "past" ? "is-past" : ""}${focusedWorkshopId === w.id ? " is-spotlight" : ""}`}
              >
                <div className="workshops-card-top">
                  <span className={`glow-badge ${w.status === "upcoming" ? "pink" : w.status === "waitlist" ? "amber" : "purple"}`}>
                    {STATUS_LABELS[w.status]}
                  </span>
                  <span className="glow-badge cyan">{AUDIENCE_LABELS[w.audience]}</span>
                  {workshopMemberAccessLabel(w.id) ? (
                    <span className="glow-badge free">{workshopMemberAccessLabel(w.id)}</span>
                  ) : null}
                </div>
                <h4 className="workshops-card-title">{w.title}</h4>
                <p className="workshops-card-blurb">{w.blurb}</p>
                <div className="workshops-card-meta">
                  <span>
                    <Calendar size={14} /> {workshopScheduleLabel(w)}
                  </span>
                  <span>
                    {w.format === "In-Person" || w.format === "Hybrid" ? (
                      <MapPin size={14} />
                    ) : (
                      <Video size={14} />
                    )}{" "}
                    {w.format}
                  </span>
                  {workshopCapacityLabel(w) ? (
                    <span className="workshops-capacity" data-testid={`workshop-capacity-${w.id}`}>
                      <Users size={14} /> {workshopCapacityLabel(w)}
                    </span>
                  ) : null}
                </div>
                <div className="workshops-card-speakers">
                  {w.speakerIds.map((id) => {
                    const sp = speakersById[id];
                    if (!sp) return null;
                    return (
                      <span key={id} className="workshops-speaker-chip">
                        <span className="workshops-chip-dot" style={{ background: sp.accent }} />
                        {sp.name}
                      </span>
                    );
                  })}
                </div>
                <div className="workshops-tag-row">
                  {workshopCardTags(w).map((t) => (
                    <span key={t} className="glow-badge purple">
                      {t}
                    </span>
                  ))}
                </div>
                <div className={`workshops-registration-chip ${w.registrationOpen ? "is-open" : "is-closed"}`}>
                  {w.registrationOpen && w.status !== "past"
                    ? workshopIsPreRegistration(w)
                      ? "Pre-registration open"
                      : "Registration open"
                    : "Registration closed"}
                </div>
                <div className="workshops-card-actions">
                  <div className="workshops-card-cta-row">
                    {w.status !== "past" ? (
                      <button
                        type="button"
                        className={w.registrationOpen ? "btn btn-primary" : "btn btn-outline"}
                        onClick={() => openRegistration(w)}
                      >
                        {workshopPrimaryCtaLabel(w)}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => openRegistration(w)}
                      >
                        View Event
                      </button>
                    )}
                    <WorkshopSneakPeekLink
                      workshopId={w.id}
                      canDownloadGuide={workshopCompleteGuideUnlocked({ isAdmin, date: w.date })}
                    />
                  </div>
                  {onAddWorkshopSeat && w.registrationOpen && w.status !== "past" ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      data-testid="workshops-add-seat-to-cart"
                      onClick={onAddWorkshopSeat}
                    >
                      Add workshop seat to cart
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="glass" style={{ padding: 40, textAlign: "center", borderRadius: 16 }}>
            <p style={{ color: "var(--text-primary)" }}>No workshops match those filters yet — check back soon.</p>
          </div>
        )}
      </section>

      <section className="workshops-speakers">
        <h3>Guest Speakers & Hosts</h3>
        <div className="workshops-speaker-grid">
          {speakers.map((s) => (
            <article key={s.id} className="workshops-speaker-card glass" style={{ borderTopColor: s.accent }}>
              <div className="workshops-speaker-avatar" style={{ background: s.accent }}>
                {s.initials}
              </div>
              <h4>{s.name}</h4>
              <p className="workshops-speaker-title">{s.title}</p>
              <p className="workshops-speaker-bio">{s.bio}</p>
              <div className="workshops-tag-row">
                {s.topics.map((t) => (
                  <span key={t} className="glow-badge cyan">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="workshops-cta glass">
        <h3>Want to guest speak or co-host?</h3>
        <p>
          GYSH is building a roster of side hustle operators, educators, and creators. Reach out through
          the GYSH Community tab — workshop booking opens fully once member accounts launch.
        </p>
      </section>
    </div>
  );
}
