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
    <section style={{ marginTop: 36, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: "1.85rem", color: "var(--charcoal)", marginBottom: 6 }}>GYSH Training Circles</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: 640, fontSize: "0.95rem" }}>
            Cohort-ready tracks from the GYSH partnership — adult hustles, AI agents, build skills, and kids/junior glow.
          </p>
        </div>
        <span className="glow-badge pink">T + E</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {TRAINING_CIRCLES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => openCircle(c)}
            className="glass-card training-circle"
            style={{
              padding: 20,
              textAlign: "left",
              cursor: "pointer",
              borderTop: `4px solid ${c.accent}`,
              background: "linear-gradient(180deg, #fff 0%, rgba(215,198,151,0.22) 100%)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: 12,
                background: `radial-gradient(circle at 30% 30%, #fff, ${c.accent}55)`,
                border: `2px solid ${c.accent}`,
                boxShadow: `0 8px 20px ${c.accent}44`,
              }}
            >
              {c.icon}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="glow-badge amber">{c.level}</span>
              <span className="glow-badge cyan">{c.audience === "junior" ? "Kids / Teens" : "Adult"}</span>
            </div>
            <h3 style={{ fontSize: "1.15rem", color: "var(--charcoal)", marginBottom: 6 }}>{c.name}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.blurb}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
