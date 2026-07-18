import { Heart, Sparkles, Users } from "lucide-react";
import { SITE_NAME } from "../lib/site-config";

export function AboutPage() {
  return (
    <div className="static-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">Our Story</span>
        <h2>Two partners, one mission: make side hustles approachable</h2>
        <p>
          {SITE_NAME} is the <strong>brainchild of Tina Marie Barham</strong> — a vision born from her heart for
          families, kids who glow with confidence, and hustles that feel kind instead of overwhelming. When{" "}
          <strong>Evelyn Irving</strong> saw how phenomenal the idea was, she jumped in to help move it from
          spark to fruition: building the platform, tooling, and launch systems so Tina&apos;s vision could reach
          every age. Together they are educators, builders, and storytellers who believe earning skills should
          feel empowering — not exclusive.
        </p>
      </section>

      <div className="static-page-grid">
        <article className="glass static-page-card">
          <div className="static-page-icon" style={{ background: "var(--grad-crimson)" }}>
            <Heart size={20} color="#fff" />
          </div>
          <h3>Tina — Kids Glow &amp; Kevina Starr</h3>
          <p>
            Tina brings IT classroom experience and the heart behind{" "}
            <em>Kevina Starr Stories</em> — bedtime adventures that teach confidence, kindness, and junior
            earning habits. She leads the Kids Side Hustle Corner, parent safety guides, and family
            workshop nights. GYSH started with her conviction that side hustles can be a family glow-up, not
            just an adult grind.
          </p>
        </article>

        <article className="glass static-page-card">
          <div className="static-page-icon" style={{ background: "var(--grad-primary)" }}>
            <Sparkles size={20} color="var(--charcoal)" />
          </div>
          <h3>Evelyn — Tech &amp; Adult Hustles</h3>
          <p>
            Evelyn architects the GYSH platform, calculators, Get Your Side Hustle, and AI-agent playbooks for adult
            operators. From Airbnb arbitrage to Meta + Shopify creative clinics, she turns complex launch paths
            into step-by-step guides you can actually follow — partnering with Tina to bring the idea to life
            at full scale.
          </p>
        </article>

        <article className="glass static-page-card">
          <div className="static-page-icon" style={{ background: "var(--grad-emerald)" }}>
            <Users size={20} color="#fff" />
          </div>
          <h3>Built together</h3>
          <p>
            Tina dreamed it; Evelyn helped build it. They co-founded {SITE_NAME} to blend family-friendly
            storytelling with serious adult hustle tooling — one brand, earthtone luxury aesthetic, and a
            Testing Portal where both partners QA every release before it ships.
          </p>
        </article>
      </div>
    </div>
  );
}
