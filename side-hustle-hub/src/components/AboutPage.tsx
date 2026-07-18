import { GraduationCap, Home, Rocket, Shield, UserPlus, Users } from "lucide-react";
import { FACEBOOK_URL, SITE_NAME } from "../lib/site-config";
import { KEVINA_CHANNEL_HANDLE, KEVINA_CHANNEL_URL } from "../lib/kevina-starr";
import { FacebookIcon } from "./FacebookIcon";
import aboutFounders from "../assets/about-founders-back2back.png";
import aboutTinaHeadshot from "../assets/about-tina-headshot.png";
import aboutEvelynHeadshot from "../assets/about-evelyn-headshot.png";
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
          <div className="about-hero-names" aria-hidden="true">
            <span className="about-hero-name about-hero-name--tina">Tina Marie</span>
            <span className="about-hero-name about-hero-name--evelyn">Evelyn</span>
          </div>
        </div>
        <div className="about-hero-side">
          <div className="glass about-hero-panel">
            <div className="about-hero-copy">
              <span className="flat-label flat-label--accent">The GYSH Family Side Hustle Gang</span>
              <h2>Two partners. One mission. Decades of grit.</h2>
              <p>
                {SITE_NAME} is the brainchild of <strong className="about-em">Tina Marie Barham</strong>, with{" "}
                <strong className="about-em">Evelyn Irving</strong> as the build partner who took it from spark to
                platform. Both are <strong>educators</strong> and <strong>grandmas</strong> with{" "}
                <strong>30+ year IT careers</strong> who still hustle like the next win is personal.
              </p>
              <p>
                Their paths have kept crossing for <strong>30+ years</strong> — first in school{" "}
                <strong>pursuing their Ph.D.s</strong>, then when they <strong>wound up at the same IT job</strong>.
                That shared history is why they build{" "}
                <strong className="about-em">The GYSH Family Side Hustle Gang</strong> together — from{" "}
                <strong>Kids Corner</strong> and <strong className="about-em">Kevina Starr</strong> to adult tooling
                and senior-friendly paths.
              </p>
            </div>
            <p className="about-hero-tagline" aria-label="Brand pillars">
              <span>Ideas</span>
              <span>Action</span>
              <span>Income</span>
              <span>Freedom</span>
            </p>
          </div>

          <div className="glass about-creds-panel">
            <ul className="about-creds-list" aria-label="Founder credentials">
              <li>
                <GraduationCap size={16} aria-hidden />
                <span>
                  <strong>Degrees</strong> — IT / CS undergrads; Master&apos;s in{" "}
                  <strong className="about-em">IT</strong> (Tina) &amp;{" "}
                  <strong className="about-em">Software Engineering</strong> (Evelyn)
                </span>
              </li>
              <li>
                <Shield size={16} aria-hidden />
                <span>
                  <strong>Service</strong> — Tina, disabled retired veteran; military grit in every Kids &amp;
                  family path
                </span>
              </li>
              <li>
                <Home size={16} aria-hidden />
                <span>
                  <strong>Hustle</strong> — Evelyn&apos;s real estate (up to a dozen doors), Shopify, Trinity House
                  &amp; Side Hustles
                </span>
              </li>
              <li>
                <Users size={16} aria-hidden />
                <span>
                  <strong>Paths crossed</strong> — 30+ years from Ph.D. school days to the same IT job
                </span>
              </li>
            </ul>
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
        </div>
      </section>

      <section className="about-brand-row" aria-label="GYSH brand and mission">
        <div className="glass about-brand-panel">
          <span className="glow-badge free">
            <Rocket size={13} aria-hidden /> Brand
          </span>
          <h3>Ideas. Action. Income. Freedom.</h3>
          <p>
            That&apos;s the <strong>GYSH</strong> promise on every tee and every page — for parents, teens,
            adults, and seniors launching a <strong>Side Hustle</strong>.
          </p>
          <ul className="about-compact-list">
            <li>
              <strong>Idea</strong> → start with something that fits your life
            </li>
            <li>
              <strong>Action</strong> → clear next steps, not gatekeeping
            </li>
            <li>
              <strong>Income</strong> → earn on your terms
            </li>
            <li>
              <strong>Freedom</strong> → grow the life you want
            </li>
            <li>
              <strong className="about-em">Tina</strong> dreamed the family glow-up;{" "}
              <strong className="about-em">Evelyn</strong> engineered the platform —{" "}
              <strong>six decades of IT</strong> between them
            </li>
          </ul>
        </div>
        <div className="about-brand-media">
          <img
            src={aboutTeesCloseup}
            alt="Illustrated collage of Tina and Evelyn in Get Your Side Hustle GYSH caps and tees — portrait bubbles, chest-up sticker, and full-body poses pointing to their heads."
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
            src={aboutTees}
            alt="Tina and Evelyn wearing Get Your Side Hustle GYSH t-shirts — Ideas, Action, Income, Freedom — pointing to the logo."
            className="about-tees-closeup-img"
            width={1200}
            height={900}
            decoding="async"
          />
        </div>
        <div className="glass about-tees-closeup-panel">
          <h3>Partners in the &ldquo;Get Your Side Hustle&rdquo;</h3>
          <p>
            Off the stage and in the studio, <strong className="about-em">Tina</strong> and{" "}
            <strong className="about-em">Evelyn</strong> wear the same mission they teach: show up, point to the
            work, and invite the whole family along.
          </p>
          <ul className="about-compact-list">
            <li>
              <strong className="about-em">Tina</strong> — <strong>1 son</strong> and{" "}
              <strong>2 grandchildren</strong>
            </li>
            <li>
              <strong className="about-em">Evelyn</strong> — <strong>2 daughters</strong> and{" "}
              <strong>3 grandchildren</strong>
            </li>
            <li>
              One grandkid already runs her own <strong>Side Hustle</strong> as a <strong>tester</strong> and{" "}
              <strong>Virtual Assistant</strong>
            </li>
            <li>
              Every release gets family eyes in the <strong>Testing Portal</strong> —{" "}
              <strong className="about-em">The GYSH Family Side Hustle Gang</strong> doesn&apos;t ship
              half-baked rockets
            </li>
          </ul>
        </div>
      </section>

      <div className="static-page-grid about-bio-grid">
        <article className="glass static-page-card about-bio-card">
          <header className="about-bio-card__head">
            <img
              src={aboutTinaHeadshot}
              alt="Tina Marie Barham"
              className="about-bio-headshot about-bio-headshot--tina"
              width={96}
              height={96}
              decoding="async"
            />
            <h3>Tina — Kids Glow, Kevina Starr &amp; Service</h3>
          </header>
          <p>
            <strong className="about-em">Tina Marie Barham</strong> — <strong>IT</strong> undergrad,{" "}
            <strong>Master&apos;s Degree</strong>, <strong>30+ years in IT</strong>, educator, and{" "}
            <strong>disabled retired veteran</strong> whose <strong>military service</strong> forged the grit
            behind <strong>Kids Corner</strong> and family workshop nights.
          </p>
          <ul className="about-compact-list">
            <li>
              <strong className="about-em">Kevina Starr</strong> / <strong>Glow Getter</strong> stories + YouTube{" "}
              <a
                href={KEVINA_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="about-inline-link"
              >
                {KEVINA_CHANNEL_HANDLE}
              </a>
            </li>
            <li>
              Published children&apos;s book author + <strong>Shopify</strong> storefront
            </li>
            <li>
              Mom of one, grandma of two — Side Hustles as a <strong>family glow-up</strong>
            </li>
          </ul>
        </article>

        <article className="glass static-page-card about-bio-card">
          <header className="about-bio-card__head">
            <img
              src={aboutEvelynHeadshot}
              alt="Evelyn Irving"
              className="about-bio-headshot about-bio-headshot--evelyn"
              width={96}
              height={96}
              decoding="async"
            />
            <h3>Evelyn — Software, Side Hustles &amp; Real Estate</h3>
          </header>
          <p>
            <strong className="about-em">Evelyn Irving</strong> — <strong>Computer Science</strong> undergrad,{" "}
            <strong>Master&apos;s in Software Engineering</strong>, <strong>30+ years in IT</strong>, and an{" "}
            <strong>educator</strong> who still builds in public.
          </p>
          <ul className="about-compact-list">
            <li>
              Serial <strong>Side Hustler</strong> + <strong>Shopify</strong> storefront
            </li>
            <li>
              <strong>Real estate</strong> for decades — up to a <strong>dozen properties</strong> at once
            </li>
            <li>
              Co-Founder of <strong>The Trinity House</strong> (San Diego) +{" "}
              <strong>@TheTrinityHouse</strong> YouTube
            </li>
            <li>
              Mom of two, grandma of three — builds Match Wizard, calculators, and{" "}
              <strong>AI-agent</strong> playbooks so <strong className="about-em">Tina</strong>&apos;s vision
              scales
            </li>
          </ul>
        </article>

        <article className="glass static-page-card">
          <div className="static-page-icon" style={{ background: "var(--grad-emerald)" }}>
            <Users size={20} color="#fff" />
          </div>
          <h3>The GYSH Family Side Hustle Gang</h3>
          <p>
            <strong className="about-em">Tina</strong> dreamed it;{" "}
            <strong className="about-em">Evelyn</strong> helped build it — family storytelling plus serious hustle
            tooling.
          </p>
          <ul className="about-compact-list">
            <li>
              <strong>Degrees</strong>, decades, deployments, and dozen-door <strong>real estate</strong>
            </li>
            <li>
              <strong>The Trinity House</strong>, <strong>Shopify</strong>, YouTube, a children&apos;s book
            </li>
            <li>
              Five grandchildren watching up close — one already a <strong>tester</strong> /{" "}
              <strong>Virtual Assistant</strong>
            </li>
            <li>
              One brand, one rocket, and a <strong>Testing Portal</strong> where the gang still signs off
              before anything ships
            </li>
          </ul>
        </article>
      </div>
    </div>
  );
}
