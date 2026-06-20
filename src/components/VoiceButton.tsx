import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, SpellCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VOICE_INPUT_ENABLED } from "@/lib/feature-flags";

// Minimal typings for the Web Speech API (not in lib.dom for all browsers).
type SR = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): { new (): SR } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: { new (): SR };
    webkitSpeechRecognition?: { new (): SR };
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// NATO + common ad-hoc phonetic words → letters.
const PHONETIC: Record<string, string> = {
  alpha: "a",
  bravo: "b",
  charlie: "c",
  delta: "d",
  echo: "e",
  foxtrot: "f",
  golf: "g",
  hotel: "h",
  india: "i",
  juliet: "j",
  juliett: "j",
  kilo: "k",
  lima: "l",
  mike: "m",
  november: "n",
  oscar: "o",
  papa: "p",
  quebec: "q",
  romeo: "r",
  sierra: "s",
  tango: "t",
  uniform: "u",
  victor: "v",
  whiskey: "w",
  whisky: "w",
  xray: "x",
  "x-ray": "x",
  yankee: "y",
  zulu: "z",
  // Common spell-outs people use
  apple: "a",
  boy: "b",
  cat: "c",
  dog: "d",
  easy: "e",
  frank: "f",
  george: "g",
  harry: "h",
  ida: "i",
  john: "j",
  king: "k",
  love: "l",
  mary: "m",
  nancy: "n",
  peter: "p",
  queen: "q",
  robert: "r",
  sam: "s",
  tom: "t",
  union: "u",
  william: "w",
  young: "y",
  zebra: "z",
};

function transcriptToSpelled(raw: string): string {
  const tokens = raw
    .toLowerCase()
    .replace(/[.,!?;:]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  let out = "";
  for (const t of tokens) {
    if (t === "space") {
      out += " ";
      continue;
    }
    if (t === "dash" || t === "hyphen") {
      out += "-";
      continue;
    }
    if (PHONETIC[t]) {
      out += PHONETIC[t];
      continue;
    }
    // Single character letter/digit
    if (/^[a-z0-9]$/.test(t)) {
      out += t;
      continue;
    }
    // Spoken digits
    const digits: Record<string, string> = {
      zero: "0",
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
    };
    if (digits[t]) {
      out += digits[t];
      continue;
    }
    // Strip vowels-only suffixes, take first letter as fallback
    out += t[0];
  }
  return out;
}

interface Props {
  onTranscript: (text: string) => void;
  /** When true, replaces any existing text. When false (default), appends. */
  replace?: boolean;
  /** Show the "spell mode" toggle. Default true. */
  allowSpell?: boolean;
  /** Optional class on the wrapper. */
  className?: string;
  /** Accessible label, e.g. "Speak drug name". */
  label?: string;
  size?: "sm" | "md";
}

export function VoiceButton({
  onTranscript,
  replace = true,
  allowSpell = true,
  className,
  label = "Voice input",
  size = "sm",
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [listening, setListening] = useState(false);
  const [spell, setSpell] = useState(false);
  const recRef = useRef<SR | null>(null);
  const supported = mounted && !!getRecognitionCtor();

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(
    () => () => {
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
    },
    [],
  );

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      toast.error("Voice input isn't supported in this browser. Try Chrome, Edge, or Safari.");
      return;
    }
    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.onresult = (e) => {
        const result = e.results?.[e.results.length - 1];
        if (!result) return;
        const raw =
          Array.from(result)
            .map((alt) => alt.transcript?.trim() ?? "")
            .filter(Boolean)
            .sort((a, b) => b.length - a.length)[0] ?? "";
        if (!raw) return;
        const text = spell ? transcriptToSpelled(raw) : raw.trim();
        onTranscript(text);
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          toast.error("Microphone permission denied. Enable it in your browser settings.");
        } else if (e.error === "no-speech") {
          toast.message("Didn't hear anything — try again a little slower and closer to the mic.");
        } else if (e.error !== "aborted") {
          toast.error(`Voice error: ${e.error}`);
        }
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      toast.error("Could not start voice input.");
      setListening(false);
    }
  };

  const stop = () => {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  };

  if (!VOICE_INPUT_ENABLED || !supported) return null;

  const sz = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  // Silence the linter — `replace` is reserved as part of the component's
  // public API for future "append" callers but is unused inside the button.
  void replace;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {allowSpell && (
        <button
          type="button"
          onClick={() => setSpell((s) => !s)}
          title={
            spell
              ? "Spell mode ON — speak letters or NATO (alpha, bravo…)"
              : "Toggle spell mode (letter-by-letter)"
          }
          aria-pressed={spell}
          aria-label="Toggle spell mode"
          className={cn(
            "inline-flex items-center justify-center rounded-md border text-[10px] font-semibold transition",
            sz,
            spell
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-input text-muted-foreground hover:text-foreground",
          )}
        >
          <SpellCheck className={icon} />
        </button>
      )}
      <button
        type="button"
        onClick={listening ? stop : start}
        title={listening ? "Stop listening" : spell ? `${label} (spell mode)` : label}
        aria-label={label}
        aria-pressed={listening}
        className={cn(
          "inline-flex items-center justify-center rounded-md border transition",
          sz,
          listening
            ? "bg-destructive text-destructive-foreground border-destructive animate-pulse"
            : "bg-background border-input text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        {listening ? <MicOff className={icon} /> : <Mic className={icon} />}
      </button>
    </div>
  );
}

/** Pick the best-matching option for a spoken transcript. Returns the option or null. */
export function matchSpokenOption(spoken: string, options: string[]): string | null {
  const s = spoken.toLowerCase().trim();
  if (!s) return null;
  // Exact (case-insensitive)
  const exact = options.find((o) => o.toLowerCase() === s);
  if (exact) return exact;
  // Substring contained in option
  const contained = options.find((o) => o.toLowerCase().includes(s));
  if (contained) return contained;
  // Token overlap score
  const sTokens = s.split(/\s+/);
  let best: { o: string; score: number } | null = null;
  for (const o of options) {
    const oLower = o.toLowerCase();
    const score = sTokens.reduce((acc, t) => acc + (oLower.includes(t) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { o, score };
  }
  return best?.o ?? null;
}
