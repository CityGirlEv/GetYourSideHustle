import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, ChevronRight, Clock, Download, MapPin, Mic2, Users, Video } from "lucide-react";
import { ApiError } from "../lib/api";
import {
  AUDIENCE_LABELS,
  STATUS_LABELS,
  fetchWorkshops,
  findWorkshopById,
  parseWorkshopRegisterParam,
  submitWorkshopRegistration,
  type GuestSpeaker,
  type Workshop,
  type WorkshopStatus,
  type WorkshopAudience,
} from "../lib/workshops";
import {
  WORKSHOP_FREE_MEMBERSHIP_NEED,
  WORKSHOP_JOIN_OR_SIGN_IN,
  saveWorkshopRegistrationJoinReturn,
  workshopMemberGateDirections,
  workshopRegistrationFormUnlocked,
  workshopRegistrationMemberOk,
} from "../lib/workshop-member-gate";
import {
  workshopMemberAccessLabel,
  workshopPublicTags,
  workshopSneakPeek,
} from "../lib/workshop-playbooks";
import { workshopSneakPeekPdfFilename, workshopSneakPeekPdfPublicPath } from "../lib/workshop-sneak-peek-pdf";
import workshopsHero from "../assets/workshops-hero.png";

function workshopCardTags(workshop: Workshop): string[] {
  return workshopPublicTags(workshop.id, workshop.tags);
}

function workshopIsPreRegistration(workshop: Workshop): boolean {
  return workshop.registrationOpen && workshop.status !== "past" && (!workshop.date || workshop.date === "TBD");
}

