import { TRAINING_CIRCLES, type TrainingCircle } from "../lib/training-circles";

type Props = {
  onOpenGuides?: () => void;
  onOpenKids?: () => void;
};

export function TrainingCircles({ onOpenGuides, onOpenKids }: Props) {
  const openCircle = (c: TrainingCircle) => {
    if (c.id === "kids-glow") onOpenKids?.();
    else onOpenGuides?.();
  };

  return (
    <section className="training-circles" style={{ marginTop: 36, marginBottom: 8 }}>
      <div className="training-circles__head">
        <div className="training-circles__titles">
          <h2 className="training-circles__title">GYSH Training Circles</h2>
          <p className="training-circles__lead">
            Cohort-ready tracks from the GYSH partnership — adult hustles, AI agents, build skills, and
            kids/junior glow.
          </p>
        </div>
        <span className="glow-badge pink">T + E</span>
      </div>

      <div className="training-circles__grid">
        {TRAINING_CIRCLES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => openCircle(c)}
            className="glass-card training-circle"
          >
            <div className="training-circle__icon" aria-hidden>
              {c.icon}
            </div>
            <div className="training-circle__badges">
              <span className="glow-badge amber">{c.level}</span>
              <span className="glow-badge cyan">
                {c.audience === "junior" ? "Kids / Teens" : "Adult"}
              </span>
            </div>
            <h3 className="training-circle__name">{c.name}</h3>
            <p className="training-circle__blurb">{c.blurb}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
