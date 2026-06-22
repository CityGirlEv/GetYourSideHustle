import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  SkipForward,
  Keyboard,
  Check,
  Loader2,
  Info,
  ListChecks,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getCommonMedsForCondition,
  resolveDiagnosis,
  searchMedCatalog,
  MED_CATALOG,
} from "@/lib/diagnosis-resolver";
import { countiesForZip3 } from "@/lib/zip3-county-lookup";
import type { Medication } from "@/lib/medicare-math";
import { INCOME_BANDS, type IncomeBand } from "@/lib/income-bands";
import {
  getSpeechRecognitionCtor,
  startLiveSpeechRecognition,
  type LiveSpeechSession,
} from "@/lib/speech-recognition";
import { startRecordedTranscription } from "@/lib/recorded-transcription";
import {
  listMicDevices,
  primeMicAccess,
  recordMicClip,
  startMicLevelMonitor,
  type MicDevice,
  type MicLevelSnapshot,
} from "@/lib/mic-audio";
import {
  cancelSpeech,
  MIC_TEST_PROMPT,
  playVoiceBeep,
  primeVoiceSession,
  speakQuestionThenCue,
  speakVoiceText,
  speakVoiceTextImmediate,
  SPEAKER_TEST_PHRASE,
  finishSpeakerTestFromUserGesture,
  VOICE_WIZARD_INTRO,
  waitUntilSpeechSilent,
} from "@/lib/voice-prompt";

const MAX_VOICE_PROMPT_RETRIES = 3;

// ------------------- Web Speech API typing -------------------
function getRecognitionCtor() {
  return getSpeechRecognitionCtor();
}

// ------------------- Speech parsers -------------------
const DIGIT_WORDS: Record<string, string> = {
  zero: "0",
  oh: "0",
  o: "0",
  one: "1",
  two: "2",
  to: "2",
  too: "2",
  three: "3",
  four: "4",
  for: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  ate: "8",
  nine: "9",
};
function parseDigits(text: string, max = 32): string {
  const tokens = text
    .toLowerCase()
    .replace(/[.,!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  let out = "";
  for (const t of tokens) {
    if (/^\d+$/.test(t)) out += t;
    else if (DIGIT_WORDS[t]) out += DIGIT_WORDS[t];
  }
  return out.slice(0, max);
}
function parseYear(text: string): number | null {
  const cleaned = text.toLowerCase().replace(/[.,!?]/g, " ");
  const m = cleaned.match(/\b(19|20)\d{2}\b/);
  if (m) return Number(m[0]);
  // "nineteen forty two" / "two thousand five"
  const digits = parseDigits(text, 4);
  if (/^(19|20)\d{2}$/.test(digits)) return Number(digits);
  return null;
}
function parseYesNo(text: string): boolean | null {
  const t = normalizeSpeech(text);
  if (!t || /\b(yes or no|no or yes)\b/.test(t)) return null;
  const hasExplicitNo =
    /\b(no|nope|nah|negative|never|incorrect|wrong)\b|\b(do not|dont|not right|not correct|not true|not it)\b/.test(
      t,
    );
  if (hasExplicitNo) return false;
  const hasExplicitYes =
    /\b(yes|yeah|yep|yup|ya|correct|right|true|sure|ok|okay|affirmative)\b|\b(that is right|thats right|sounds right|i do|i am|smoke|smoker)\b/.test(
      t,
    );
  if (hasExplicitYes) return true;
  return null;
}

/** Yes/no on the echo-confirmation step — slightly more permissive phrasing. */
function parseConfirmation(text: string): boolean | null {
  const t = normalizeSpeech(text);
  if (!t) return null;
  if (/\b(no|nope|nah|negative|incorrect|wrong|not right|not correct|try again|change it)\b/.test(t)) {
    return false;
  }
  if (
    /\b(yes|yeah|yep|yup|correct|right|true|sure|ok|okay|affirmative|absolutely|perfect|go ahead|continue|sounds good|that works)\b/.test(
      t,
    )
  ) {
    return true;
  }
  return parseYesNo(text);
}
function matchOption<T extends string>(text: string, options: readonly T[]): T | null {
  const s = text.toLowerCase().trim();
  if (!s) return null;
  const exact = options.find((o) => o.toLowerCase() === s);
  if (exact) return exact;
  const contained = options.find((o) => o.toLowerCase().includes(s) || s.includes(o.toLowerCase()));
  if (contained) return contained;
  const tokens = s.split(/\s+/);
  let best: { o: T; score: number } | null = null;
  for (const o of options) {
    const oTokens = o.toLowerCase().split(/\s+/);
    const score = tokens.reduce(
      (acc, t) => acc + (oTokens.some((ot) => ot.includes(t) || t.includes(ot)) ? 1 : 0),
      0,
    );
    if (score > 0 && (!best || score > best.score)) best = { o, score };
  }
  return best?.o ?? null;
}

function normalizeSpeech(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(milligrams?|milligram)\b/g, "mg")
    .replace(/\b(micrograms?|microgram)\b/g, "mcg")
    .replace(/\b(units?|unit)\b/g, "u")
    .replace(/\s+/g, " ")
    .trim();
}

function similarityScore(a: string, b: string): number {
  const aTokens = new Set(normalizeSpeech(a).split(" ").filter(Boolean));
  const bTokens = new Set(normalizeSpeech(b).split(" ").filter(Boolean));
  if (!aTokens.size || !bTokens.size) return 0;
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap += 1;
  }
  return overlap / Math.max(aTokens.size, bTokens.size);
}

function bestMedicationMatch(text: string) {
  const normalized = normalizeSpeech(text);
  if (!normalized) return null;

  const direct = searchMedCatalog(text, 1)[0];
  if (direct) return direct;

  let best: { entry: (typeof MED_CATALOG)[number]; score: number } | null = null;
  for (const entry of MED_CATALOG) {
    const labels = [entry.name, ...(entry.aliases ?? [])];
    for (const label of labels) {
      const score = similarityScore(normalized, label);
      if (score >= 0.5 && (!best || score > best.score)) {
        best = { entry, score };
      }
    }
  }
  return best?.entry ?? null;
}

// Join runs of single-letter tokens ("p r e d" -> "pred") so the user can
// spell out a drug name letter by letter and have it search the catalog.
function parseSpelledOrSpoken(text: string): string {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out: string[] = [];
  let buf = "";
  for (const t of tokens) {
    if (t.length === 1 && /[a-z]/.test(t)) {
      buf += t;
    } else {
      if (buf) {
        out.push(buf);
        buf = "";
      }
      out.push(t);
    }
  }
  if (buf) out.push(buf);
  return out.join(" ").trim();
}

// ------------------- Config -------------------
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 110;
const INCOME_SPOKEN: Array<{ band: IncomeBand; matches: RegExp }> = [
  { band: "Under $15k", matches: /under\s*15|less than\s*15|below\s*15|fifteen thousand or less/i },
  { band: "$15k–$35k", matches: /15.*35|fifteen.*thirty[\s-]?five/i },
  { band: "$35k–$55k", matches: /35.*55|thirty[\s-]?five.*fifty[\s-]?five/i },
  { band: "$55k–$75k", matches: /55.*75|fifty[\s-]?five.*seventy[\s-]?five/i },
  { band: "$75k–$95k", matches: /75.*95|seventy[\s-]?five.*ninety[\s-]?five/i },
  { band: "$95k–$115k", matches: /95.*115|ninety[\s-]?five.*one[\s-]?hundred[\s-]?fifteen/i },
  {
    band: "Over $115k",
    matches: /over\s*115|more than\s*115|above\s*115|one[\s-]?hundred[\s-]?fifteen or more/i,
  },
  { band: "Prefer not to say", matches: /prefer not|skip|don't (want|say)|rather not/i },
];
const CONDITIONS = [
  "Diabetes",
  "Type 2 Diabetes",
  "Hypertension",
  "Heart disease",
  "COPD",
  "Cancer history",
  "Chronic kidney disease",
  "Arthritis",
] as const;
const GENDERS = ["female", "male", "nonbinary", "prefer_not_to_say"] as const;

function blankMed(name = "", strength = ""): Medication {
  return {
    id: crypto.randomUUID(),
    medication_name: name,
    strength,
    dosage_form: "Tablet",
    frequency: "Once daily",
    estimated_monthly_retail: 25,
    resolved_diagnosis: resolveDiagnosis(name),
  };
}

// ------------------- Step machine -------------------
type StepKey =
  | "intro"
  | "birthYear"
  | "zip"
  | "county"
  | "gender"
  | "tobacco"
  | "income"
  | "costPref"
  | "conditionsAsk"
  | "conditionsAdd"
  | "medsAsk"
  | "medsName"
  | "medsStrength"
  | "medsMore"
  | "confirm"
  | "verify"
  | "submitting"
  | "done";

interface Transcript {
  q: string;
  a?: string;
  speaker?: "assistant" | "you";
}

function MicVolumeControl({
  level,
  active,
  mode = "hardware",
  className,
  heardWords = false,
}: {
  level: number;
  active: boolean;
  mode?: "hardware" | "speech";
  className?: string;
  heardWords?: boolean;
}) {
  const bars = 12;
  const speechMode = mode === "speech";
  const visualLevel = level;
  const filled = active ? Math.round((visualLevel / 100) * bars) : 0;
  const hot = level >= 18;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Mic className={cn("h-3 w-3", speechMode && active && "text-destructive animate-pulse")} />
          {speechMode ? "Speech-to-text" : "Mic signal"}
        </span>
        <span
          className={cn(
            "tabular-nums",
            heardWords || hot ? "text-emerald-700" : "text-muted-foreground",
          )}
        >
          {heardWords
            ? "HEARD"
            : active
              ? hot
                ? `${level}%`
                : speechMode
                  ? "WAITING"
                  : "—"
              : "—"}
        </span>
      </div>
      <div className="flex items-end justify-center gap-1 h-8">
        {Array.from({ length: bars }, (_, i) => {
          const on = active && i < filled;
          return (
            <div
              key={i}
              className={cn(
                "w-2 rounded-sm transition-all duration-75",
                on
                  ? hot || heardWords
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                  : "bg-muted",
              )}
              style={{ height: `${20 + (i + 1) * 4}px` }}
            />
          );
        })}
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full transition-[width] duration-75",
            heardWords || hot
              ? "bg-emerald-500"
              : active && visualLevel > 0
                ? "bg-amber-500/80"
                : "bg-transparent",
          )}
          style={{ width: active && visualLevel > 0 ? `${visualLevel}%` : undefined }}
        />
      </div>
      {active && !hot && !heardWords && (
        <p className="text-[10px] text-center text-muted-foreground">
          {speechMode
            ? "Engine is on — words appear in the box when speech is recognized. Green bars only move when text is captured."
            : "Speak now — these bars should move with your voice."}
        </p>
      )}
    </div>
  );
}

