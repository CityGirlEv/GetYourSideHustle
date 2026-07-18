import { GraduationCap, Heart, Home, Rocket, Shield, Sparkles, UserPlus, Users } from "lucide-react";
import { FACEBOOK_URL, SITE_NAME } from "../lib/site-config";
import { KEVINA_CHANNEL_HANDLE, KEVINA_CHANNEL_URL } from "../lib/kevina-starr";
import { FacebookIcon } from "./FacebookIcon";
import aboutFounders from "../assets/about-founders-back2back.png";
import aboutTees from "../assets/about-gysh-tees.png";
import aboutTeesCloseup from "../assets/about-gysh-tees-closeup.png";

type AboutPageProps = {
  onJoin?: () => void;
};

export function AboutPage({ onJoin }: AboutPageProps) {
  return (
    <div className="about-page static-page">
      <section className="about-hero-row" aria-label="Meet the GYSH founders">
        <div className="about-hero-media">
          <img
            src={aboutFounders}
            alt="Tina Marie Barham and Evelyn Irving — co-founders of Get Your Side Hustle — standing back to back in tailored suits."
            className="about-hero-img"
            width={800}
            height={1200}
            decoding="async"
          />
        </div>
        <div className="glass about-hero-panel">
          <span className="flat-label flat-label--accent">The GYSH Family Side Hustle Gang</span>
          <h2>Two partners, 60+ years of IT firepower, one mission</h2>
          <p>
            {SITE_NAME} is the <strong>brainchild of Tina Marie Barham</strong> — and <strong>Evelyn Irving</strong> is the build partner who
            helped take it from spark to full platform. Both are educators
            in the field. Both carry <strong>30+ year IT careers</strong>. Both hold undergraduate degrees in
            IT / computer science and master&apos;s degrees (Tina in IT; Evelyn in Software Engineering). And
            both are grandmas who still hustle like the next win is personal.
          </p>
          <p>
            This isn&apos;t a theory brand. It&apos;s <strong>The GYSH Family Side Hustle Gang</strong> — built by
            women who&apos;ve shipped systems, taught the next generation, raised families, and kept earning
            on their own terms. From Kids Corner and Kevina Starr stories to adult Get Your Side Hustle
            tooling and senior-friendly paths, GYSH is for every chapter of life.
          </p>
          <p className="about-hero-tagline" aria-label="Brand pillars">
            <span>Ideas</span>
            <span>Action</span>
            <span>Income</span>
            <span>Freedom</span>
          </p>
          <div className="about-follow-cta">
            {onJoin && (
              <button type="button" className="btn btn-primary" onClick={onJoin}>
                <UserPlus size={16} aria-hidden /> Join the gang
              </button>
            )}
            <a
              href={FACEBOOK_URL}
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon size={16} /> Follow on Facebook
            </a>
          </div>
        </div>
      </section>

      <section className="about-creds-strip glass" aria-label="Founder credentials">
        <div className="about-creds-item">
          <GraduationCap size={18} aria-hidden />
          <div>
            <strong>Degrees that back the build</strong>
            <span>
              Undergrad IT / CS + master&apos;s credentials — Tina in IT, Evelyn in Software Engineering —
              plus decades teaching and shipping in the field.
            </span>
          </div>
        </div>
        <div className="about-creds-item">
          <Shield size={18} aria-hidden />
          <div>
            <strong>Service &amp; grit</strong>
            <span>
              Tina is a disabled retired veteran with years of military service — discipline, resilience, and
              heart that show up in every Kids &amp; family path.
            </span>
          </div>
        </div>
        <div className="about-creds-item">
          <Home size={18} aria-hidden />
          <div>
            <strong>Hustle in real life</strong>
            <span>
              Evelyn&apos;s real estate portfolio spans decades — up to a dozen properties at once — plus
              Shopify storefronts, The Trinity House impact work, and Side Hustles she still runs today.
            </span>
          </div>
        </div>
      </section>

      <section className="about-brand-row" aria-label="GYSH brand and mission">
        <div className="glass about-brand-panel">
          <span className="glow-badge free">
            <Rocket size={13} aria-hidden /> Brand
          </span>
          <h3>Ideas. Action. Income. Freedom.</h3>
          <p>
            That&apos;s the GYSH promise on every tee and every page: start with an idea, take a clear action,
            earn income that fits your life, and grow toward freedom — whether you&apos;re a parent coaching a
            first lemonade stand, a teen building skills, or an adult or senior launching a Side Hustle.
          </p>
          <p>
            Tina dreamed the family glow-up. Evelyn engineered the platform so it could scale. Combined
            that&apos;s six decades of IT experience, two educators who&apos;ve been in the trenches, and a
            rocket logo that means what it says: lift-off with guidance, not gatekeeping.
          </p>
        </div>
        <div className="about-brand-media">
          <img
            src={aboutTees}
            alt="Tina and Evelyn wearing Get Your Side Hustle GYSH t-shirts — Ideas, Action, Income, Freedom — pointing to the logo."
            className="about-brand-img"
            width={1200}
            height={900}
            decoding="async"
          />
        </div>
      </section>

      <section className="about-tees-closeup-row" aria-label="GYSH founders in brand tees">
        <div className="about-tees-closeup-media">
          <img
            src={aboutTeesCloseup}
            alt="Close-up of Tina and Evelyn in GYSH brand t-shirts with the rocket logo and colorful GYSH lettering."
            className="about-tees-closeup-img"
            width={1200}
            height={900}
            decoding="async"
          />
        </div>
        <div className="glass about-tees-closeup-panel">
          <h3>Partners in the &ldquo;Get Your Side Hustle&rdquo;</h3>
          <p>
            Off the stage and in the studio, Tina and Evelyn wear the same mission they teach: show up, point
            to the work, and invite the whole family along. Tina&apos;s crew — <strong>1 son and 2
            grandchildren</strong>. Evelyn&apos;s — <strong>2 daughters and 3 grandchildren</strong>. That&apos;s
            five grandbabies and a whole lot of “watch Grandma hustle” — and one of those grandkids already has{" "}
            <strong>her own Side Hustle</strong>, helping out with <strong>testing</strong> and as a{" "}
            <strong>Virtual Assistant</strong>.
          </p>
          <p>
            They QA every release in the Testing Portal before it ships — with family hands on the keys —
            because The GYSH Family Side Hustle Gang doesn&apos;t send half-baked rockets.
          </p>
        </div>
      </section>

      <div className="static-page-grid">
        <article className="glass static-page-card">
          <div className="static-page-icon" style={{ background: "var(--grad-crimson)" }}>
            <Heart size={20} color="#fff" />
          </div>
          <h3>Tina — Kids Glow, Kevina Starr &amp; Service</h3>
          <p>
            Tina Marie Barham holds an <strong>undergraduate IT degree and a master&apos;s</strong>, with{" "}
            <strong>30+ years in IT</strong> and years as an educator. She&apos;s a{" "}
            <strong>disabled retired veteran</strong> whose military service forged the grit and care behind
            Kids Corner, parent safety guides, and family workshop nights.
          </p>
          <p>
            <strong>Kevina Starr</strong> is Tina&apos;s manifestation — her Glow Getter alter ego and story
            world that turns confidence, kindness, and junior earning into bedtime magic through{" "}
            <em>Kevina Starr Stories</em> and her YouTube channel{" "}
            <a
              href={KEVINA_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="about-inline-link"
            >
              {KEVINA_CHANNEL_HANDLE}
            </a>
            .
          </p>
          <p>
            She&apos;s also a <strong>published children&apos;s book author</strong> and owns an{" "}
            <strong>online Shopify store</strong> — living the Side Hustle life she teaches. Mom of one, grandma
            of two — GYSH started with her conviction that side hustles can be a family glow-up, not just an
            adult grind.
          </p>
        </article>

        <article className="glass static-page-card">
          <div className="static-page-icon" style={{ background: "var(--grad-primary)" }}>
            <Sparkles size={20} color="var(--charcoal)" />
          </div>
          <h3>Evelyn — Software, Side Hustles &amp; Real Estate</h3>
          <p>
            Evelyn Irving brings a <strong>computer science undergrad</strong>, a{" "}
            <strong>master&apos;s in Software Engineering</strong>, <strong>30+ years in IT</strong>, and a
            career as an educator who still builds in public. She&apos;s a{" "}
            <strong>serial Side Hustler</strong> across multiple arenas and owns an{" "}
            <strong>online Shopify store</strong>.
          </p>
          <p>
            Her <strong>real estate portfolio spans decades</strong> — owning{" "}
            <strong>up to a dozen properties simultaneously</strong> — and she remains an active investor and
            landlord today.
          </p>
          <p>
            She&apos;s also <strong>Co-Founder of The Trinity House</strong>, transitional housing serving San
            Diego&apos;s homeless community, recognized with <strong>accolades and awards</strong> for that
            impact work, and featured on the <strong>@TheTrinityHouse YouTube channel</strong>.
          </p>
          <p>
            Mom of two daughters, grandma of three — she architects the GYSH platform, calculators, Match
            Wizard, and AI-agent playbooks so Tina&apos;s vision runs at full scale.
          </p>
        </article>

        <article className="glass static-page-card">
          <div className="static-page-icon" style={{ background: "var(--grad-emerald)" }}>
            <Users size={20} color="#fff" />
          </div>
          <h3>The GYSH Family Side Hustle Gang</h3>
          <p>
            Degrees. Decades. Deployments. Dozen-door real estate runs. The Trinity House. Shopify
            storefronts. YouTube channels. A published children&apos;s book.
          </p>
          <p>
            Daughters, a son, and five grandchildren who see what possible looks like up close — including one
            granddaughter earning her Side Hustle stripes as a <strong>tester</strong> and{" "}
            <strong>Virtual Assistant</strong>.
          </p>
          <p>
            Tina dreamed it; Evelyn helped build it. Together they founded {SITE_NAME} to blend family-friendly
            storytelling with serious hustle tooling — one brand, one rocket, and a Testing Portal where the
            whole gang still signs off before anything ships. Welcome to the gang.
          </p>
        </article>
      </div>
    </div>
  );
}
