import { KeyRound } from "lucide-react";
import pageOne from "../assets/gysh-welcome-vol1-page-1.jpg";
import pageTwo from "../assets/gysh-welcome-vol1-page-2.jpg";
import type { NewsletterIssueLink } from "../lib/member-newsletters";
import { WELCOME_VOL1_DATE, WELCOME_VOL1_ID, WELCOME_VOL1_PDF_PATH, WELCOME_VOL1_TITLE } from "../lib/welcome-vol1";
import { NewsletterIssueMenu } from "./NewsletterIssueMenu";

type WelcomeVol1PageProps = {
  onOpenAnswer: () => void;
  onSelectIssue: (issue: NewsletterIssueLink) => void;
};

function formatWelcomeDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export function WelcomeVol1Page({ onOpenAnswer, onSelectIssue }: WelcomeVol1PageProps) {
  return (
    <div className="static-page welcome-vol1-page" data-testid="welcome-vol1-page">
      <NewsletterIssueMenu activeId={WELCOME_VOL1_ID} onSelect={onSelectIssue} />
      <div className="welcome-vol1-page__issue">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">Newsletter #1 · Soft Launch Welcome</span>
        <h2>{WELCOME_VOL1_TITLE}</h2>
        <p className="welcome-vol1-page__date" data-testid="welcome-vol1-date">
          {formatWelcomeDate(WELCOME_VOL1_DATE)}
        </p>
        <p>
          The full community issue is below: the welcome letter, this week’s steps, Kids Corner,
          Coach Duke, the word search, and the parent note. The answer key opens with a free GYSH
          account.
        </p>
        <a className="btn btn-outline" href={WELCOME_VOL1_PDF_PATH} download data-testid="welcome-vol1-pdf">
          Download the issue (PDF)
        </a>
      </section>

      <figure className="welcome-vol1-sheet">
        <img
          src={pageOne}
          alt="GYSH Community Newsletter number 1, Soft Launch Welcome. Letter from Tina and Evelyn, this week's three steps, Kids Corner, Coach Duke, and paths for kids, teens, adults, and seniors."
          className="welcome-vol1-sheet__img"
          data-testid="welcome-vol1-page-1"
        />
      </figure>

      <figure className="welcome-vol1-sheet">
        <img
          src={pageTwo}
          alt="Page 2 of Welcome Vol 1: Kevina Starr's Kids Corner, Coach Duke's encouragement, the word search, Dream Big coloring, the family challenge, and a parent note."
          className="welcome-vol1-sheet__img"
          data-testid="welcome-vol1-page-2"
        />
      </figure>

      <section className="glass static-page-card welcome-vol1-page__answer-cta">
        <p>The word search on page 2 says the answers will be posted online. That solution sheet is for members.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenAnswer}
          data-testid="welcome-vol1-answer-link"
        >
          <KeyRound size={16} aria-hidden /> See the answer key
        </button>
      </section>
      </div>
    </div>
  );
}
