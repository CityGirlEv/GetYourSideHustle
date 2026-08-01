import {
  HOME_CTA_EXPECTATION,
  HOME_DIFFERENTIATOR,
  HOME_FAQ,
  HOME_ICP,
  GYSH_METHOD_NAME,
} from "../lib/site-config";

type Props = {
  onJoin: () => void;
};

/** Below-fold positioning, ICP, and FAQ blocks from the Foresight audit. */
export function HomeForesightBlocks({ onJoin }: Props) {
  return (
    <>
      <section
        className="glass home-foresight-position"
        data-testid="home-positioning"
        aria-labelledby="home-positioning-title"
      >
        <p className="home-foresight-position__eyebrow" data-testid="home-method-name">
          The {GYSH_METHOD_NAME} method
        </p>
        <h2 id="home-positioning-title" className="home-foresight-position__title">
          A focused side hustle platform — not another inspiration feed
        </h2>
        <p className="home-foresight-position__lead" data-testid="home-differentiator">
          {HOME_DIFFERENTIATOR}
        </p>
        <ol className="home-foresight-position__steps">
          <li>
            <strong>Match</strong> — age-ready wizards for kids, teens, adults, and seniors.
          </li>
          <li>
            <strong>Measure</strong> — margin calculators that estimate profit before you start.
          </li>
          <li>
            <strong>Move</strong> — guides and community so the next step is clear.
          </li>
        </ol>
        <p className="home-foresight-position__cta-note" data-testid="home-cta-expectation">
          {HOME_CTA_EXPECTATION}
        </p>
        <button type="button" className="btn btn-primary" onClick={onJoin} data-testid="home-positioning-join">
          Join GYSH free
        </button>
      </section>

      <section
        className="glass home-foresight-icp"
        data-testid="home-icp"
        aria-labelledby="home-icp-title"
      >
        <h2 id="home-icp-title" className="home-foresight-icp__title">
          Who GYSH is for?
        </h2>
        <p className="home-foresight-icp__note">
          Going solo or building with family—pick the path that matches your stage, then run the wizard
          built for you.
        </p>
        <ul className="home-foresight-icp__list">
          {HOME_ICP.map((item) => (
            <li key={item.id} data-testid={`home-icp-${item.id}`}>
              <strong>{item.label}</strong>
              <span>{item.problem}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="glass home-foresight-faq"
        data-testid="home-faq"
        aria-labelledby="home-faq-title"
      >
        <h2 id="home-faq-title" className="home-foresight-faq__title">
          Side hustle FAQ
        </h2>
        <div className="home-foresight-faq__list">
          {HOME_FAQ.map((item, i) => (
            <details key={item.q} className="home-foresight-faq__item" data-testid={`home-faq-item-${i}`}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
