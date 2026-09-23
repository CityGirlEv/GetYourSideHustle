import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, MapPin, Mic2, Users, Video } from "lucide-react";
import {
  AUDIENCE_LABELS,
  STATUS_LABELS,
  fetchWorkshops,
  submitWorkshopRegistration,
  type GuestSpeaker,
  type Workshop,
  type WorkshopStatus,
  type WorkshopAudience,
} from "../lib/workshops";
import workshopsHero from "../assets/workshops-hero.png";

type Filter = "all" | WorkshopStatus;

export function WorkshopsHub() {
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

  const openRegistration = (workshop: Workshop) => {
    setRegisteringFor(workshop);
    setRegistrationStatus(null);
    setRegistrationForm({
      name: "",
      email: "",
      phone: "",
      attendeeCount: 1,
      notes: "",
    });
  };

  const handleRegistrationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!registeringFor || !registeringFor.registrationOpen) return;
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
      setRegistrationStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Registration failed. Please try again.",
      });
    } finally {
      setSubmittingRegistration(false);
    }
  };

  if (registeringFor) {
    const isOpen = registeringFor.registrationOpen && registeringFor.status !== "past";
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
            <span className={`glow-badge ${isOpen ? "emerald" : "amber"}`}>
              {isOpen ? "Registration Open" : "Registration Closed"}
            </span>
            <h2>{registeringFor.title}</h2>
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
            <p>
              {isOpen
                ? "Save your spot for this event."
                : "Registration fields are previewed here and will unlock when Admin opens registration."}
            </p>
            {registrationStatus && (
              <div className={`workshops-registration-alert is-${registrationStatus.kind}`}>
                {registrationStatus.message}
              </div>
            )}
            <fieldset disabled={!isOpen || submittingRegistration}>
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
                <h4>{w.title}</h4>
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
                  {w.tags.map((t) => (
                    <span key={t} className="glow-badge purple">
                      {t}
                    </span>
                  ))}
                </div>
                <div className={`workshops-registration-chip ${w.registrationOpen ? "is-open" : "is-closed"}`}>
                  {w.registrationOpen && w.status !== "past" ? "Registration open" : "Registration closed"}
                </div>
                {w.status !== "past" && (
                  <button
                    type="button"
                    className={w.registrationOpen ? "btn btn-primary" : "btn btn-outline"}
                    style={{ width: "100%", marginTop: 12 }}
                    onClick={() => openRegistration(w)}
                  >
                    {w.registrationOpen
                      ? w.status === "waitlist"
                        ? "Join Waitlist"
                        : "Reserve Spot"
                      : "View Registration"}
                  </button>
                )}
                {w.status === "past" && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: "100%", marginTop: 12 }}
                    onClick={() => openRegistration(w)}
                  >
                    View Event
                  </button>
                )}
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
