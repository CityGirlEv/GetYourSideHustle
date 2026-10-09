import { ArrowLeft, Lock, LogIn, UserPlus } from "lucide-react";
import answerKey from "../assets/gysh-welcome-vol1-answer-key.jpg";
import {
  WELCOME_VOL1_TITLE,
  canAccessWelcomeAnswer,
  saveWelcomeAnswerJoinReturn,
} from "../lib/welcome-vol1";

type WelcomeVol1AnswerPageProps = {
  isLoggedIn: boolean;
  onLogin: () => void;
  onJoin: () => void;
  onBack: () => void;
};

export function WelcomeVol1AnswerPage({
  isLoggedIn,
  onLogin,
  onJoin,
  onBack,
}: WelcomeVol1AnswerPageProps) {
  const unlocked = canAccessWelcomeAnswer(isLoggedIn);

  const requestAccount = (next: () => void) => {
    saveWelcomeAnswerJoinReturn();
    next();
  };

  return (
    <div className="static-page welcome-vol1-page" data-testid="welcome-vol1-answer-page">
      <section className="glass static-page-hero">
        <span className="flat-label flat-label--accent">Welcome issue</span>
        <h2>{WELCOME_VOL1_TITLE}</h2>
        <p>Word Search Answer Key</p>
      </section>

      {unlocked ? (
        <section className="glass static-page-card">
          <img
            src={answerKey}
            alt="GYSH Welcome Vol 1 word search answer key, October 5, 2026"
            className="welcome-vol1-answer-img"
            data-testid="welcome-vol1-answer-image"
          />
        </section>
      ) : (
        <section className="glass static-page-card newsletter-page__lock" data-testid="welcome-vol1-answer-lock">
          <p>
            <Lock size={16} aria-hidden /> A free GYSH account opens this answer key. Sign in if you
            already have one, or join free.
          </p>
          <div className="newsletter-page__actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => requestAccount(onLogin)}
              data-testid="welcome-vol1-answer-login"
            >
              <LogIn size={16} aria-hidden /> Log in
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => requestAccount(onJoin)}
              data-testid="welcome-vol1-answer-join"
            >
              <UserPlus size={16} aria-hidden /> Join free
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        className="btn btn-outline welcome-vol1-back"
        onClick={onBack}
        data-testid="welcome-vol1-back"
      >
        <ArrowLeft size={16} aria-hidden /> Back to the puzzle
      </button>
    </div>
  );
}