function WorkshopSneakPeekLink({
  workshopId,
  className,
}: {
  workshopId: string;
  className?: string;
}) {
  const peek = workshopSneakPeek(workshopId);
  if (!peek) return null;
  const pdfHref = workshopSneakPeekPdfPublicPath(workshopId);
  const pdfFilename = workshopSneakPeekPdfFilename(workshopId);

  return (
    <details
      className={["workshops-sneak-peek", className].filter(Boolean).join(" ")}
      data-testid="workshop-sneak-peek"
    >
      <summary className="workshops-sneak-peek__link" data-testid="workshop-sneak-peek-toggle">
        Prerequisites
        <ChevronRight size={18} className="workshops-sneak-peek__arrow" aria-hidden />
        <span className="collapse-show-hide" aria-hidden="true" />
      </summary>
      <div className="workshops-sneak-peek__body" data-testid="workshop-sneak-peek-body">
        <header className="workshops-sneak-peek__header">
          <p className="workshops-sneak-peek__kicker">{peek.kicker}</p>
          <h5>{peek.title}</h5>
          <p className="workshops-sneak-peek__tools">• {peek.tools} •</p>
          {pdfHref ? (
            <a
              className="btn btn-outline workshops-sneak-peek__pdf"
              data-testid="workshop-sneak-peek-pdf"
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              download={pdfFilename ?? undefined}
            >
              <Download size={16} aria-hidden />
              Download PDF
            </a>
          ) : null}
        </header>
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
          <h6>Table of Contents</h6>
          <ol>
            {peek.toc.map((item, i) => (
              <li key={item}>
                {i + 1}. {item}
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h6>{peek.rulesHeading}</h6>
          <ul>
            {peek.rules.map((item) => (
              <li key={item.code}>
                <span className="workshops-sneak-peek__code">{item.code}</span> {item.text}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h6>{peek.beforeClassHeading}</h6>
          <ul>
            {peek.beforeClass.map((item) => (
              <li key={item.code}>
                <span className="workshops-sneak-peek__code">{item.code}</span> {item.text}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h6>{peek.creditsHeading}</h6>
          <p>{peek.creditsIntro}</p>
          <table className="workshops-sneak-peek__credits">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Pricing</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {peek.creditPlans.map((plan) => (
                <tr key={plan.tool}>
                  <td>{plan.tool}</td>
                  <td>{plan.pricing}</td>
                  <td>{plan.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h6>{peek.creditsImportantHeading}</h6>
          <p>{peek.creditsImportantLead}</p>
          <p>Plan for:</p>
          <ul>
            {peek.creditsPlanFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="workshops-sneak-peek__tip">{peek.creditsTip}</p>
          <p className="workshops-sneak-peek__disclaimer">{peek.creditsDisclaimer}</p>
        </section>
      </div>
    </details>
  );
}

type Filter = "all" | WorkshopStatus;

export function WorkshopsHub({
  isLoggedIn = false,
  memberName = "",
  memberEmail = "",
  onGoToJoin,
  onGoToLogin,
}: {
  isLoggedIn?: boolean;
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

  const setRegisterQuery = (workshopId: string | null) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (workshopId) url.searchParams.set("register", workshopId);
    else url.searchParams.delete("register");
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (current !== next) window.history.replaceState(window.history.state, "", next);
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
    setRegisterQuery(workshop.id);
  };

  const closeRegistration = () => {
    setRegisteringFor(null);
    setRegistrationStatus(null);
    setRegisterQuery(null);
  };

  useEffect(() => {
    if (loading || registeringFor) return;
    const wanted = parseWorkshopRegisterParam();
    if (!wanted) return;
    const match = findWorkshopById(wanted, workshops);
    if (match) openRegistration(match);
  }, [loading, workshops]);

  useEffect(() => {
    if (!isLoggedIn) return;
    setRegistrationForm((prev) => ({
      ...prev,
      name: prev.name || memberName,
      email: prev.email || memberEmail,
    }));
  }, [isLoggedIn, memberName, memberEmail]);

  const leaveForJoin = (workshopId: string) => {
    saveWorkshopRegistrationJoinReturn(workshopId);
    onGoToJoin?.();
  };

  const leaveForLogin = (workshopId: string) => {
    saveWorkshopRegistrationJoinReturn(workshopId);
    onGoToLogin?.();
  };

  const handleRegistrationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!registeringFor || !registeringFor.registrationOpen) return;
    if (!workshopRegistrationMemberOk(registeringFor.id, isLoggedIn)) {
      setRegistrationStatus({
        kind: "error",
        message: WORKSHOP_JOIN_OR_SIGN_IN,
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
      const unauthorized = err instanceof ApiError && err.status === 401;
      setRegistrationStatus({
        kind: "error",
        message: unauthorized
          ? WORKSHOP_JOIN_OR_SIGN_IN
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
    const accessLabel = workshopMemberAccessLabel(registeringFor.id);
    const memberOk = workshopRegistrationMemberOk(registeringFor.id, isLoggedIn);
    const formUnlocked = workshopRegistrationFormUnlocked({
      isOpen,
      memberOk,
      submitting: submittingRegistration,
    });
    const eventSpeakers = registeringFor.speakerIds
      .map((id) => speakersById[id])
      .filter(Boolean);

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
                {isOpen ? (isPreReg ? "Pre-Registration Open" : "Registration Open") : "Registration Closed"}
              </span>
              {accessLabel ? <span className="glow-badge free">{accessLabel}</span> : null}
            </div>
            <div className="workshops-title-row">
              <h2>{registeringFor.title}</h2>
              <WorkshopSneakPeekLink
                workshopId={registeringFor.id}
                className="workshops-sneak-peek--page"
              />
            </div>
            <p>{registeringFor.blurb}</p>
            <div className="workshops-card-meta">
              <span>
                <Calendar size={14} /> {registeringFor.date || "TBD"}
              </span>
              <span>
                <Clock size={14} /> {registeringFor.time || "TBD"}
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
                {isOpen
                  ? registeringFor.registrationNote || "Registration is open for this workshop."
                  : registeringFor.registrationNote || "Registration is not open yet. Admins will open this once the date is confirmed."}
              </span>
            </div>
          </article>

          <form className="workshops-registration-form glass" onSubmit={(e) => void handleRegistrationSubmit(e)}>
            <h3>Workshop Registration</h3>
            <p data-testid="workshop-registration-intro">
              {isOpen
                ? memberOk
                  ? "Save your spot for this event."
                  : (
                    <>
                      <strong>{WORKSHOP_FREE_MEMBERSHIP_NEED}</strong>{" "}
                      {workshopMemberGateDirections(registeringFor.id, registeringFor.title)}
                    </>
                  )
                : "Registration fields are previewed here and will unlock when Admin opens registration."}
            </p>
            {registrationStatus && (
              <div className={`workshops-registration-alert is-${registrationStatus.kind}`}>
                {registrationStatus.message}
              </div>
            )}
            {!memberOk && (
              <div className="workshop-member-gate" data-testid="workshop-member-gate">
                <button
                  type="button"
                  className="btn btn-primary"
                  data-testid="workshop-join-free"
                  onClick={() => leaveForJoin(registeringFor.id)}
                >
                  Create a FREE account
                </button>
                {onGoToLogin ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    data-testid="workshop-sign-in"
                    onClick={() => leaveForLogin(registeringFor.id)}
                  >
                    Sign in
                  </button>
                ) : null}
              </div>
            )}
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
                  : registeringFor.status === "waitlist"
                    ? "Join Waitlist"
                    : "Reserve Spot"
                : "Registration Disabled"}
            </button>
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
                alt="Get Your Side Hustle Workshops & Guest Speakers — Learn, Connect, Grow. Practical strategies, live Q&A, real stories, and topics from finding your hustle to scaling and freedom."
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
            on Airbnb, AI agents, Shopify, and apps. Guest experts join throughout the season. Dates are TBD
            until the schedule is confirmed.
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
                className={`workshops-card glass ${w.status === "past" ? "is-past" : ""}`}
              >
                <div className="workshops-card-top">
                  <span className={`glow-badge ${w.status === "upcoming" ? "pink" : w.status === "waitlist" ? "amber" : "purple"}`}>
                    {STATUS_LABELS[w.status]}
                  </span>
                  <span className="glow-badge cyan">{AUDIENCE_LABELS[w.audience]}</span>
                </div>
                <div className="workshops-title-row">
                  <h4>{w.title}</h4>
                  <WorkshopSneakPeekLink workshopId={w.id} />
                </div>
                <p className="workshops-card-blurb">{w.blurb}</p>
                <div className="workshops-card-meta">
                  <span>
                    <Calendar size={14} /> {w.date || "TBD"}
                  </span>
                  <span>
                    <Clock size={14} /> {w.time || "TBD"}
                  </span>
                  <span>
                    {w.format === "In-Person" || w.format === "Hybrid" ? (
                      <MapPin size={14} />
                    ) : (
                      <Video size={14} />
                    )}{" "}
                    {w.format}
                  </span>
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
                  <button
                    type="button"
                    className={w.registrationOpen && w.status !== "past" ? "btn btn-primary" : "btn btn-outline"}
                    onClick={() => openRegistration(w)}
                  >
                    {w.status === "past"
                      ? "View Event"
                      : w.registrationOpen
                        ? w.status === "waitlist"
                          ? "Join Waitlist"
                          : workshopIsPreRegistration(w)
                            ? "Pre-Register"
                            : "Reserve Spot"
                        : "View Registration"}
                  </button>
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