function LiveAnswerBox({
  value,
  onChange,
  listening,
}: {
  value: string;
  onChange: (value: string) => void;
  listening: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {listening ? "Typing what I hear — edit if needed" : "Your answer"}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          listening
            ? "Speak after the beep… your words appear here live. You can also type."
            : "Your answer will appear here"
        }
        rows={3}
        className={cn(
          "w-full resize-none rounded-lg border-2 bg-background px-3 py-2.5 text-base leading-snug",
          "placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          listening ? "border-destructive/60 font-medium" : "border-border",
        )}
      />
    </div>
  );
}

// ------------------- Component -------------------
export function VoiceIntakeWizard({
  onDone,
  onSwitchToManual,
}: {
  onDone?: (code: string) => void;
  onSwitchToManual?: () => void;
}) {
  const [voiceReady, setVoiceReady] = useState<boolean | null>(null);
  const supported = voiceReady === true;

  useEffect(() => {
    setVoiceReady(!!getRecognitionCtor() && typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Collected data
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [zip3, setZip3] = useState("");
  const [county, setCounty] = useState("");
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("prefer_not_to_say");
  const [tobacco, setTobacco] = useState(false);
  const [income, setIncome] = useState<(typeof INCOME_BANDS)[number]>("Prefer not to say");
  const [costPref, setCostPref] = useState<"minimize_monthly" | "predictability">(
    "minimize_monthly",
  );
  const [conditions, setConditions] = useState<string[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [pendingMedName, setPendingMedName] = useState("");
  const [medQuery, setMedQuery] = useState("");

  // Conversation state
  const [step, setStep] = useState<StepKey>("intro");
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const [lastHeard, setLastHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [testingMic, setTestingMic] = useState(false);
  const [liveListenText, setLiveListenText] = useState("");
  const [listeningDraft, setListeningDraft] = useState("");
  const listeningDraftRef = useRef("");
  const [answerCapture, setAnswerCapture] = useState<{
    expect: StepKey;
    epoch: number;
    listenGen: number;
  } | null>(null);
  const answerCaptureRef = useRef<typeof answerCapture>(null);
  const pendingAnswerRef = useRef("");
  const [awaitingEchoConfirm, setAwaitingEchoConfirm] = useState(false);
  const [micTestReady, setMicTestReady] = useState(false);
  const [speechEngineLive, setSpeechEngineLive] = useState(false);
  const [sttStatus, setSttStatus] = useState<string | null>(null);
  const [micDevices, setMicDevices] = useState<MicDevice[]>([]);
  const [selectedMicId, setSelectedMicId] = useState("");
  const [hardwareMicLevel, setHardwareMicLevel] = useState(0);
  const [micSignal, setMicSignal] = useState<MicLevelSnapshot | null>(null);
  const [checkingMicSignal, setCheckingMicSignal] = useState(false);
  const [browserRecording, setBrowserRecording] = useState(false);
  const testMicButtonRef = useRef<HTMLButtonElement>(null);
  const startSpeakingBtnRef = useRef<HTMLButtonElement>(null);
  const micLevelMonitorRef = useRef<{ stop: () => void } | null>(null);

  const speechVisualLevel = useMemo(() => {
    const heard = listeningDraft.trim();
    if (heard) return Math.min(95, 45 + heard.length);
    return hardwareMicLevel;
  }, [listeningDraft, hardwareMicLevel]);

  const heardSpeech = listeningDraft.trim().length > 0;

  const refreshMicDevices = useCallback(async () => {
    const devices = await listMicDevices();
    setMicDevices(devices);
    if (!selectedMicId && devices[0]) {
      const emeet = devices.find((d) => /emeet|smartcam|c60/i.test(d.label));
      setSelectedMicId(emeet?.deviceId ?? devices[0]!.deviceId);
    }
  }, [selectedMicId]);

  const stopMicSignalCheck = useCallback(() => {
    micLevelMonitorRef.current?.stop();
    micLevelMonitorRef.current = null;
    setCheckingMicSignal(false);
    setHardwareMicLevel(0);
    setMicSignal(null);
  }, []);

  useEffect(() => () => stopMicSignalCheck(), [stopMicSignalCheck]);

  useEffect(() => {
    if (step !== "intro" || !supported) return;
    const id = window.requestAnimationFrame(() => {
      testMicButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [step, supported]);

  const speechSessionRef = useRef<LiveSpeechSession | null>(null);
  const listenAbortRef = useRef(false);
  const listenGenRef = useRef(0);
  const currentPromptRef = useRef<{ question: string; expect: StepKey } | null>(null);
  const stepRef = useRef(step);
  const flowEpochRef = useRef(0);
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  const historyRef = useRef<StepKey[]>([]);
  const pendingRef = useRef<{ apply: () => void; next: StepKey; from: StepKey } | null>(null);
  const cancelMedLoopRef = useRef(false);
  const promptRetryRef = useRef<{ step: StepKey; count: number }>({ step: "birthYear", count: 0 });
  const askTokenRef = useRef(0);
  const sttBlockedRef = useRef(false);
  const lastSttErrorToastRef = useRef(0);
  const [sttBlocked, setSttBlocked] = useState(false);

  // ---- Sequential "press any key when I say the correct option" picker ----
  const pickingRef = useRef<{
    active: boolean;
    options: string[];
    index: number;
    onPick: (idx: number) => void;
    onExhausted: () => void;
  } | null>(null);
  const [pickOptions, setPickOptions] = useState<string[]>([]);
  const [pickIndex, setPickIndex] = useState(-1);

  const medMatches = useMemo(() => {
    const q = medQuery.trim();
    if (q.length < 2) return [];
    return searchMedCatalog(q, 6);
  }, [medQuery]);

  const countyOptions = useMemo(() => (/^\d{3}$/.test(zip3) ? countiesForZip3(zip3) : []), [zip3]);

  // ------------------- TTS -------------------
  const speak = async (text: string) => {
    setSpeaking(true);
    try {
      await speakVoiceText(text);
    } finally {
      setSpeaking(false);
    }
  };

  const resetPromptRetries = (step: StepKey) => {
    promptRetryRef.current = { step, count: 0 };
  };

  const bumpPromptRetries = (step: StepKey) => {
    if (promptRetryRef.current.step !== step) {
      promptRetryRef.current = { step, count: 1 };
    } else {
      promptRetryRef.current.count += 1;
    }
    return promptRetryRef.current.count;
  };

  const offerTypedFallback = () => {
    toast.message(
      "Having trouble hearing you? Edit the text box while listening, use Type, or try Chrome/Edge.",
      { duration: 5000 },
    );
    setTyping(true);
  };

  const showSttError = (message: string) => {
    const now = Date.now();
    if (now - lastSttErrorToastRef.current < 3500) return;
    lastSttErrorToastRef.current = now;
    toast.error(message);
  };

  const markSttBlocked = () => {
    sttBlockedRef.current = true;
    setSttBlocked(true);
    setListening(false);
  };

  const clearSttBlocked = () => {
    sttBlockedRef.current = false;
    setSttBlocked(false);
  };

  const syncListeningDraft = (text: string) => {
    listeningDraftRef.current = text;
    setListeningDraft(text);
    setLiveListenText(text);
    if (text.trim()) setLastHeard(text.trim());
  };

  /** Must run synchronously right after mic prime (same user click). */
  const startListenFromGesture = (timeoutMs = 35000): LiveSpeechSession | null => {
    if (listenAbortRef.current) return null;
    if (speechSessionRef.current) return speechSessionRef.current;

    stopMicSignalCheck();
    setHardwareMicLevel(0);

    const session = startLiveSpeechRecognition({
      timeoutMs,
      onTranscript: (text) => syncListeningDraft(text),
      onStarted: () => {
        setSpeechEngineLive(true);
        setSttStatus("Speech engine live — say something. Words appear in the box when recognized.");
      },
      onError: (message) => {
        setSttStatus(message);
        showSttError(message);
      },
      onNetworkFailure: markSttBlocked,
    });

    if (!session) {
      toast.error("Voice not supported. Use Chrome or Edge, or type your answer.");
      setListening(false);
      setSpeechEngineLive(false);
      return null;
    }

    speechSessionRef.current = session;
    void session.done.then(() => {
      speechSessionRef.current = null;
      setListening(false);
      setSpeechEngineLive(false);
    });
    return session;
  };

  /** Record + Whisper first (same mic path as browser record test); Web Speech as fallback. */
  const beginListeningFromClick = (
    timeoutMs = 35000,
    mode: "answer" | "confirm" | "micTest" = "answer",
  ): LiveSpeechSession | null => {
    if (listenAbortRef.current) return null;
    if (speechSessionRef.current) return speechSessionRef.current;

    primeVoiceSession();
    cancelSpeech();
    stopMicSignalCheck();
    clearSttBlocked();
    listenAbortRef.current = false;
    setSpeechEngineLive(false);
    setSttStatus(mode === "confirm" ? "Opening microphone for yes or no…" : "Opening microphone…");
    setListening(true);

    const attachSession = (session: LiveSpeechSession) => {
      speechSessionRef.current = session;
      void session.done.then((heard) => {
        if (listenAbortRef.current) return;
        if (mode === "confirm") void onConfirmRecordingFinished(heard);
        else void onRecordingFinished(heard, { micTest: mode === "micTest" });
      });
      toast.message(
        mode === "confirm"
          ? "Say yes or no."
          : "Speak now — I'll stop when you pause.",
        { duration: 3000 },
      );
      return session;
    };

    const recorded = startRecordedTranscription({
      deviceId: selectedMicId || undefined,
      chunkMs: mode === "confirm" ? 650 : 900,
      silenceHangMs: mode === "confirm" ? 1500 : 2200,
      timeoutMs,
      onTranscript: (text) => {
        if (mode === "confirm") return;
        syncListeningDraft(text);
        if (text.trim()) {
          setSttStatus("Got it — keep speaking, or pause when you're done.");
        }
      },
      onTranscribing: () => {
        if (mode === "confirm") return;
        setSttStatus("Transcribing — words appear in a second or two…");
      },
      onLevel: setHardwareMicLevel,
      onStarted: (label) => {
        setSpeechEngineLive(true);
        setSttStatus(
          mode === "confirm"
            ? `Say yes or no on ${label}.`
            : `Listening on ${label} — speak now; words appear within ~1–2 seconds.`,
        );
      },
      onError: (message) => {
        setSttStatus(message);
        showSttError(message);
      },
    });

    if (recorded) return attachSession(recorded);

    setSttStatus("Trying browser speech recognition…");
    const fallback = startListenFromGesture(timeoutMs);
    if (fallback) return attachSession(fallback);

    setListening(false);
    return null;
  };

  const tryAutoListen = (mode: "answer" | "confirm" | "micTest" = "answer") => {
    if (listenAbortRef.current || pausedRef.current || speechSessionRef.current) return;
    listenAbortRef.current = false;
    setAwaitingEchoConfirm(mode === "confirm");
    if (mode === "confirm") {
      beginListeningFromClick(15000, "confirm");
      return;
    }
    if (mode === "micTest") {
      setMicTestReady(false);
      listeningDraftRef.current = "";
      setListeningDraft("");
      beginListeningFromClick(20000, "micTest");
      return;
    }
    setAwaitingEchoConfirm(false);
    pendingAnswerRef.current = "";
    listeningDraftRef.current = "";
    setListeningDraft("");
    beginListeningFromClick();
  };

  const listen = (
    timeoutMs = 35000,
    _opts: { endListeningWhenDone?: boolean } = {},
  ): Promise<string> =>
    new Promise((resolve) => {
      const session = startListenFromGesture(timeoutMs);
      if (!session) {
        resolve("");
        return;
      }
      void session.done.then((text) => {
        const captured = (text || listeningDraftRef.current).trim();
        resolve(captured);
      });
    });

  const clearAnswerCapture = () => {
    answerCaptureRef.current = null;
    setAnswerCapture(null);
    setAwaitingEchoConfirm(false);
    pendingAnswerRef.current = "";
    setMicTestReady(false);
  };

  const processEmptyAnswer = (expect: StepKey, epoch: number) => {
    const flowActive = () => epoch === flowEpochRef.current && !pausedRef.current;
    if (sttBlockedRef.current) {
      offerTypedFallback();
      toast.message(
        "Voice needs internet — type in the box above, or reconnect and click Start speaking.",
        { duration: 6000 },
      );
      return;
    }
    const retries = bumpPromptRetries(expect);
    if (retries >= MAX_VOICE_PROMPT_RETRIES) {
      offerTypedFallback();
      return;
    }
    const prompt =
      expect === "verify"
        ? "I didn't hear you. Was that right? Please say yes or no."
        : expect === "confirm"
          ? "I didn't hear you. Should I create the comparison? Please say yes or no."
          : "I didn't catch that. Could you say it again?";
    if (!flowActive()) return;
    setTimeout(() => {
      if (flowActive()) void ask(prompt, expect);
    }, 400);
  };

  const submitCapturedAnswer = async () => {
    if (awaitingEchoConfirm) {
      await confirmEchoAnswer(true);
      return;
    }
    const capture = answerCaptureRef.current;
    if (!capture) return;
    const { expect, epoch } = capture;
    if (speechSessionRef.current) {
      speechSessionRef.current.stop();
      await speechSessionRef.current.done;
    }
    const text = listeningDraftRef.current.trim();
    stopListening();
    clearAnswerCapture();
    if (epoch !== flowEpochRef.current || pausedRef.current) return;
    if (text) {
      resetPromptRetries(expect);
      await handleAnswer(expect, text);
    } else {
      processEmptyAnswer(expect, epoch);
    }
  };

  const echoHeardText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLastHeard(trimmed);
    setSpeaking(true);
    try {
      await speakVoiceText(`I heard ${trimmed}.`);
    } finally {
      setSpeaking(false);
    }
  };

  const promptEchoConfirm = async () => {
    setAwaitingEchoConfirm(true);
    setSpeaking(true);
    try {
      await speakQuestionThenCue("Is that correct? Yes or no.");
    } finally {
      setSpeaking(false);
    }
    if (!listenAbortRef.current && answerCaptureRef.current) {
      tryAutoListen("confirm");
    }
  };

  const confirmEchoAnswer = async (confirmed: boolean) => {
    const capture = answerCaptureRef.current;
    if (!capture || !awaitingEchoConfirm) return;
    const { expect, epoch } = capture;
    const text = pendingAnswerRef.current.trim() || listeningDraftRef.current.trim();

    setAwaitingEchoConfirm(false);
    pendingAnswerRef.current = "";
    stopListening();

    if (!confirmed) {
      listeningDraftRef.current = "";
      setListeningDraft("");
      toast.message("OK — speak again after the beep.", { duration: 3500 });
      window.setTimeout(() => {
        if (answerCaptureRef.current && !pausedRef.current && !listenAbortRef.current) {
          tryAutoListen("answer");
        }
      }, 350);
      return;
    }

    clearAnswerCapture();
    if (epoch !== flowEpochRef.current || pausedRef.current) return;
    if (text) {
      resetPromptRetries(expect);
      await handleAnswer(expect, text);
    } else {
      processEmptyAnswer(expect, epoch);
    }
  };

  const onConfirmRecordingFinished = async (heard: string) => {
    speechSessionRef.current = null;
    setListening(false);
    setSpeechEngineLive(false);
    setHardwareMicLevel(0);
    setSttStatus(null);

    const reply = heard.trim();
    const v = parseConfirmation(reply);
    if (v === true) {
      await confirmEchoAnswer(true);
      return;
    }
    if (v === false) {
      await confirmEchoAnswer(false);
      return;
    }
    toast.message("Say yes or no, or tap the Yes / No buttons.", { duration: 4500 });
  };

  const onRecordingFinished = async (heard: string, opts: { micTest?: boolean } = {}) => {
    speechSessionRef.current = null;
    setListening(false);
    setSpeechEngineLive(false);
    setHardwareMicLevel(0);
    setSttStatus(null);

    const text = (heard || listeningDraftRef.current).trim();
    if (!text) {
      if (opts.micTest) {
        setMicTestPassed(false);
        setMicTestReady(true);
        toast.error(
          "Windows hears you but speech didn't come through. Allow mic for this site, check internet, or type your answers.",
        );
      }
      return;
    }

    if (opts.micTest) {
      await echoHeardText(text);
      setMicTestPassed(true);
      setTestingMic(false);
      setMicTestReady(false);
      toast.success(`Mic works! I heard: "${text}"`);
      return;
    }

    if (!answerCaptureRef.current) return;

    pendingAnswerRef.current = text;
    syncListeningDraft(text);
    await echoHeardText(text);
    await promptEchoConfirm();
  };

  const startSpeakingAnswer = () => {
    if (listening) return;
    tryAutoListen(awaitingEchoConfirm ? "confirm" : "answer");
  };

  const checkMicSignal = () => {
    if (checkingMicSignal) {
      stopMicSignalCheck();
      return;
    }
    stopListening();
    primeVoiceSession();
    void (async () => {
      try {
        await primeMicAccess(selectedMicId || undefined);
        await refreshMicDevices();
      } catch {
        toast.error("Allow microphone access, then try Check mic signal again.");
        return;
      }
      stopMicSignalCheck();
      setCheckingMicSignal(true);
      micLevelMonitorRef.current = startMicLevelMonitor((snapshot) => {
        setMicSignal(snapshot);
        setHardwareMicLevel(snapshot.level);
      }, selectedMicId || undefined);
      toast.message("Stay quiet 1 sec, then speak. Bars should jump only when you talk.", {
        duration: 6000,
      });
    })();
  };

  const browserRecordTest = () => {
    if (browserRecording) return;
    stopListening();
    primeVoiceSession();
    setBrowserRecording(true);
    toast.message("Recording 3 seconds — say hello…", { duration: 3500 });
    void (async () => {
      try {
        const clip = await recordMicClip(3, selectedMicId || undefined);
        const audio = new Audio(clip.url);
        audio.onended = () => clip.revoke();
        await audio.play();
        toast.success(`Browser recorded from: ${clip.deviceLabel}. Did you hear yourself?`);
      } catch {
        toast.error("Browser couldn't record. Allow microphone for this site.");
      } finally {
        setBrowserRecording(false);
      }
    })();
  };

  // Focus mic control after each question (manual fallback if auto-listen fails).
  useEffect(() => {
    if (!answerCapture || paused || speaking || testingMic) return;
    const id = window.requestAnimationFrame(() => startSpeakingBtnRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [answerCapture?.listenGen, paused, speaking, testingMic, awaitingEchoConfirm]);

  const submitAnswerNow = () => {
    speechSessionRef.current?.stop();
  };

  const updateListeningDraft = (value: string) => {
    listeningDraftRef.current = value;
    setListeningDraft(value);
    setLiveListenText(value);
    if (value.trim()) setLastHeard(value.trim());
  };

  const stopListening = () => {
    listenAbortRef.current = true;
    speechSessionRef.current?.stop();
    speechSessionRef.current = null;
    setListening(false);
    setSpeechEngineLive(false);
    setSttStatus(null);
    setLiveListenText("");
    setAwaitingEchoConfirm(false);
    pendingAnswerRef.current = "";
    stopMicSignalCheck();
  };

  // Stop any in-flight key-pick session
  const stopKeyPick = () => {
    if (pickingRef.current) pickingRef.current.active = false;
    pickingRef.current = null;
    setPickOptions([]);
    setPickIndex(-1);
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* noop */
    }
  };

  // Speak each option in turn. Resolves the user's choice when they press any
  // key (or click an option). Also acts as a list-aware fallback.
  const startKeyPick = async (
    intro: string,
    options: string[],
    onPick: (idx: number) => void,
    onExhausted: () => void,
  ) => {
    stopListening();
    stopKeyPick();
    pickingRef.current = { active: true, options, index: -1, onPick, onExhausted };
    setPickOptions(options);
    setPickIndex(-1);
    setTranscript((p) => [
      ...p,
      { q: `${intro} Press any key when I say the correct one.`, speaker: "assistant" },
    ]);
    await speak(`${intro} Press any key when I say the correct one.`);
    for (let i = 0; i < options.length; i += 1) {
      const cur = pickingRef.current;
      if (!cur || !cur.active) return;
      cur.index = i;
      setPickIndex(i);
      await speak(`Option ${i + 1}: ${options[i]}.`);
      // Brief pause so a key press registers against this option
      await new Promise((r) => setTimeout(r, 700));
      if (!pickingRef.current || !pickingRef.current.active) return;
    }
    const cur = pickingRef.current;
    if (cur && cur.active) {
      cur.active = false;
      pickingRef.current = null;
      setPickOptions([]);
      setPickIndex(-1);
      onExhausted();
    }
  };

  // Global key listener: any key (except modifier-only or typing in a field)
  // selects the option currently being spoken.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = pickingRef.current;
      if (!p || !p.active) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (target as HTMLElement | null)?.isContentEditable
      )
        return;
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
      e.preventDefault();
      const idx = p.index >= 0 ? p.index : 0;
      p.active = false;
      pickingRef.current = null;
      setPickOptions([]);
      setPickIndex(-1);
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* noop */
      }
      p.onPick(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ------------------- Conversation runner -------------------
  // Speaks the question, then listens once and routes the response.
  const ask = async (
    question: string,
    expect: StepKey,
    opts: { skipListen?: boolean; silentTranscript?: boolean } = {},
  ) => {
    const token = ++askTokenRef.current;
    const epoch = flowEpochRef.current;
    const flowActive = () =>
      token === askTokenRef.current && epoch === flowEpochRef.current && !pausedRef.current;

    stopListening();
    cancelSpeech();
    setSpeaking(false);
    clearSttBlocked();

    currentPromptRef.current = { question, expect };
    if (!opts.silentTranscript) {
      setTranscript((p) => [...p, { q: question, speaker: "assistant" }]);
    }
    if (opts.skipListen) {
      await speak(question);
      return;
    }
    if (!flowActive()) return;

    void primeMicAccess(selectedMicId || undefined).catch(() => undefined);
    setSpeaking(true);
    try {
      await speakQuestionThenCue(question);
    } finally {
      setSpeaking(false);
    }
    if (!flowActive()) return;

    stopListening();
    listenAbortRef.current = false;
    listeningDraftRef.current = "";
    setListeningDraft("");
    listenGenRef.current += 1;
    const capture = { expect, epoch, listenGen: listenGenRef.current };
    answerCaptureRef.current = capture;
    setAnswerCapture(capture);
    tryAutoListen("answer");
  };

  const reAsk = (q: string, step: StepKey) => {
    void ask(q, step);
  };

  const handleAnswer = async (forStep: StepKey, text: string) => {
    setTranscript((p) => [...p, { q: text, speaker: "you" }]);
    // Universal: let the user navigate back at any step
    if (/\b(go back|take me back|previous question|back up|last question|undo)\b/i.test(text)) {
      goBack();
      return;
    }
    switch (forStep) {
      case "birthYear": {
        const y = parseYear(text);
        if (!y || y < MIN_BIRTH_YEAR || y > CURRENT_YEAR) {
          reAsk(
            `I didn't catch a valid year. Please say a year between ${MIN_BIRTH_YEAR} and ${CURRENT_YEAR}, like "nineteen fifty".`,
            "birthYear",
          );
          return;
        }
        verify(`birth year ${y}`, () => setBirthYear(y), "zip", "birthYear");
        return;
      }
      case "zip": {
        const digits = parseDigits(text, 3);
        if (!/^\d{3}$/.test(digits)) {
          reAsk(
            "Please say the first three digits of your ZIP code slowly, one at a time. For example: seven, seven, zero.",
            "zip",
          );
          return;
        }
        const opts = countiesForZip3(digits);
        if (opts.length === 0) {
          reAsk(
            `I don't recognize ZIP prefix ${digits.split("").join(" ")}. Please say the first three digits again.`,
            "zip",
          );
          return;
        }
        if (opts.length === 1) {
          const only = opts[0];
          verify(
            `ZIP ${digits.split("").join(" ")}, ${only.county}, ${only.stateCode}`,
            () => {
              setZip3(digits);
              setCounty(only.county);
            },
            "gender",
            "zip",
          );
          return;
        }
        verify(`ZIP ${digits.split("").join(" ")}`, () => setZip3(digits), "county", "zip");
        return;
      }
      case "county": {
        const opts = countiesForZip3(zip3);
        const match = matchOption(
          text,
          opts.map((o) => o.county),
        );
        if (!match) {
          reAsk(
            `I didn't catch that. Please say one of: ${opts.map((o) => o.county).join(", ")}.`,
            "county",
          );
          return;
        }
        verify(`county ${match}`, () => setCounty(match), "gender", "county");
        return;
      }
      case "gender": {
        const t = text.toLowerCase();
        let g: (typeof GENDERS)[number] = "prefer_not_to_say";
        if (/female|woman|she/.test(t)) g = "female";
        else if (/\bmale\b|\bman\b|\bhe\b/.test(t)) g = "male";
        else if (/non[\s-]?binary|enby|they/.test(t)) g = "nonbinary";
        else if (/prefer not|skip|rather not|none/.test(t)) g = "prefer_not_to_say";
        verify(`gender ${g.replace(/_/g, " ")}`, () => setGender(g), "tobacco", "gender");
        return;
      }
      case "tobacco": {
        const v = parseYesNo(text);
        if (v === null) {
          reAsk("I didn't catch that — please say yes or no.", "tobacco");
          return;
        }
        verify(
          v ? "tobacco user, yes" : "non-tobacco, no",
          () => setTobacco(v),
          "income",
          "tobacco",
        );
        return;
      }
      case "income": {
        const t = text.toLowerCase();
        const found = INCOME_SPOKEN.find((b) => b.matches.test(t));
        if (!found) {
          reAsk(
            "Please pick one: under 25 thousand, 25 to 50, 50 to 100, 100 to 200, over 200, or prefer not to say.",
            "income",
          );
          return;
        }
        verify(`income ${found.band}`, () => setIncome(found.band), "costPref", "income");
        return;
      }
      case "costPref": {
        const t = text.toLowerCase();
        if (/predict|surprise|stable|fixed/.test(t)) {
          verify(
            "priority: predictability",
            () => setCostPref("predictability"),
            "conditionsAsk",
            "costPref",
          );
          return;
        }
        if (/minim|low(est)?|cheap|save|monthly/.test(t)) {
          verify(
            "priority: minimize monthly cost",
            () => setCostPref("minimize_monthly"),
            "conditionsAsk",
            "costPref",
          );
          return;
        }
        reAsk("Please say either 'minimize monthly cost' or 'predictability'.", "costPref");
        return;
      }
      case "conditionsAsk": {
        const v = parseYesNo(text);
        if (v === null) {
          reAsk("Please say yes or no.", "conditionsAsk");
          return;
        }
        verify(
          v ? "yes, you have chronic health conditions" : "no chronic health conditions",
          () => {},
          v ? "conditionsAdd" : "medsAsk",
          "conditionsAsk",
        );
        return;
      }
      case "conditionsAdd": {
        const t = text.toLowerCase();
        if (/no more|none|done|that's it|finish|nothing else|move on/.test(t)) {
          verify(
            conditions.length
              ? `done adding conditions — ${conditions.length} listed`
              : "done adding conditions — none listed",
            () => {},
            "medsAsk",
            "conditionsAdd",
          );
          return;
        }
        // Try to match known conditions, otherwise accept free text
        const match = matchOption(text, CONDITIONS as unknown as string[]);
        const value = match ?? text.trim();
        verify(
          `condition ${value}`,
          () => setConditions((p) => (p.includes(value) ? p : [...p, value])),
          "conditionsAdd",
          "conditionsAdd",
        );
        return;
      }
      case "medsAsk": {
        const v = parseYesNo(text);
        if (v === null) {
          reAsk("Please say yes or no.", "medsAsk");
          return;
        }
        verify(
          v ? "yes, you take prescription medications" : "no prescription medications",
          () => {},
          v ? "medsName" : "confirm",
          "medsAsk",
        );
        return;
      }
      case "medsName": {
        // The med search step has its own interactive loop (startMedSearch).
        // handleAnswer is not used for it.
        return;
      }
      case "medsStrength": {
        const t = text.trim();
        const skip = /skip|don'?t know|not sure|none/i.test(t);
        const strength = skip
          ? ""
          : t
              .replace(/milligrams?/gi, "mg")
              .replace(/micrograms?/gi, "mcg")
              .replace(/units?/gi, "u");
        verify(
          strength ? `strength ${strength}` : "no strength (skipped)",
          () => {
            const local = bestMedicationMatch(pendingMedName);
            const m = blankMed(pendingMedName, strength || local?.strength || "");
            if (local) {
              m.dosage_form = local.form ?? m.dosage_form;
              m.frequency = local.freq ?? m.frequency;
              m.estimated_monthly_retail = local.retail ?? m.estimated_monthly_retail;
              m.resolved_diagnosis =
                resolveDiagnosis(local.name) ?? local.category ?? m.resolved_diagnosis;
            }
            setMeds((p) => [...p, m]);
            setPendingMedName("");
          },
          "medsMore",
          "medsStrength",
        );
        return;
      }
      case "medsMore": {
        const v = parseYesNo(text);
        if (v === true) {
          nextStep("medsName");
          return;
        }
        if (v === false) {
          nextStep("confirm");
          return;
        }
        reAsk("Please say yes or no.", "medsMore");
        return;
      }
      case "verify": {
        const v = parseConfirmation(text);
        if (v === true) {
          const p = pendingRef.current;
          pendingRef.current = null;
          if (p) {
            p.apply();
            nextStep(p.next);
          }
          return;
        }
        if (v === false) {
          const p = pendingRef.current;
          pendingRef.current = null;
          if (p) {
            // Re-ask the original question for this step
            setStep(p.from);
            setTimeout(() => askForStep(p.from), 250);
          }
          return;
        }
        reAsk("Was that right? Please say yes or no.", "verify");
        return;
      }
      case "confirm": {
        const v = parseConfirmation(text);
        if (v === true) {
          void submit();
          return;
        }
        if (v === false) {
          void ask("Okay — switching to the manual form so you can edit anything.", "done", {
            skipListen: true,
          });
          onSwitchToManual?.();
          return;
        }
        reAsk("Should I create the comparison? Please say yes or no.", "confirm");
        return;
      }
      default:
        return;
    }
  };

  // Advance to the next step and ask its question. Some steps depend on
  // values that were just set — pass `extra` for those (avoids stale closure).
  const nextStep = (s: StepKey, _extra?: unknown) => {
    void _extra;
    // Track step history for "go back" (skip transient verify state)
    if (stepRef.current !== "verify" && stepRef.current !== s) {
      historyRef.current.push(stepRef.current);
    }
    setStep(s);
    setTimeout(() => askForStep(s), 250);
  };

  // Speak a short echo of what we parsed and confirm before applying.
  const verify = (summary: string, apply: () => void, next: StepKey, from: StepKey) => {
    pendingRef.current = { apply, next, from };
    setStep("verify");
    setTimeout(() => void ask(`I heard ${summary}. Is that correct? Yes or no.`, "verify"), 250);
  };

  const goBack = () => {
    // Discard any pending verification
    pendingRef.current = null;
    let prev = historyRef.current.pop();
    // Skip over verify frames if any slipped in
    while (prev === "verify") prev = historyRef.current.pop();
    if (!prev || prev === "intro") {
      void speak("There's no previous question.");
      // Restore the current step so the user can keep going
      setTimeout(
        () =>
          askForStep(
            stepRef.current === "verify"
              ? (pendingRef.current?.from ?? "birthYear")
              : stepRef.current,
          ),
        250,
      );
      return;
    }
    setStep(prev);
    setTimeout(() => askForStep(prev), 250);
  };

  const askForStep = (s: StepKey) => {
    switch (s) {
      case "birthYear":
        return void ask("What year were you born?", "birthYear");
      case "zip":
        return void ask("What are the first three digits of your ZIP code?", "zip");
      case "county": {
        const opts = countyOptions.length ? countyOptions : countiesForZip3(zip3);
        if (opts.length === 0) {
          return void ask(
            "I don't have counties for that ZIP. Please say your county name.",
            "county",
          );
        }
        return void startKeyPick(
          "Which county?",
          opts.map((o) => o.county),
          (idx) => {
            const picked = opts[idx];
            if (!picked) {
              void ask("Sorry, I lost track. Let's try again.", "county");
              return;
            }
            verify(`county ${picked.county}`, () => setCounty(picked.county), "gender", "county");
          },
          () => {
            // Cycled through every option without a key press — fall back to voice
            void ask(
              `I didn't catch a key press. Please say one of: ${opts.map((o) => o.county).join(", ")}.`,
              "county",
            );
          },
        );
      }
      case "gender":
        return void ask(
          "What is your gender? Female, male, non-binary, or prefer not to say?",
          "gender",
        );
      case "tobacco":
        return void ask("Do you use tobacco? Yes or no?", "tobacco");
      case "income":
        return void ask(
          "Which income band fits you best? Under fifteen thousand, fifteen to thirty-five, thirty-five to fifty-five, fifty-five to seventy-five, seventy-five to ninety-five, ninety-five to one fifteen, over one fifteen thousand, or prefer not to say?",
          "income",
        );
      case "costPref":
        return void ask(
          "What matters more — minimizing your monthly cost, or predictability with no surprise bills?",
          "costPref",
        );
      case "conditionsAsk":
        return void ask("Do you have any chronic health conditions? Yes or no?", "conditionsAsk");
      case "conditionsAdd": {
        const remaining = (CONDITIONS as readonly string[]).filter((c) => !conditions.includes(c));
        if (remaining.length === 0) {
          return void ask(
            "You've covered the common ones. Say another condition, or say 'done'.",
            "conditionsAdd",
          );
        }
        return void startKeyPick(
          "Which condition? Or press a key on the 'none of these' option to type one in.",
          [...remaining, "None of these / I'll say my own"],
          (idx) => {
            if (idx === remaining.length) {
              void ask(
                "Okay — please say the condition. Or say 'done' to finish.",
                "conditionsAdd",
              );
              return;
            }
            const value = remaining[idx];
            verify(
              `condition ${value}`,
              () => setConditions((p) => (p.includes(value) ? p : [...p, value])),
              "conditionsAdd",
              "conditionsAdd",
            );
          },
          () => {
            void ask(
              "I didn't catch a key press. Say a condition, or say 'done' to finish.",
              "conditionsAdd",
            );
          },
        );
      }
      case "medsAsk":
        return void ask("Do you take any prescription medications? Yes or no?", "medsAsk");
      case "medsName":
        return void startMedSearch();
      case "medsStrength":
        return void ask(
          `What strength of ${pendingMedName}? For example, ten milligrams. Or say "skip" if you're not sure.`,
          "medsStrength",
        );
      case "medsMore":
        return void ask("Any other medications? Yes or no?", "medsMore");
      case "confirm": {
        const summary = `Let me confirm: born ${birthYear}, ZIP ${zip3}, ${county}, ${gender.replace(/_/g, " ")}, ${tobacco ? "tobacco user" : "non-tobacco"}, income ${income}, priority ${costPref === "minimize_monthly" ? "minimize cost" : "predictability"}, ${conditions.length} condition${conditions.length === 1 ? "" : "s"}, ${meds.length} medication${meds.length === 1 ? "" : "s"}. Should I create the comparison? Yes or no?`;
        return void ask(summary, "confirm");
      }
      default:
        return;
    }
  };

  // ---- Interactive medication picker ----
  const pickMed = (name: string) => {
    cancelMedLoopRef.current = true;
    stopListening();
    setPendingMedName(name);
    setMedQuery("");
    nextStep("medsStrength");
  };

  const cancelMedSearch = () => {
    cancelMedLoopRef.current = true;
    stopListening();
    setMedQuery("");
    nextStep(meds.length ? "medsMore" : "medsAsk");
  };

  const startMedSearch = async () => {
    setMedQuery("");
    cancelMedLoopRef.current = false;
    await ask(
      "Say the medication name, or spell it letter by letter. I'll show matches as you go. Click Add when you see the right one, say keep going to refine, or type to narrow it down.",
      "medsName",
      { skipListen: true },
    );
  };

  const medListenLoop = async () => {
    // Medication names are entered via the search box (voice requires a click to unlock mic).
  };

  // Read medication match names one at a time; any key picks the current one.
  const readMedOptions = async (names: string[]) => {
    if (!names.length) return;
    // Blur the search input so global key handler isn't swallowed by typing
    try {
      (document.activeElement as HTMLElement | null)?.blur();
    } catch {
      /* noop */
    }
    await startKeyPick(
      "Here are the closest matches.",
      names,
      (idx) => {
        pickMed(names[idx]);
      },
      () => {
        cancelMedLoopRef.current = false;
      },
    );
  };

  // Cancel the med-search loop whenever we leave the medsName step
  useEffect(() => {
    if (step !== "medsName") cancelMedLoopRef.current = true;
  }, [step]);

  // Cancel any in-flight key-pick when the step changes
  useEffect(() => {
    stopKeyPick(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [step]);

  const submit = async () => {
    setStep("submitting");
    setSubmitting(true);
    await speak("Creating your plan comparison now.");
    const { data, error } = await supabase.rpc("create_scenario", {
      p_birth_year: birthYear as number,
      p_zip3: zip3,
      p_gender: gender,
      p_tobacco: tobacco,
      p_income_band: income,
      p_cost_preference: costPref,
      p_medications: meds as unknown as never,
      p_conditions: conditions as unknown as never,
      p_preferences: { county } as unknown as never,
    });
    setSubmitting(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not create comparison");
      setStep("confirm");
      return;
    }
    const code = data as string;
    try {
      sessionStorage.setItem(
        `scenario:${code}`,
        JSON.stringify({
          scenarioCode: code,
          year: new Date().getFullYear() < 2027 ? 2026 : 2027,
          birthYear,
          zip3,
          county,
          gender,
          tobacco,
          incomeBand: income,
          costPreference: costPref,
          conditions,
          medications: meds,
        }),
      );
    } catch {
      /* ignore quota */
    }
    try {
      (await import("@/lib/scenario-history")).rememberScenario(code);
    } catch {
      /* ignore */
    }
    await speak(`Done. Your comparison ID is ${code.split("").join(" ")}.`);
    setStep("done");
    onDone?.(code);
  };

  // Add common-meds suggestion when conditions known and meds empty.
  useEffect(() => {
    if (step !== "medsAsk") return;
    const suggestions = conditions.flatMap((c) => getCommonMedsForCondition(c)).slice(0, 4);
    if (suggestions.length) {
      setTranscript((p) => [
        ...p,
        {
          q: `Common for your conditions: ${suggestions.map((s) => s.name).join(", ")}.`,
          speaker: "assistant",
        },
      ]);
    }
  }, [step, conditions]);

  const pauseVoice = () => {
    flowEpochRef.current += 1;
    askTokenRef.current += 1;
    listenAbortRef.current = true;
    pausedRef.current = true;
    setPaused(true);
    stopListening();
    clearAnswerCapture();
    stopKeyPick();
    cancelSpeech();
    setSpeaking(false);
    toast.message("Paused — click Resume, then Repeat question when ready.");
  };

  const resumeVoice = () => {
    pausedRef.current = false;
    listenAbortRef.current = false;
    setPaused(false);
    toast.message("Resumed — press Repeat question to hear it again.");
  };

  const repeatQuestion = () => {
    if (pausedRef.current) {
      toast.message("Click Resume first.");
      return;
    }
    if (speaking || listening) {
      flowEpochRef.current += 1;
      listenAbortRef.current = true;
      stopListening();
      cancelSpeech();
      setSpeaking(false);
    }
    const prompt = currentPromptRef.current;
    const expect =
      prompt?.expect ??
      (stepRef.current === "verify" ? "verify" : stepRef.current);
    const question = prompt?.question;

    flowEpochRef.current += 1;
    listenAbortRef.current = false;
    clearAnswerCapture();
    const epoch = flowEpochRef.current;

    setTimeout(() => {
      if (epoch !== flowEpochRef.current || pausedRef.current) return;
      if (question) {
        void ask(question, expect, { silentTranscript: true });
      } else {
        void askForStep(stepRef.current);
      }
    }, 150);
  };

  const retryListen = () => {
    if (pausedRef.current || speaking) return;
    if (answerCapture) {
      startSpeakingAnswer();
      return;
    }
    toast.message("Press Repeat question first, then Start speaking.");
  };
  const skip = () => {
    const s = stepRef.current;
    // Skip is allowed on optional bits
    if (s === "conditionsAsk" || s === "conditionsAdd") nextStep("medsAsk");
    else if (s === "medsAsk" || s === "medsMore") nextStep("confirm");
    else if (s === "medsStrength") {
      setMeds((p) => [...p, blankMed(pendingMedName)]);
      setPendingMedName("");
      nextStep("medsMore");
    } else toast.message("This question can't be skipped.");
  };
  const submitTyped = () => {
    if (!typedAnswer.trim()) return;
    setTyping(false);
    handleAnswer(stepRef.current, typedAnswer.trim());
    setTypedAnswer("");
  };

  // Cleanup on unmount
  useEffect(
    () => () => {
      speechSessionRef.current?.stop();
      speechSessionRef.current = null;
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    },
    [],
  );

  // ------------------- Start -------------------
  const begin = () => {
    primeVoiceSession();
    void beginAsync();
  };

  const beginAsync = async () => {
    setTranscript([]);
    setSpeaking(true);
    try {
      await speakVoiceTextImmediate(VOICE_WIZARD_INTRO);
      await waitUntilSpeechSilent(20000);
    } finally {
      setSpeaking(false);
    }
    nextStep("birthYear");
  };

  const testSpeakers = () => {
    if (speaking || testingMic) return;
    primeVoiceSession();
    const speechPromise = speakVoiceTextImmediate(SPEAKER_TEST_PHRASE);
    void (async () => {
      setSpeaking(true);
      try {
        const started = await finishSpeakerTestFromUserGesture(speechPromise);
        if (started) {
          toast.success("Speaker test finished. Did you hear the voice and beep?");
        } else {
          toast.error(
            "No speech started. Check system volume, browser tab mute, and try Chrome or Edge.",
          );
        }
      } catch {
        toast.error(
          "Speaker test failed. Check system volume, browser tab mute, and try Chrome or Edge.",
        );
      } finally {
        setSpeaking(false);
      }
    })();
  };

  const testMic = () => {
    if (testingMic || listening || speaking) return;
    primeVoiceSession();
    void primeMicAccess(selectedMicId || undefined).catch(() => undefined);
    const speechPromise = speakVoiceTextImmediate(MIC_TEST_PROMPT);
    void (async () => {
      setTestingMic(true);
      setMicTestReady(false);
      setLiveListenText("");
      setSpeaking(true);
      try {
        await speechPromise;
        await waitUntilSpeechSilent(12000);
        setSpeaking(false);
        await playVoiceBeep();
        await new Promise((r) => setTimeout(r, 300));
        tryAutoListen("micTest");
      } catch {
        setTestingMic(false);
        setMicTestReady(false);
      } finally {
        setSpeaking(false);
      }
    })();
  };

  const startMicTestListen = () => {
    if (listening) return;
    tryAutoListen("micTest");
  };

  if (voiceReady === null) {
    return (
      <Card className="glass p-6 max-w-2xl mx-auto text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (!supported) {
    return (
      <Card className="glass p-6 max-w-2xl mx-auto text-center space-y-4">
        <h3 className="font-display text-xl font-bold">Voice mode not supported</h3>
        <p className="text-sm text-muted-foreground">
          Your browser doesn't support the Web Speech API. Try Chrome, Edge, or Safari — or use the
          manual form.
        </p>
        <Button onClick={onSwitchToManual}>Use manual form</Button>
      </Card>
    );
  }

  // ------------------- UI -------------------
  return (
    <Card className={`glass max-w-2xl mx-auto p-4 sm:p-5 ${step === "intro" ? "space-y-2" : "space-y-4"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-tight sm:text-xl">Voice intake</h3>
          {step === "intro" ? (
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
              <strong>Test your mic first</strong> — after the beep, speak hello (listening starts
              automatically).
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              I'll ask, you answer. No typing required. Wait for the beep, then speak.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            active={speaking}
            color="primary"
            icon={<Volume2 className="h-3 w-3" />}
            label="Speaking"
          />
          <Badge
            active={listening}
            color="destructive"
            icon={listening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            label="Listening"
          />
        </div>
      </div>

      {step !== "intro" && step !== "done" && step !== "submitting" && (
        <div className="flex gap-2">
          <Button
            variant={paused ? "default" : "outline"}
            size="sm"
            className="flex-1 h-9"
            onClick={paused ? resumeVoice : pauseVoice}
          >
            {paused ? (
              <Play className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <Pause className="h-3.5 w-3.5 mr-1.5" />
            )}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9"
            onClick={repeatQuestion}
            disabled={paused}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Repeat question
          </Button>
        </div>
      )}

      {step === "intro" && (
        <div className="space-y-2">
          <div className="rounded-lg border border-primary/20 bg-muted/30 px-3 py-2.5 space-y-2">
            <p className="text-[11px] font-semibold text-foreground">Microphone</p>
            <select
              className="w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm"
              value={selectedMicId}
              onFocus={() => void refreshMicDevices()}
              onChange={(e) => setSelectedMicId(e.target.value)}
            >
              {micDevices.length === 0 ? (
                <option value="">Click Check mic signal to detect mics</option>
              ) : (
                micDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))
              )}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8"
              onClick={checkMicSignal}
              disabled={speaking || listening}
            >
              {checkingMicSignal ? "Stop mic signal check" : "Check mic signal"}
            </Button>
            {checkingMicSignal && (
              <>
                {micSignal?.deviceLabel && (
                  <p className="text-[10px] text-center text-muted-foreground">
                    Active device: <strong>{micSignal.deviceLabel}</strong>
                  </p>
                )}
                <MicVolumeControl
                  level={hardwareMicLevel}
                  active
                  mode="hardware"
                  className="pt-1"
                />
                {micSignal?.hint && (
                  <p
                    className={cn(
                      "text-[10px] text-center leading-snug",
                      micSignal.quality === "good"
                        ? "text-emerald-700 font-medium"
                        : micSignal.quality === "noise"
                          ? "text-amber-800"
                          : "text-muted-foreground",
                    )}
                  >
                    {micSignal.hint}
                  </p>
                )}
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8"
              onClick={browserRecordTest}
              disabled={speaking || listening || browserRecording}
            >
              {browserRecording ? "Recording…" : "Browser record test (3 sec)"}
            </Button>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Windows mic works? Good. Voice uses <strong>record + transcribe</strong> (same path as
              browser record test) — words appear within a few seconds of speaking.
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Pick your <strong>EMEET</strong> mic. Run <strong>Browser record test</strong> — you
              should hear yourself back. Then run <strong>Test mic</strong> for speech-to-text.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs"
              type="button"
              onClick={() => {
                window.open("ms-settings:sound", "_blank");
              }}
            >
              Open Windows Sound settings
            </Button>
          </div>
          <div className="flex flex-row gap-1.5 sm:gap-2">
            <Button
              ref={testMicButtonRef}
              variant="default"
              size="sm"
              className="h-8 flex-1 min-w-0 px-2 text-xs sm:h-9 sm:text-sm"
              onClick={testMic}
              disabled={speaking || testingMic || listening}
            >
              {testingMic ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin sm:mr-1.5" />
              ) : (
                <Mic className="h-3.5 w-3.5 shrink-0 sm:mr-1.5" />
              )}
              <span className="truncate">Test mic</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 flex-1 min-w-0 px-2 text-xs sm:h-9 sm:text-sm"
              onClick={testSpeakers}
              disabled={speaking || testingMic}
            >
              <Volume2 className="h-3.5 w-3.5 shrink-0 sm:mr-1.5" />
              <span className="truncate">Test speakers</span>
            </Button>
            <Button
              size="sm"
              className="h-8 flex-1 min-w-0 px-2 text-xs grad-indigo sm:h-9 sm:text-sm"
              onClick={begin}
              disabled={speaking || testingMic}
            >
              <Mic className="h-3.5 w-3.5 shrink-0 sm:mr-1.5" />
              <span className="truncate">Start intake</span>
            </Button>
          </div>
          {micTestPassed && (
            <p className="text-center text-[11px] font-medium text-emerald-700">
              Microphone check passed.
            </p>
          )}
          {testingMic && (speaking || listening || liveListenText || micTestReady) && (
            <div className="rounded-lg border-2 border-primary/50 bg-primary/5 px-3 py-2.5 space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold min-h-[1.25rem]">
                {speaking && !listening && !micTestReady ? (
                  <>
                    <Volume2 className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-primary">Listen to the prompt…</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 shrink-0 text-destructive" />
                    <span className="text-destructive">
                      {listening ? "Speak now — I'm listening" : "Starting microphone…"}
                    </span>
                  </>
                )}
              </div>
              {(listening || micTestReady) && (
                <>
                  <MicVolumeControl
                    level={speechVisualLevel}
                    active={listening}
                    mode="speech"
                    heardWords={heardSpeech}
                    className="pt-1"
                  />
                  <LiveAnswerBox
                    value={listeningDraft}
                    onChange={updateListeningDraft}
                    listening={listening}
                  />
                  <Button
                    size="sm"
                    className="w-full grad-indigo text-primary-foreground"
                    onClick={listening ? submitAnswerNow : startMicTestListen}
                    disabled={speaking && !listening && !micTestReady}
                  >
                    {listening ? (
                      <>
                        <Check className="h-4 w-4 mr-1.5" />
                        Submit answer
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-1.5" />
                        Start speaking
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {paused && step !== "intro" && step !== "done" && step !== "submitting" && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-center text-sm font-semibold text-amber-900">
          Paused — click <strong>Resume</strong> when you're ready.
        </div>
      )}

      {/* Mic readiness tip */}
      {step !== "intro" && step !== "done" && step !== "submitting" && !paused && (
        <div className="flex items-center gap-1.5 rounded-md bg-primary/5 border border-primary/10 px-2.5 py-1.5 text-[11px] text-primary">
          <Info className="h-3 w-3 shrink-0" />
          <span>
            Wait for the <strong>beep</strong> — listening starts automatically. I stop when you
            pause, echo back what I heard, then ask <strong>yes or no</strong> before moving on.
          </span>
        </div>
      )}

      {sttBlocked && !paused && step !== "intro" && step !== "done" && step !== "submitting" && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs text-amber-950">
          Voice recognition needs internet. <strong>Type your answer</strong> in the box below, or
          reconnect and click <strong>Start speaking</strong>.
        </div>
      )}

      {answerCapture && !paused && (
        <div className="rounded-lg border-2 border-primary bg-primary/5 px-4 py-3 space-y-3">
          <p className="text-center text-sm font-semibold text-primary min-h-[1.25rem]">
            {listening
              ? awaitingEchoConfirm
                ? "Listening for yes or no"
                : "Listening — speak your answer (I stop after a short pause)"
              : awaitingEchoConfirm
                ? "Say yes or no — is that correct?"
                : sttBlocked
                  ? "Voice paused — type your answer below"
                  : speaking
                    ? "Listen to the question…"
                    : "Starting microphone after the beep…"}
          </p>
          <MicVolumeControl
            level={speechVisualLevel}
            active={listening}
            mode="speech"
            heardWords={heardSpeech}
            className="px-1"
          />
          <LiveAnswerBox
            value={listeningDraft}
            onChange={updateListeningDraft}
            listening={listening}
          />
          {listening && !listeningDraft.trim() && (
            <p className="text-[10px] text-center text-muted-foreground">
              {sttStatus ??
                (speechEngineLive
                  ? "Mic is live — speak clearly. Words appear in the box as you talk."
                  : "Starting microphone…")}
            </p>
          )}
          {listening && sttStatus && listeningDraft.trim() && (
            <p className="text-[10px] text-center text-emerald-700">{sttStatus}</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            {awaitingEchoConfirm ? (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 h-10"
                  onClick={() => void confirmEchoAnswer(true)}
                  disabled={listening || speaking}
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Yes, correct
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => void confirmEchoAnswer(false)}
                  disabled={listening || speaking}
                >
                  No, try again
                </Button>
              </>
            ) : null}
            <Button
              ref={startSpeakingBtnRef}
              size="sm"
              className="flex-1 grad-indigo text-primary-foreground h-10"
              onClick={listening ? () => speechSessionRef.current?.stop() : startSpeakingAnswer}
              disabled={speaking}
            >
              <Mic className="h-4 w-4 mr-1.5" />
              {listening
                ? "Stop listening"
                : awaitingEchoConfirm
                  ? "Say yes or no"
                  : "Start speaking"}
            </Button>
            {!awaitingEchoConfirm ? (
              <Button
                size="sm"
                variant="default"
                className="flex-1 h-10"
                onClick={() => void submitCapturedAnswer()}
                disabled={listening || !listeningDraft.trim()}
              >
                <Check className="h-4 w-4 mr-1.5" />
                Submit answer
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Key-pick panel: shown while we're reading list options aloud */}
      {pickOptions.length > 0 && (
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-3 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <ListChecks className="h-4 w-4" />
            <span>Press any key when I say the right option</span>
          </div>
          <ol className="space-y-1">
            {pickOptions.map((opt, i) => {
              const active = i === pickIndex;
              const done = i < pickIndex;
              return (
                <li
                  key={`${opt}-${i}`}
                  onClick={() => {
                    const p = pickingRef.current;
                    if (!p || !p.active) return;
                    p.active = false;
                    pickingRef.current = null;
                    setPickOptions([]);
                    setPickIndex(-1);
                    try {
                      window.speechSynthesis?.cancel();
                    } catch {
                      /* noop */
                    }
                    p.onPick(i);
                  }}
                  className={`cursor-pointer rounded-md px-2.5 py-1.5 text-sm border transition flex items-center gap-2 ${
                    active
                      ? "border-primary bg-primary text-primary-foreground font-semibold animate-pulse"
                      : done
                        ? "border-border bg-muted text-muted-foreground line-through"
                        : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <span className="text-[10px] font-mono opacity-70">{i + 1}.</span>
                  <span className="truncate">{opt}</span>
                </li>
              );
            })}
          </ol>
          <p className="text-[11px] text-muted-foreground">Tip: you can also click an option.</p>
        </div>
      )}

      {/* Conversation transcript */}
      <div
        className={`bg-muted/40 border border-border rounded-lg p-3 overflow-y-auto text-sm space-y-2 ${step === "intro" ? "h-44" : "h-64"}`}
      >
        {transcript.length === 0 && step !== "intro" && (
          <div className="text-muted-foreground text-center py-12 space-y-2">
            <p className="text-[11px]">
              Tip: the mic opens after the beep — watch for the Listening indicator.
            </p>
          </div>
        )}
        {transcript.map((t, i) => (
          <div key={i} className={t.speaker === "you" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${t.speaker === "you" ? "bg-primary text-primary-foreground" : "bg-background border border-border"}`}
            >
              {t.speaker === "you" ? "" : "🤖 "}
              {t.q}
            </div>
          </div>
        ))}
      </div>

      {lastHeard &&
        listening === false &&
        step !== "done" &&
        step !== "submitting" &&
        (step !== "intro" || testingMic) && (
          <p className="text-xs text-muted-foreground">
            Last heard: <em>"{lastHeard}"</em>
          </p>
        )}

      {/* Interactive medication picker */}
      {step === "medsName" && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={medQuery}
              onChange={(e) => setMedQuery(e.target.value)}
              placeholder="Say or spell the med name, or type here…"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMedQuery("")}
              disabled={!medQuery}
            >
              Clear
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelMedSearch}>
              Cancel
            </Button>
          </div>
          {medMatches.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                cancelMedLoopRef.current = true;
                stopListening();
                void readMedOptions(medMatches.map((m) => m.name));
              }}
            >
              <Volume2 className="h-3.5 w-3.5 mr-1" />
              Read these aloud (press any key to pick)
            </Button>
          )}
          {medMatches.length > 0 ? (
            <div className="space-y-1.5">
              {medMatches.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {m.strength} · {m.form} · {m.category}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => pickMed(m.name)}>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {medQuery.trim().length < 2
                ? "Start speaking, spelling, or typing — matches will appear here."
                : `No matches for "${medQuery}". Say "keep going" to add more letters, or "clear" to start over.`}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Voice commands: <strong>add</strong> (top match), <strong>add &lt;name&gt;</strong>,{" "}
            <strong>read options</strong>, <strong>keep going</strong>, <strong>clear</strong>,{" "}
            <strong>cancel</strong>.
          </p>
        </div>
      )}

      {/* Controls */}
      {step === "intro" ? null : step === "submitting" ? (
        <Button className="w-full" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating comparison…
        </Button>
      ) : step === "done" ? (
        <div className="text-center text-sm text-emerald font-semibold flex items-center justify-center gap-2">
          <Check className="h-4 w-4" />
          Comparison created.
        </div>
      ) : (
        <>
          {typing ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitTyped();
                  }
                }}
                placeholder="Type your answer…"
              />
              <Button onClick={submitTyped} disabled={!typedAnswer.trim()}>
                Send
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTyping(false);
                  setTypedAnswer("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={repeatQuestion} disabled={paused}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Repeat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={retryListen}
                disabled={listening || speaking || paused}
              >
                <Mic className="h-3.5 w-3.5 mr-1" />
                Answer again
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTyping(true)} disabled={paused}>
                <Keyboard className="h-3.5 w-3.5 mr-1" />
                Type
              </Button>
              <Button variant="outline" size="sm" onClick={skip} disabled={paused}>
                <SkipForward className="h-3.5 w-3.5 mr-1" />
                Skip
              </Button>
            </div>
          )}
        </>
      )}

      {/* Running summary */}
      <div className="text-[11px] text-muted-foreground border-t border-border pt-3 grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1">
        <span>
          Birth: <strong className="text-foreground">{birthYear ?? "—"}</strong>
        </span>
        <span>
          ZIP3: <strong className="text-foreground">{zip3 || "—"}</strong>
        </span>
        <span>
          County: <strong className="text-foreground">{county || "—"}</strong>
        </span>
        <span>
          Gender: <strong className="text-foreground">{gender.replace(/_/g, " ")}</strong>
        </span>
        <span>
          Tobacco: <strong className="text-foreground">{tobacco ? "Yes" : "No"}</strong>
        </span>
        <span>
          Income: <strong className="text-foreground">{income}</strong>
        </span>
        <span className="col-span-2 md:col-span-3">
          Conditions: <strong className="text-foreground">{conditions.join(", ") || "None"}</strong>
        </span>
        <span className="col-span-2 md:col-span-3">
          Meds:{" "}
          <strong className="text-foreground">
            {meds
              .map((m) => `${m.medication_name}${m.strength ? ` ${m.strength}` : ""}`)
              .join(", ") || "None"}
          </strong>
        </span>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          className="text-xs text-muted-foreground underline hover:text-foreground"
          onClick={onSwitchToManual}
        >
          Switch to manual form
        </button>
      </div>
    </Card>
  );
}

function Badge({
  active,
  color,
  icon,
  label,
}: {
  active: boolean;
  color: "primary" | "destructive";
  icon: React.ReactNode;
  label: string;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition";
  const off = "bg-muted text-muted-foreground border-border";
  const on =
    color === "primary"
      ? "bg-primary/10 text-primary border-primary/30 animate-pulse"
      : "bg-destructive/10 text-destructive border-destructive/30 animate-pulse";
  return (
    <span className={`${base} ${active ? on : off}`}>
      {icon}
      {label}
    </span>
  );
}
