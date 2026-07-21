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
import {
  KEVINA_CHANNEL_HANDLE,
  KEVINA_CHANNEL_URL,
  KEVINA_TIKTOK_HANDLE,
  KEVINA_TIKTOK_URL,
} from "../lib/kevina-starr";
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
                {SITE_NAME} began with <strong className="about-em">Tina Marie Barham</strong>&apos;s vision and
                grew into a working platform through her partnership with{" "}
                <strong className="about-em">Evelyn Irving</strong>. Together, they combine decades of experience
                in technology, education, entrepreneurship, service, and community leadership to help people turn
                their skills, interests, and life experience into practical income opportunities.
              </p>
              <p>
                Their paths have crossed repeatedly for more than <strong>30 years</strong> — from graduate and
                doctoral studies to the same IT organization, and later reconnecting through ecommerce, AI, and
                entrepreneurship. Today they&apos;re building{" "}
                <strong className="about-em">The GYSH Family Side Hustle Gang</strong> — from{" "}
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
                to Match Wizard tools, launch guides, workshops, and senior-friendly paths.
              </p>
              <p>
                Their mission is simple: help people find a side hustle that fits their{" "}
                <strong>skills, schedule, season of life, and goals</strong>.
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
                  <strong>Education</strong>
                  <span className="about-creds-pair">
                    <span className="about-creds-line">
                      <strong className="about-em">Tina Marie</strong>: Bachelor&apos;s in Education,
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
                  <strong>Service &amp; leadership</strong>
                  <span className="about-creds-pair">
                    <span className="about-creds-line">
                      <strong className="about-em">Tina Marie</strong>: Disabled U.S. Navy veteran; retired
                      Pentagon IT supervisor; educator, author, and ecommerce entrepreneur
                    </span>
                    <span className="about-creds-line">
                      <strong className="about-em">Evelyn</strong>: Co-founded{" "}
                      <a
                        href={TRINITY_HOUSE_CHANNEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-inline-link"
                      >
                        {TRINITY_HOUSE_NAME}
                      </a>
                      , a San Diego nonprofit; technology professional and platform builder
                    </span>
                  </span>
                </span>
              </li>
              <li>
                <Home size={16} aria-hidden />
                <span>
                  <strong>Entrepreneurship</strong>
                  <span className="about-creds-pair">
                    <span className="about-creds-line">
                      <strong className="about-em">Tina Marie</strong>: Dropshipping, print on demand, digital
                      products, affiliate marketing, publishing, and AI-powered content
                    </span>
                    <span className="about-creds-line">
                      <strong className="about-em">Evelyn</strong>: Real estate landlord &amp; investor (15+
                      doors), Shopify, dropshipping, print on demand, Airbnb co-hosting, and multiple side-hustle
                      models
                    </span>
                  </span>
                </span>
              </li>
              <li>
                <Users size={16} aria-hidden />
                <span>
                  <strong>Paths crossed</strong> — More than three decades from school and doctoral studies to
                  the same IT workplace, then ecommerce, dropshipping, print on demand, digital products, and AI.
                  Different paths kept bringing them back to the same place. This time, they decided to build
                  something together.
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
            <strong className="about-em">Tina Marie</strong> dreamed it;{" "}
            <strong className="about-em">Evelyn</strong> helped turn the vision into a working platform —
            decades of technology, education, and entrepreneurship between them, and one brand for the whole
            crew.
          </p>
          <p>
            That&apos;s the <strong>GYSH</strong> promise on every tee and every page — help people find a
            side hustle that fits their <strong>skills, schedule, season of life, and goals</strong>. Start
            with an <strong>idea</strong>, take <strong>action</strong> with clear next steps, build{" "}
            <strong>income</strong> on your terms, and grow toward the <strong>freedom</strong> you actually
            want.
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
            <strong className="about-em">Tina Marie</strong> is a disabled U.S. Navy veteran who built a federal
            civilian IT career and retired from the Pentagon as an IT supervisor — then reinvented herself as an
            online entrepreneur across ecommerce, dropshipping, print on demand, digital products, affiliate
            marketing, publishing, and AI-powered content creation.
          </p>
          <p>
            <strong className="about-em">Evelyn</strong> brings the technical and operational experience that helped
            transform the original idea into the {SITE_NAME} platform — technology, real estate investing, Shopify,
            dropshipping, print on demand, Airbnb co-hosting, nonprofit leadership, and a wide range of side-hustle
            ventures.
          </p>
          <p>
            Their paths have crossed for more than <strong>30 years</strong>. This time they decided to build{" "}
            <strong className="about-em">The GYSH Family Side Hustle Gang</strong> together — an educational
            community for adults, seniors, teens, children, and families. Same brand pillars for every age:{" "}
            <strong>Ideas. Action. Income. Freedom.</strong>
          </p>
          <p>
            At home, that family is real — <strong className="about-em">Tina Marie</strong> with her{" "}
            <strong>one son</strong> and <strong>two grandsons</strong>,{" "}
            <strong className="about-em">Evelyn</strong> with her <strong>two daughters</strong> and{" "}
            <strong>three grandchildren</strong>. One of those grandkids already helps as a{" "}
            <strong>tester</strong> and <strong>Virtual Assistant</strong>, so the next generation isn&apos;t waiting
            on the sidelines.
          </p>
          <p>
            Before anything ships, it gets family eyes in the <strong>Testing Portal</strong>. That&apos;s the Gang
            promise — clear tools, real next steps, and nothing half-baked.
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
          <h3>Service, Stories &amp; Side Hustles</h3>
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
                <strong className="about-em">Tina Marie Barham</strong> is a disabled{" "}
                <strong>U.S. Navy veteran</strong>, retired <strong>Pentagon IT supervisor</strong>, educator,
                author, and online entrepreneur with more than <strong>30 years</strong> of combined military and
                federal information-technology experience.
              </p>
              <p>
                During her double career as a Navy service member and federal civil servant, Tina Marie held a{" "}
                <strong>Top Secret</strong> security clearance and developed the discipline, leadership, and
                determination that now guide her work with <strong>Get Your Side Hustle</strong>.
              </p>
              <p>
                After retiring from the Pentagon, she began building a new chapter through online entrepreneurship.
                Her experience includes <strong>Shopify</strong>, ecommerce, dropshipping, print on demand, digital
                products, affiliate marketing, publishing, content creation, and{" "}
                <strong>AI-powered business systems</strong>.
              </p>
              <p>
                Tina Marie is also the creator of{" "}
                <strong className="about-em">Kevina Starr</strong>
                <img
                  src={kevinaStarrMark}
                  alt=""
                  className="about-kevina-mark about-kevina-mark--inline"
                  width={22}
                  height={22}
                  decoding="async"
                />
                , the Glow Getter character at the heart of her children&apos;s stories and{" "}
                <a
                  href={KEVINA_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-inline-link"
                >
                  YouTube channel ({KEVINA_CHANNEL_HANDLE})
                </a>{" "}
                and{" "}
                <a
                  href={KEVINA_TIKTOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-inline-link"
                >
                  TikTok ({KEVINA_TIKTOK_HANDLE})
                </a>
                . Through Kevina Starr, Kids Corner, children&apos;s books, and family workshops, she encourages
                children to build confidence, embrace creativity, practice kindness, and learn age-appropriate
                entrepreneurship skills.
              </p>
              <p>
                Married for <strong>37 years</strong>, Tina Marie is the mother of <strong>one son</strong> and
                grandmother of <strong>two boys</strong>. She believes side hustles can become a{" "}
                <strong>family growth experience</strong> — helping adults, seniors, teens, and children discover
                new skills, build confidence, and create additional possibilities together.
              </p>
              <p>
                Tina Marie brings the service, stories, practical experience, and encouraging push that make
                starting something new feel possible.
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
              <strong className="about-em">Tina Marie</strong> dreamed it;{" "}
              <strong className="about-em">Evelyn</strong> helped build it — Navy service and Pentagon IT plus
              real estate, Shopify,{" "}
              <a
                href={TRINITY_HOUSE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="about-inline-link"
              >
                {TRINITY_HOUSE_NAME}
              </a>
              , Kevina Starr stories, and the tools that turn ideas into income.
            </p>
            <p>
              Tina Marie brings the vision and the family glow; Evelyn brings the build and the Side Hustle ops.
              Kids Corner, adult tools, senior-friendly paths, workshops, and the Testing Portal all grow from that
              same handshake — two educators, two grandmas, one Gang.
            </p>
            <p>
              Five grandchildren are watching up close — and{" "}
              <strong className="about-em">Evelyn</strong>&apos;s <strong>15-year-old granddaughter</strong> already
              helps as a <strong>tester</strong> and <strong>Virtual Assistant</strong>. One brand, one rocket, and a{" "}
              <strong>Testing Portal</strong> where the family still signs off before anything ships.
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
                <strong className="about-em">Evelyn Irving</strong> is a software professional, educator, real
                estate investor, and serial side hustler with more than <strong>30 years</strong> of experience in
                information technology and a lifelong passion for building practical solutions.
              </p>
              <p>
                Her entrepreneurial experience spans <strong>Shopify</strong>, ecommerce, real estate, and property
                investing — including ownership and management of more than <strong>15 doors</strong>.
              </p>
              <p>
                Evelyn also co-founded{" "}
                <a
                  href={TRINITY_HOUSE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-inline-link"
                >
                  {TRINITY_HOUSE_NAME}
                </a>{" "}
                in San Diego with her late husband, <strong>Glen Jackson</strong>, during their{" "}
                <strong>28 years</strong> together. Although that chapter has ended, she continues sharing its story
                through{" "}
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
                As a mother of <strong>two daughters</strong> and grandmother of <strong>three</strong>, Evelyn brings
                both technical expertise and family-centered purpose to {SITE_NAME}. She develops the systems that
                help turn <strong className="about-em">Tina Marie</strong>&apos;s vision into a working platform —
                including the GYSH Match Wizard, calculators, AI-agent playbooks, and practical business tools.
              </p>
              <p>
                Her focus is simple: create clear resources, real next steps, and technology that helps people move
                from idea to action with confidence. Evelyn turns complex technology into practical tools that
                families can actually use, understand, and grow with.
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
