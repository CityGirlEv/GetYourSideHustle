import { useMemo, useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import {
  remainingShareWinsThisMonth,
  readShareWins,
  recordShareWin,
  SHARE_WIN_MONTHLY_CAP,
  type ShareWinEntry,
} from "../lib/share-win";

export function ShareWinForm() {
  const [entries, setEntries] = useState<ShareWinEntry[]>(() => readShareWins());
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const remaining = useMemo(() => remainingShareWinsThisMonth(entries), [entries]);
  const atCap = remaining <= 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (atCap || !text.trim()) return;
    const next = recordShareWin(text);
    setEntries(next);
    setText("");
    setSaved(true);
  };

  return (
    <form className="user-portal-share-win" onSubmit={handleSubmit} data-testid="user-portal-share-win">
      <h4>
        <Sparkles size={16} aria-hidden /> Share a win
      </h4>
      <p className="user-portal-share-win__lead">
        Tell GYSH what went well this month. Up to {SHARE_WIN_MONTHLY_CAP} wins per month · +2 credits each.
        {atCap
          ? " You’ve logged both wins for this month."
          : ` ${remaining} left this month.`}
      </p>
      <textarea
        className="text-input"
        rows={3}
        maxLength={500}
        required
        disabled={atCap}
        value={text}
        onChange={(e) => {
          setSaved(false);
          setText(e.target.value);
        }}
        placeholder="I made my first sale / I finished a guide / I asked a customer…"
        data-testid="user-portal-share-win-input"
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={atCap || !text.trim()}
        data-testid="user-portal-share-win-submit"
      >
        Share this win
      </button>
      {saved ? (
        <p className="user-portal-share-win__ok" role="status" data-testid="user-portal-share-win-saved">
          Thanks — your win is saved on My Dashboard.
        </p>
      ) : null}
    </form>
  );
}
