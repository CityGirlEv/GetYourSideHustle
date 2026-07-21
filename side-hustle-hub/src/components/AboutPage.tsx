import {
  Banknote,
  GraduationCap,
  Heart,
  Home,
  Lightbulb,
  Rocket,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { FACEBOOK_URL, SITE_NAME } from "../lib/site-config";
import { KEVINA_CHANNEL_HANDLE, KEVINA_CHANNEL_URL } from "../lib/kevina-starr";
import {
  TRINITY_HOUSE_CHANNEL_URL,
  TRINITY_HOUSE_HANDLE,
  TRINITY_HOUSE_NAME,
} from "../lib/trinity-house";
import { FacebookIcon } from "./FacebookIcon";
import aboutFounders from "../assets/about-founders-back2back.png";
import aboutTinaHeadshot from "../assets/about-tina-headshot.png";
import aboutEvelynHeadshot from "../assets/about-evelyn-headshot.png";
import kevinaStarrMark from "../assets/kevina-starr-logo.png";
import aboutTees from "../assets/about-gysh-tees.png";
import aboutTeesCloseup from "../assets/about-gysh-tees-closeup.png";
import aboutTeesCollage from "../assets/about-gysh-tees-collage.png";
import aboutGangTees from "../assets/about-gysh-gang-tees.png";

type AboutPageProps = {
  onJoin?: () => void;
  onOpenKids?: () => void;
};

export function AboutPage({ onJoin, onOpenKids }: AboutPageProps) {
  return (
    <div className="about-page static-page">
      <section className="about-hero-row" aria-label="Meet the GYSH founders">
        <div className="about-hero-media">
          <div className="about-hero-photo">
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
        </div>

        <div className="about-hero-side">
          <div className="glass about-hero-panel">
            <div className="about-hero-copy">
              <span className="glow-badge purple">
                <Users size={13} aria-hidden /> Founders
              </span>
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
                {onOpenKids ? (
                  <button type="button" className="about-inline-link about-inline-link--btn" onClick={onOpenKids}>
                    Kids Corner
                  </button>
                ) : (
                  <strong>Kids Corner</strong>
                )}{" "}
                and{" "}
                <a
                  href={KEVINA_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-inline-link about-em"
                >
                  Kevina Starr
                </a>{" "}
                to adult tooling and senior-friendly paths.
              </p>
            </div>
          </div>

          <div className="glass about-creds-panel">
            <span className="glow-badge amber">
              <GraduationCap size={13} aria-hidden /> Credentials
            </span>
            <ul className="about-creds-list" aria-label="Founder credentials">
              <li>
                <GraduationCap size={16} aria-hidden />
                <span>
                  <strong>Degrees</strong>
                  <span className="about-creds-pair">
                    <span className="about-creds-line">
                      <strong className="about-em">Tina</strong>: Bachelor&apos;s in Education,
                      Master&apos;s in Software Engineering
                    </span>
                    <span className="about-creds-line">
                      <strong className="about-em">Evelyn</strong>: Bachelor&apos;s in Computer Science,
                      Master&apos;s in Software Engineering
                    </span>
                  </span>
                </span>
              </li>
              <li>
                <Shield size={16} aria-hidden />
                <span>
                  <strong>Service</strong>
                  <span className="about-creds-pair">
                    <span className="about-creds-line">
                      <strong className="about-em">Evelyn</strong>: Co-Founded{" "}
                      <a
                        href={TRINITY_HOUSE_CHANNEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-inline-link"
                      >
                        {TRINITY_HOUSE_NAME}
                      </a>
                      , a San Diego non-profit that ran its course
                    </span>
                    <span className="about-creds-line">
                      <strong className="about-em">Tina</strong>: Disabled retired veteran; military
                      grit in every Kids &amp; family path
                    </span>
                  </span>
                </span>
              </li>
              <li>
                <Home size={16} aria-hidden />
                <span>
                  <strong>The Grind</strong>
                  <span className="about-creds-pair">
                    <span className="about-creds-line">
                      <strong className="about-em">Tina</strong>: Career Military Veteran (disabled)
                      and 2nd Civil Servant career
                    </span>
                    <span className="about-creds-line">
                      <strong className="about-em">Evelyn</strong>: Real Estate Landlord &amp; Investor,
                      15+ doors, Shopify, Dropshipping, Print on Demand, Airbnb Co-Host,{" "}
                      <a
                        href={TRINITY_HOUSE_CHANNEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-inline-link"
                      >
                        {TRINITY_HOUSE_NAME}
                      </a>{" "}
                      &amp; Side Hustles
                    </span>
                  </span>
                </span>
              </li>
              <li>
                <Users size={16} aria-hidden />
                <span>
                  <strong>Paths crossed</strong> — Destiny keeps crossing our paths tracing 30+ years
                  back, from Ph.D. school days, to the same IT job, to another energy infusion in
                  Ecom, Dropshipping, Print on Demand and The AI space — and here we are again.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="about-follow-cta about-follow-cta--under-photo">
          {onJoin && (
            <button type="button" className="btn btn-primary" onClick={onJoin}>
              <UserPlus size={16} aria-hidden /> Join The Gang
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

        <p className="about-hero-tagline" aria-label="Brand pillars">
          <span className="about-hero-tag about-hero-tag--ideas">
            <Lightbulb size={14} aria-hidden /> Ideas
          </span>
          <span className="about-hero-tag about-hero-tag--action">
            <Zap size={14} aria-hidden /> Action
          </span>
          <span className="about-hero-tag about-hero-tag--income">
            <Banknote size={14} aria-hidden /> Income
          </span>
          <span className="about-hero-tag about-hero-tag--freedom">
            <Sparkles size={14} aria-hidden /> Freedom
          </span>
        </p>
      </section>

      <section className="about-brand-row" aria-label="GYSH brand and mission">
        <div className="glass about-brand-panel">
          <span className="glow-badge free">
            <Rocket size={13} aria-hidden /> Brand
          </span>
          <h3>Ideas. Action. Income. Freedom.</h3>
          <p>
            <strong className="about-em">Tina</strong> dreamed the family glow-up;{" "}
            <strong className="about-em">Evelyn</strong> engineered the platform —{" "}
            <strong>six decades of IT</strong> between them, and one brand built for the whole crew.
          </p>
          <p>
            That&apos;s the <strong>GYSH</strong> promise on every tee and every page — for parents, teens,
            adults, and seniors launching a <strong>Side Hustle</strong>. Start with an{" "}
            <strong>idea</strong> that fits your life, take <strong>action</strong> with clear next steps
            instead of gatekeeping, build <strong>income</strong> on your terms, and grow toward the{" "}
            <strong>freedom</strong> you actually want.
          </p>
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
          <span className="glow-badge pink">
            <Heart size={13} aria-hidden /> The Partners
          </span>
          <h3>Partners in the &ldquo;Get Your Side Hustle&rdquo;</h3>
          <p>
            Off the stage and in the studio, <strong className="about-em">Tina</strong> and{" "}
            <strong className="about-em">Evelyn</strong> wear the same mission they teach: show up, point to the
            work, and invite the whole family along.
          </p>
          <p>
            They didn&apos;t build <strong>GYSH</strong> because Side Hustles were trendy. They built it because
            too many good people get stuck between a dream and a blank page — kids with big ideas, parents juggling
            two jobs, adults restarting mid-career, and seniors who still have plenty of hustle left.{" "}
            <strong className="about-em">Tina</strong> dreamed a place where the whole crew could start without
            shame or gatekeeping. <strong className="about-em">Evelyn</strong> helped turn that spark into a
            platform with Match Wizard paths, guides, workshops, and tools that actually move you forward.
          </p>
          <p>
            What each brings is different on purpose. <strong className="about-em">Tina</strong> leads with heart,
            storytelling, Kids Corner energy, and the{" "}
            <strong className="about-em">Kevina Starr</strong> / Glow Getter spirit — the cheer and clarity that
            make starting feel doable for families. <strong className="about-em">Evelyn</strong> brings builder
            muscle: decades of IT, Side Hustle practice from Shopify and Print on Demand to Real Estate, and the
            platform thinking that keeps GYSH useful after the motivation fades. Together they&apos;re not a
            brand committee — they&apos;re partners who&apos;ve been crossing paths for <strong>30+ years</strong>{" "}
            and finally put the friendship to work for everyone else.
          </p>
          <p>
            At home, that family is real — <strong className="about-em">Tina</strong> with her{" "}
            <strong>1 son</strong> and <strong>2 grandchildren</strong>,{" "}
            <strong className="about-em">Evelyn</strong> with her <strong>2 daughters</strong> and{" "}
            <strong>3 grandchildren</strong>. One of those grandkids already runs her own{" "}
            <strong>Side Hustle</strong> as a <strong>tester</strong> and <strong>Virtual Assistant</strong>,
            so the next generation isn&apos;t waiting on the sidelines.
          </p>
          <p>
            <strong>GYSH</strong> is for kids through seniors — parents coaching little ones, teens learning
            money skills, adults stacking income on nights and weekends, and 55+ members building flexible second
            chapters. Same brand pillars for every age: <strong>Ideas. Action. Income. Freedom.</strong> Clear
            steps, real tools, and a crew that actually shows up.
          </p>
          <p>
            Before anything ships, it gets family eyes in the <strong>Testing Portal</strong>. That&apos;s{" "}
            <strong className="about-em">The GYSH Family Side Hustle Gang</strong> promise — we don&apos;t send
            half-baked rockets into the world.
          </p>
        </div>
      </section>

      <div className="static-page-grid about-bio-grid">
        <article className="glass static-page-card about-bio-card about-bio-card--wrap">
          <div className="about-bio-card__badge-row">
            <span className="glow-badge purple">Tina Marie</span>
            <a
              href={KEVINA_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Kevina Starr on YouTube"
            >
              <img
                src={kevinaStarrMark}
                alt="Kevina Starr"
                className="about-kevina-mark"
                width={28}
                height={28}
                decoding="async"
              />
            </a>
          </div>
          <h3>Kids Glow, Kevina Starr &amp; Service</h3>
          <div className="about-bio-card__body">
            <div className="about-bio-card__copy">
              <img
                src={aboutTinaHeadshot}
                alt="Tina Marie Barham"
                className="about-bio-headshot about-bio-headshot--tina"
                width={128}
                height={128}
                decoding="async"
              />
              <div className="about-bio-degrees" aria-label="Tina degrees">
                <span className="about-creds-line">
                  Bachelor&apos;s in <strong className="about-em">Education</strong>
                </span>
                <span className="about-creds-line">
                  Master&apos;s in <strong className="about-em">Software Engineering</strong>
                </span>
              </div>
              <p>
                <strong>30+ years in IT</strong>, educator, and <strong>Disabled retired veteran</strong> who held a{" "}
                <strong>Top Secret clearance</strong> and built a <strong>double career</strong> as a{" "}
                <strong>military</strong> and <strong>civil servant</strong>. That service forged the grit behind{" "}
                <strong>Kids Corner</strong> and family workshop nights — structure without scolding, and a belief
                that every age deserves a clear next step.
              </p>
              <p>
                She&apos;s been <strong>married for 38 years</strong>. Mom of <strong>1 son</strong> and{" "}
                <strong>2 grandkids</strong>, and she brings{" "}
                <strong className="about-em">Kevina Starr</strong> / <strong>Glow Getter</strong>
                <img
                  src={kevinaStarrMark}
                  alt=""
                  className="about-kevina-mark about-kevina-mark--inline"
                  width={22}
                  height={22}
                  decoding="async"
                />{" "}
                stories to YouTube on the{" "}
                <a
                  href={KEVINA_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-inline-link"
                >
                  Kevina Starr channel ({KEVINA_CHANNEL_HANDLE})
                </a>
                , writes children&apos;s books, runs a <strong>Shopify</strong> storefront, and treats Side Hustles as a{" "}
                <strong>family glow-up</strong> for the whole crew — workshops, Kids Corner nights, and the kind of
                practical cheer that makes starting feel doable.
              </p>
              <p>
                On GYSH, Tina is the why-maker: the dream for kids, teens, parents, and seniors to hustle together
                without waiting for permission. She keeps the brand warm, the workshops human, and the mission
                pointed at real families — not hustle-bro noise.
              </p>
            </div>
          </div>
        </article>

        <article className="glass static-page-card about-bio-card about-bio-card--gang">
          <div className="about-bio-card__badge-row">
            <span className="glow-badge free">
              <Users size={13} aria-hidden /> The GYSH GANG
            </span>
          </div>
          <h3>The GYSH Family Side Hustle Gang</h3>
          <div className="about-bio-card__body">
            <p>
              <strong className="about-em">Tina</strong> dreamed it;{" "}
              <strong className="about-em">Evelyn</strong> helped build it — family storytelling plus serious hustle
              tooling. Between them you get <strong>degrees</strong>, decades, deployments,{" "}
              <strong>Real Estate Landlord &amp; Investor</strong> (15+ doors),{" "}
              <a
                href={TRINITY_HOUSE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="about-inline-link"
              >
                {TRINITY_HOUSE_NAME}
              </a>
              , <strong>Shopify</strong>, YouTube, and a children&apos;s book.
            </p>
            <p>
              The partnership tone is simple: Tina brings the vision and the family glow; Evelyn brings the build
              and the Side Hustle ops. Neither one is window dressing. Kids Corner, adult tools, senior-friendly
              paths, workshops, and the Testing Portal all grow from that same handshake — two educators, two
              grandmas, one Gang.
            </p>
            <p>
              Five grandchildren are watching up close — and{" "}
              <strong className="about-em">Evelyn</strong>&apos;s <strong>15-year-old granddaughter</strong> is already
              a <strong>worker bee</strong>, acting as a <strong>Virtual Assistant</strong> for the gang. One brand, one
              rocket, and a <strong>Testing Portal</strong> where the family still signs off before anything ships.
            </p>
            <img
              src={aboutGangTees}
              alt="Tina and Evelyn in Get Your Side Hustle GYSH caps and tees — Ideas, Action, Income, Freedom."
              className="about-bio-gang-photo"
              width={1024}
              height={512}
              decoding="async"
            />
          </div>
        </article>

        <article className="glass static-page-card about-bio-card about-bio-card--wrap">
          <div className="about-bio-card__badge-row">
            <span className="glow-badge purple">
              <Rocket size={13} aria-hidden /> Evelyn
            </span>
          </div>
          <h3>Software, Side Hustles &amp; Real Estate</h3>
          <div className="about-bio-card__body">
            <div className="about-bio-card__copy">
              <img
                src={aboutEvelynHeadshot}
                alt="Evelyn Irving"
                className="about-bio-headshot about-bio-headshot--evelyn"
                width={128}
                height={128}
                decoding="async"
              />
              <div className="about-bio-degrees" aria-label="Evelyn degrees">
                <span className="about-creds-line">
                  Bachelor&apos;s in <strong className="about-em">Computer Science</strong>
                </span>
                <span className="about-creds-line">
                  Master&apos;s in <strong className="about-em">Software Engineering</strong>
                </span>
              </div>
              <p>
                <strong>30+ years in IT</strong>, and an <strong>educator</strong> who still builds in public.
                She&apos;s a serial <strong>Side Hustler</strong> with a <strong>Shopify</strong> storefront and decades
                as a <strong>Real Estate Landlord &amp; Investor</strong> (<strong>15+ doors</strong>), plus Dropshipping,
                Print on Demand, and Airbnb Co-Host work from the same builder habit. With her late husband{" "}
                <strong>Glen Jackson</strong> — <strong>28 years</strong> together — she Co-Founded{" "}
                <a
                  href={TRINITY_HOUSE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-inline-link"
                >
                  {TRINITY_HOUSE_NAME}
                </a>{" "}
                in San Diego. That chapter ran its course, and she still shares the story on{" "}
                <a
                  href={TRINITY_HOUSE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-inline-link"
                >
                  {TRINITY_HOUSE_HANDLE}
                </a>{" "}
                on YouTube.
              </p>
              <p>
                Mom of <strong>2 girls</strong> and grandma of <strong>3 grandchildren</strong>, she turns that same
                builder energy into Match Wizard, calculators, and <strong>AI-agent</strong> playbooks so{" "}
                <strong className="about-em">Tina</strong>&apos;s vision scales — clear tools, real next steps, and a
                platform the whole family can grow with.
              </p>
              <p>
                On GYSH, Evelyn is the how-maker: the partner who takes Tina&apos;s dream and turns it into screens,
                flows, and Side Hustle tooling kids through seniors can actually use — without pretending the grind
                is glamorous.
              </p>
            </div>
          </div>
        </article>
      </div>

      <section className="about-tees-collage-row" aria-label="GYSH brand tees photoshoot">
        <div className="about-tees-collage-media">
          <img
            src={aboutTeesCollage}
            alt="Tina and Evelyn in Get Your Side Hustle GYSH caps and tees — studio portraits, high-fives, and matching brand looks."
            className="about-tees-collage-img"
            width={1024}
            height={768}
            decoding="async"
          />
        </div>
      </section>
    </div>
  );
}
