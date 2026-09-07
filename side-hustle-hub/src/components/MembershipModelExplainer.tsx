import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import {
  CREDITS_AND_CONSULTING_BLURB,
  NO_PLUS_PLAN_NOTE,
  NOW_VS_COMING_SOON_BLURB,
  TIER_LADDER_GLOSSARY,
} from "../lib/guide-access";
import { MEMBERSHIP_COMPARE_ROWS } from "../lib/membership";

type MembershipModelExplainerProps = {
  "data-testid"?: string;
  heading?: string;
  /** When true, show the compact includes/locked comparison table (Beta Credits + Join). */
  showCompareTable?: boolean;
  /** Join / Membership: collapse the glossary behind Show / Hide. */
  collapsible?: boolean;
  /** When collapsible, start expanded. Join starts collapsed. */
  defaultOpen?: boolean;
};

/**
 * Site-wide membership / payment explainer — four plans only, credits vs packs vs
 * consulting, and available-now vs Coming soon. Used on Membership and Beta Credits.
 */
export function MembershipModelExplainer({
  "data-testid": testId = "membership-tier-glossary",
  heading = "Four plans: Free, Starter, Pro, Elite",
  showCompareTable = true,
  collapsible = false,
  defaultOpen = false,
}: MembershipModelExplainerProps) {
  const appliedDefaultOpen = useRef(false);
  const body = (
    <>
      <p>{TIER_LADDER_GLOSSARY}</p>
      <p className="membership-tier-glossary__plus-note" data-testid={`${testId}-no-plus`}>
        {NO_PLUS_PLAN_NOTE}
      </p>
      <div className="membership-tier-glossary__split" data-testid={`${testId}-now-soon`}>
        <p>
          <strong>Available now.</strong>{" "}
          {NOW_VS_COMING_SOON_BLURB.replace(/^Available now:\s*/i, "")}
        </p>
      </div>
      <p>{CREDITS_AND_CONSULTING_BLURB}</p>
      {showCompareTable ? (
        <div
          className="membership-tier-glossary__compare"
          data-testid={`${testId}-compare`}
        >
          <h4 className="membership-tier-glossary__compare-title">
            What each plan includes vs stays locked
          </h4>
          <div className="membership-compare-scroll">
            <table className="membership-compare-table membership-compare-table--compact">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Free</th>
                  <th scope="col">Starter</th>
                  <th scope="col">Pro</th>
                  <th scope="col">Elite</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERSHIP_COMPARE_ROWS.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">
                      {row.label}
                      {row.whyUpgrade ? (
                        <span className="membership-compare__why">{row.whyUpgrade}</span>
                      ) : null}
                    </th>
                    <td>{row.cells.free}</td>
                    <td>{row.cells.starter}</td>
                    <td>{row.cells.pro}</td>
                    <td>{row.cells.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );

  if (collapsible) {
    return (
      <details
        className="glass membership-tier-glossary membership-collapse membership-collapse--standout"
        data-testid={testId}
        aria-label="How membership tiers work"
        ref={(el) => {
          if (el && defaultOpen && !appliedDefaultOpen.current) {
            el.open = true;
            appliedDefaultOpen.current = true;
          }
        }}
      >
        <summary className="membership-collapse__summary">
          <h3 className="membership-tier-glossary__title membership-collapse__title">
            {heading}
            <ChevronRight size={20} className="membership-collapse__arrow" aria-hidden />
          </h3>
          <span className="collapse-show-hide" aria-hidden="true" />
        </summary>
        <div className="membership-collapse__body">{body}</div>
      </details>
    );
  }

  return (
    <aside
      className="glass membership-tier-glossary"
      data-testid={testId}
      aria-label="How membership tiers work"
    >
      <h3 className="membership-tier-glossary__title">{heading}</h3>
      {body}
    </aside>
  );
}
