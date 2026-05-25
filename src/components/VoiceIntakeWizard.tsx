import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mic, MicOff, Volume2, RotateCcw, SkipForward, Keyboard, Check, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { COMMON_MEDS_BY_CONDITION, resolveDiagnosis, searchMedCatalog, MED_CATALOG } from "@/lib/diagnosis-resolver";
import { countiesForZip3 } from "@/lib/zip3-county-lookup";
import type { Medication } from "@/lib/medicare-math";

// ------------------- Web Speech API typing -------------------
type SR = {
  start: () => void; stop: () => void; abort: () => void;
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number;
  onresult: ((e: { resultIndex?: number; results: ArrayLike<ArrayLike<{ transcript: string; confidence?: number }> & { isFinal?: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
function getRecognitionCtor(): { new (): SR } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: { new (): SR }; webkitSpeechRecognition?: { new (): SR } };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ------------------- Speech parsers -------------------
const DIGIT_WORDS: Record<string, string> = {
  zero: "0", oh: "0", o: "0", one: "1", two: "2", to: "2", too: "2", three: "3", four: "4", for: "4",
  five: "5", six: "6", seven: "7", eight: "8", ate: "8", nine: "9",
};
function parseDigits(text: string, max = 32): string {
  const tokens = text.toLowerCase().replace(/[.,!?]/g, " ").split(/\s+/).filter(Boolean);
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
  if (/\b(no|nope|nah|negative|never|not|dont|do not|incorrect|wrong|not right|not correct)\b/.test(t)) return false;
  if (/\b(yes|yeah|yep|yup|ya|correct|right|true|sure|ok|okay|affirmative|that is right|thats right|sounds right|i do|i am|smoke|smoker)\b/.test(t)) return true;
  return null;
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
    const score = tokens.reduce((acc, t) => acc + (oTokens.some((ot) => ot.includes(t) || t.includes(ot)) ? 1 : 0), 0);
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

  let best: { entry: typeof MED_CATALOG[number]; score: number } | null = null;
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

// ------------------- Config -------------------
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = CURRENT_YEAR - 110;
const INCOME_BANDS = ["Under $25k", "$25k–$50k", "$50k–$100k", "$100k–$200k", "Over $200k", "Prefer not to say"] as const;
const INCOME_SPOKEN: Array<{ band: typeof INCOME_BANDS[number]; matches: RegExp }> = [
  { band: "Under $25k", matches: /under\s*25|less than\s*25|below\s*25|twenty[\s-]?five thousand or less/i },
  { band: "$25k–$50k", matches: /25.*50|twenty[\s-]?five.*fifty/i },
  { band: "$50k–$100k", matches: /50.*100|fifty.*hundred|fifty.*one[\s-]?hundred/i },
  { band: "$100k–$200k", matches: /100.*200|hundred.*two hundred|one[\s-]?hundred.*two[\s-]?hundred/i },
  { band: "Over $200k", matches: /over\s*200|more than\s*200|above\s*200|two hundred or more/i },
  { band: "Prefer not to say", matches: /prefer not|skip|don't (want|say)|rather not/i },
];
const CONDITIONS = ["Diabetes", "Hypertension", "Heart disease", "COPD", "Cancer history", "Chronic kidney disease", "Arthritis"] as const;
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
  | "intro" | "birthYear" | "zip" | "county" | "gender" | "tobacco"
  | "income" | "costPref" | "conditionsAsk" | "conditionsAdd"
  | "medsAsk" | "medsName" | "medsStrength" | "medsMore"
  | "confirm" | "verify" | "submitting" | "done";

interface Transcript { q: string; a?: string; speaker?: "assistant" | "you" }

// ------------------- Component -------------------
export function VoiceIntakeWizard({ onDone, onSwitchToManual }: { onDone?: (code: string) => void; onSwitchToManual?: () => void }) {
  const supported = !!getRecognitionCtor() && typeof window !== "undefined" && "speechSynthesis" in window;

  // Collected data
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [zip3, setZip3] = useState("");
  const [county, setCounty] = useState("");
  const [gender, setGender] = useState<typeof GENDERS[number]>("prefer_not_to_say");
  const [tobacco, setTobacco] = useState(false);
  const [income, setIncome] = useState<typeof INCOME_BANDS[number]>("Prefer not to say");
  const [costPref, setCostPref] = useState<"minimize_monthly" | "predictability">("minimize_monthly");
  const [conditions, setConditions] = useState<string[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [pendingMedName, setPendingMedName] = useState("");

  // Conversation state
  const [step, setStep] = useState<StepKey>("intro");
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const [lastHeard, setLastHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const recRef = useRef<SR | null>(null);
  const stepRef = useRef(step); useEffect(() => { stepRef.current = step; }, [step]);
  const historyRef = useRef<StepKey[]>([]);
  const pendingRef = useRef<{ apply: () => void; next: StepKey; from: StepKey } | null>(null);

  const countyOptions = useMemo(() => /^\d{3}$/.test(zip3) ? countiesForZip3(zip3) : [], [zip3]);

  // ------------------- TTS -------------------
  const speak = (text: string) => new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { resolve(); return; }
    try {
      window.speechSynthesis.cancel();
      // Small delay after cancel() — Chrome drops the next utterance otherwise
      setTimeout(() => {
        try {
          const u = new SpeechSynthesisUtterance(text);
          u.rate = 1; u.pitch = 1; u.lang = "en-US";
          let done = false;
          const finish = () => { if (done) return; done = true; setSpeaking(false); resolve(); };
          u.onstart = () => setSpeaking(true);
          u.onend = finish;
          u.onerror = finish;
          // Safety: if onend never fires (Chrome bug), resolve after a reasonable cap
          const cap = Math.max(3000, Math.min(20000, text.length * 80));
          setTimeout(finish, cap);
          window.speechSynthesis.speak(u);
        } catch { setSpeaking(false); resolve(); }
      }, 80);
    } catch { resolve(); }
  });

  // ------------------- STT -------------------
  const listen = (timeoutMs = 16000): Promise<string> => new Promise((resolve) => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) { resolve(""); return; }
    let settled = false;
    let bestTranscript = "";
    const finish = (t?: string) => {
      if (settled) return;
      settled = true;
      const finalText = (t ?? bestTranscript).trim();
      setListening(false);
      resolve(finalText);
    };
    try {
      const rec = new Ctor();
      rec.lang = "en-US"; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 3;
      rec.onresult = (e) => {
        const result = e.results?.[e.results.length - 1];
        if (!result) return;
        const choices = Array.from(result).map((alt) => alt.transcript?.trim() ?? "").filter(Boolean);
        const picked = choices.sort((a, b) => b.length - a.length)[0] ?? "";
        if (!picked) return;
        bestTranscript = picked;
        setLastHeard(picked);
        if ((result as { isFinal?: boolean }).isFinal) finish(picked);
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          toast.error("Microphone permission denied. Please enable it in your browser settings.");
        } else if (e.error === "no-speech") {
          toast.message("I didn't catch that — try speaking a little slower and closer to the mic.");
        }
        finish("");
      };
      rec.onend = () => finish();
      recRef.current = rec;
      setListening(true);
      playBeep();
      toast.info("🎤 Your turn — speak now", { duration: 2500, id: "voice-listen" });
      rec.start();
      setTimeout(() => { try { rec.stop(); } catch { /* noop */ } }, timeoutMs);
    } catch { finish(""); }
  });

  const stopListening = () => { try { recRef.current?.abort(); } catch { /* noop */ } setListening(false); };

  // Short audible cue so the user knows the mic is now open
  const playBeep = () => {
    try {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const Ctx = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.value = 0.0001;
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      setTimeout(() => { try { ctx.close(); } catch { /* noop */ } }, 400);
    } catch { /* noop */ }
  };

  // ------------------- Conversation runner -------------------
  // Speaks the question, then listens once and routes the response.
  const ask = async (question: string, expect: StepKey, opts: { skipListen?: boolean } = {}) => {
    setTranscript((p) => [...p, { q: question, speaker: "assistant" }]);
    // Hard cap on TTS so listening always opens even if speech engine hangs
    await Promise.race([
      speak(question),
      new Promise<void>((r) => setTimeout(r, Math.max(2500, Math.min(15000, question.length * 75)))),
    ]);
    if (opts.skipListen) return;
    // Make absolutely sure speech is finished before opening mic
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    setSpeaking(false);
    await new Promise((r) => setTimeout(r, 250));
    const heard = await listen();
    if (heard) {
      await handleAnswer(expect, heard);
    } else {
      // Mic returned nothing (timeout / no-speech). Re-prompt so we don't hang —
      // especially important on the verify step where the user is just saying yes/no.
      const prompt =
        expect === "verify"
          ? "I didn't hear you. Was that right? Please say yes or no."
          : expect === "confirm"
            ? "I didn't hear you. Should I create the scenario? Please say yes or no."
            : "I didn't catch that. Could you say it again?";
      setTimeout(() => void ask(prompt, expect), 200);
    }
  };

  const reAsk = (q: string, step: StepKey) => { void ask(q, step); };
  const lastQuestion = transcript[transcript.length - 1]?.q ?? "";

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
          reAsk(`I didn't catch a valid year. Please say a year between ${MIN_BIRTH_YEAR} and ${CURRENT_YEAR}, like "nineteen fifty".`, "birthYear");
          return;
        }
        verify(`birth year ${y}`, () => setBirthYear(y), "zip", "birthYear");
        return;
      }
      case "zip": {
        const digits = parseDigits(text, 3);
        if (!/^\d{3}$/.test(digits)) {
          reAsk("Please say the first three digits of your ZIP code slowly, one at a time. For example: seven, seven, zero.", "zip");
          return;
        }
        const opts = countiesForZip3(digits);
        if (opts.length === 0) {
          reAsk(`I don't recognize ZIP prefix ${digits.split("").join(" ")}. Please say the first three digits again.`, "zip");
          return;
        }
        if (opts.length === 1) {
          const only = opts[0];
          verify(
            `ZIP ${digits.split("").join(" ")}, ${only.county}, ${only.stateCode}`,
            () => { setZip3(digits); setCounty(only.county); },
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
        const match = matchOption(text, opts.map((o) => o.county));
        if (!match) {
          reAsk(`I didn't catch that. Please say one of: ${opts.map((o) => o.county).join(", ")}.`, "county");
          return;
        }
        verify(`county ${match}`, () => setCounty(match), "gender", "county");
        return;
      }
      case "gender": {
        const t = text.toLowerCase();
        let g: typeof GENDERS[number] = "prefer_not_to_say";
        if (/female|woman|she/.test(t)) g = "female";
        else if (/\bmale\b|\bman\b|\bhe\b/.test(t)) g = "male";
        else if (/non[\s-]?binary|enby|they/.test(t)) g = "nonbinary";
        else if (/prefer not|skip|rather not|none/.test(t)) g = "prefer_not_to_say";
        verify(`gender ${g.replace(/_/g, " ")}`, () => setGender(g), "tobacco", "gender");
        return;
      }
      case "tobacco": {
        const v = parseYesNo(text);
        if (v === null) { reAsk("I didn't catch that — please say yes or no.", "tobacco"); return; }
        verify(v ? "tobacco user, yes" : "non-tobacco, no", () => setTobacco(v), "income", "tobacco");
        return;
      }
      case "income": {
        const t = text.toLowerCase();
        const found = INCOME_SPOKEN.find((b) => b.matches.test(t));
        if (!found) {
          reAsk("Please pick one: under 25 thousand, 25 to 50, 50 to 100, 100 to 200, over 200, or prefer not to say.", "income");
          return;
        }
        verify(`income ${found.band}`, () => setIncome(found.band), "costPref", "income");
        return;
      }
      case "costPref": {
        const t = text.toLowerCase();
        if (/predict|surprise|stable|fixed/.test(t)) {
          verify("priority: predictability", () => setCostPref("predictability"), "conditionsAsk", "costPref");
          return;
        }
        if (/minim|low(est)?|cheap|save|monthly/.test(t)) {
          verify("priority: minimize monthly cost", () => setCostPref("minimize_monthly"), "conditionsAsk", "costPref");
          return;
        }
        reAsk("Please say either 'minimize monthly cost' or 'predictability'.", "costPref");
        return;
      }
      case "conditionsAsk": {
        const v = parseYesNo(text);
        if (v === false) { nextStep("medsAsk"); return; }
        if (v === true) { nextStep("conditionsAdd"); return; }
        reAsk("Please say yes or no.", "conditionsAsk");
        return;
      }
      case "conditionsAdd": {
        const t = text.toLowerCase();
        if (/no more|none|done|that's it|finish|nothing else|move on/.test(t)) { nextStep("medsAsk"); return; }
        // Try to match known conditions, otherwise accept free text
        const match = matchOption(text, CONDITIONS as unknown as string[]);
        const value = match ?? text.trim();
        verify(
          `condition ${value}`,
          () => setConditions((p) => p.includes(value) ? p : [...p, value]),
          "conditionsAdd",
          "conditionsAdd",
        );
        return;
      }
      case "medsAsk": {
        const v = parseYesNo(text);
        if (v === false) { nextStep("confirm"); return; }
        if (v === true) { nextStep("medsName"); return; }
        reAsk("Please say yes or no.", "medsAsk");
        return;
      }
      case "medsName": {
        const name = text.trim().replace(/^(it'?s|the drug is|i take|i'?m on)\s+/i, "");
        if (!name) { reAsk("I didn't catch the name. Please say the drug name, or spell it letter by letter.", "medsName"); return; }
        const matched = bestMedicationMatch(name);
        const capturedName = matched?.name ?? name;
        verify(
          matched ? `medication ${matched.name} (matched from "${name}")` : `medication ${capturedName}`,
          () => setPendingMedName(capturedName),
          "medsStrength",
          "medsName",
        );
        return;
      }
      case "medsStrength": {
        const t = text.trim();
        const skip = /skip|don'?t know|not sure|none/i.test(t);
        const strength = skip ? "" : t.replace(/milligrams?/gi, "mg").replace(/micrograms?/gi, "mcg").replace(/units?/gi, "u");
        verify(
          strength ? `strength ${strength}` : "no strength (skipped)",
          () => {
            const local = bestMedicationMatch(pendingMedName);
            const m = blankMed(pendingMedName, strength || local?.strength || "");
            if (local) {
              m.dosage_form = local.form ?? m.dosage_form;
              m.frequency = local.freq ?? m.frequency;
              m.estimated_monthly_retail = local.retail ?? m.estimated_monthly_retail;
              m.resolved_diagnosis = resolveDiagnosis(local.name) ?? local.category ?? m.resolved_diagnosis;
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
        if (v === true) { nextStep("medsName"); return; }
        if (v === false) { nextStep("confirm"); return; }
        reAsk("Please say yes or no.", "medsMore");
        return;
      }
      case "verify": {
        const v = parseYesNo(text);
        if (v === true) {
          const p = pendingRef.current; pendingRef.current = null;
          if (p) { p.apply(); nextStep(p.next); }
          return;
        }
        if (v === false) {
          const p = pendingRef.current; pendingRef.current = null;
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
        const v = parseYesNo(text);
        if (v === true) { void submit(); return; }
        if (v === false) { void ask("Okay — switching to the manual form so you can edit anything.", "done", { skipListen: true }); onSwitchToManual?.(); return; }
        reAsk("Should I create the scenario? Please say yes or no.", "confirm");
        return;
      }
      default: return;
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
      setTimeout(() => askForStep(stepRef.current === "verify" ? (pendingRef.current?.from ?? "birthYear") : stepRef.current), 250);
      return;
    }
    setStep(prev);
    setTimeout(() => askForStep(prev), 250);
  };

  const askForStep = (s: StepKey) => {
    switch (s) {
      case "birthYear": return void ask("What year were you born?", "birthYear");
      case "zip": return void ask("What are the first three digits of your ZIP code?", "zip");
      case "county": {
        const opts = countyOptions.length ? countyOptions : countiesForZip3(zip3);
        return void ask(`Which county? Your options are: ${opts.map((o) => o.county).join(", ")}.`, "county");
      }
      case "gender": return void ask("What is your gender? Female, male, non-binary, or prefer not to say?", "gender");
      case "tobacco": return void ask("Do you use tobacco? Yes or no?", "tobacco");
      case "income": return void ask("Which income band fits you best? Under twenty-five thousand, twenty-five to fifty, fifty to one hundred, one hundred to two hundred, over two hundred, or prefer not to say?", "income");
      case "costPref": return void ask("What matters more — minimizing your monthly cost, or predictability with no surprise bills?", "costPref");
      case "conditionsAsk": return void ask("Do you have any chronic health conditions? Yes or no?", "conditionsAsk");
      case "conditionsAdd": return void ask("Please tell me one condition. For example: diabetes, hypertension, or COPD.", "conditionsAdd");
      case "medsAsk": return void ask("Do you take any prescription medications? Yes or no?", "medsAsk");
      case "medsName": return void ask("What's the name of the medication? You can say the drug name normally, or spell it letter by letter.", "medsName");
      case "medsStrength": return void ask(`What strength of ${pendingMedName}? For example, ten milligrams. Or say "skip" if you're not sure.`, "medsStrength");
      case "medsMore": return void ask("Any other medications? Yes or no?", "medsMore");
      case "confirm": {
        const summary = `Let me confirm: born ${birthYear}, ZIP ${zip3}, ${county}, ${gender.replace(/_/g, " ")}, ${tobacco ? "tobacco user" : "non-tobacco"}, income ${income}, priority ${costPref === "minimize_monthly" ? "minimize cost" : "predictability"}, ${conditions.length} condition${conditions.length === 1 ? "" : "s"}, ${meds.length} medication${meds.length === 1 ? "" : "s"}. Should I create the scenario? Yes or no?`;
        return void ask(summary, "confirm");
      }
      default: return;
    }
  };

  const submit = async () => {
    setStep("submitting"); setSubmitting(true);
    await speak("Creating your scenario now.");
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
      toast.error(error?.message ?? "Could not create scenario");
      setStep("confirm");
      return;
    }
    const code = data as string;
    try {
      sessionStorage.setItem(`scenario:${code}`, JSON.stringify({
        scenarioCode: code,
        year: new Date().getFullYear() < 2027 ? 2026 : 2027,
        birthYear, zip3, county, gender, tobacco,
        incomeBand: income, costPreference: costPref,
        conditions, medications: meds,
      }));
    } catch { /* ignore quota */ }
    await speak(`Done. Your scenario ID is ${code.split("").join(" ")}.`);
    setStep("done");
    onDone?.(code);
  };

  // Add common-meds suggestion when conditions known and meds empty.
  useEffect(() => {
    if (step !== "medsAsk") return;
    const suggestions = conditions.flatMap((c) => COMMON_MEDS_BY_CONDITION[c] ?? []).slice(0, 4);
    if (suggestions.length) {
      setTranscript((p) => [...p, { q: `Common for your conditions: ${suggestions.map((s) => s.name).join(", ")}.`, speaker: "assistant" }]);
    }
  }, [step, conditions]);

  // Manual controls
  const repeat = () => { if (lastQuestion) void speak(lastQuestion); };
  const retry = async () => {
    stopListening();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    const heard = await listen();
    if (heard) handleAnswer(stepRef.current, heard);
  };
  const skip = () => {
    const s = stepRef.current;
    // Skip is allowed on optional bits
    if (s === "conditionsAsk" || s === "conditionsAdd") nextStep("medsAsk");
    else if (s === "medsAsk" || s === "medsMore") nextStep("confirm");
    else if (s === "medsStrength") {
      setMeds((p) => [...p, blankMed(pendingMedName)]);
      setPendingMedName(""); nextStep("medsMore");
    } else toast.message("This question can't be skipped.");
  };
  const submitTyped = () => {
    if (!typedAnswer.trim()) return;
    setTyping(false);
    handleAnswer(stepRef.current, typedAnswer.trim());
    setTypedAnswer("");
  };

  // Cleanup on unmount
  useEffect(() => () => {
    try { recRef.current?.abort(); } catch { /* noop */ }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  // ------------------- Start -------------------
  const begin = async () => {
    setTranscript([]);
    // Pre-warm mic permission so the first Listening window actually captures audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      toast.error("Microphone access is required for voice intake. Please allow it and try again.");
      return;
    }
    await speak("Hi — I'll ask you a few questions to build your Medicare scenario. You can repeat any question, retry your answer, or type instead. Let's start.");
    nextStep("birthYear");
  };

  if (!supported) {
    return (
      <Card className="glass p-6 max-w-2xl mx-auto text-center space-y-4">
        <h3 className="font-display text-xl font-bold">Voice mode not supported</h3>
        <p className="text-sm text-muted-foreground">Your browser doesn't support the Web Speech API. Try Chrome, Edge, or Safari — or use the manual form.</p>
        <Button onClick={onSwitchToManual}>Use manual form</Button>
      </Card>
    );
  }

  // ------------------- UI -------------------
  return (
    <Card className="glass p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold">Voice intake</h3>
          <p className="text-xs text-muted-foreground">I'll ask, you answer. No typing required.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge active={speaking} color="primary" icon={<Volume2 className="h-3 w-3" />} label="Speaking" />
          <Badge active={listening} color="destructive" icon={listening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />} label="Listening" />
        </div>
      </div>

      {/* Mic readiness tip */}
      {step !== "intro" && step !== "done" && step !== "submitting" && (
        <div className="flex items-center gap-1.5 rounded-md bg-primary/5 border border-primary/10 px-2.5 py-1.5 text-[11px] text-primary">
          <Info className="h-3 w-3 shrink-0" />
          <span>Wait for the beep and the <strong>"Speak now"</strong> banner before answering.</span>
        </div>
      )}

      {/* Big "Speak now" banner while the mic is open */}
      {listening && (
        <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-destructive bg-destructive/10 px-4 py-3 text-destructive font-bold animate-pulse">
          <Mic className="h-5 w-5" />
          <span>Speak now — I'm listening</span>
        </div>
      )}

      {/* Conversation transcript */}
      <div className="bg-muted/40 border border-border rounded-lg p-3 h-64 overflow-y-auto text-sm space-y-2">
        {transcript.length === 0 && (
          <div className="text-muted-foreground text-center py-12 space-y-2">
            <p>Press <strong>Start voice intake</strong> below — I'll ask the first question.</p>
            <p className="text-[11px]">Tip: wait until the Listening indicator turns on before answering.</p>
          </div>
        )}
        {transcript.map((t, i) => (
          <div key={i} className={t.speaker === "you" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 ${t.speaker === "you" ? "bg-primary text-primary-foreground" : "bg-background border border-border"}`}>
              {t.speaker === "you" ? "" : "🤖 "}{t.q}
            </div>
          </div>
        ))}
      </div>

      {lastHeard && listening === false && step !== "intro" && step !== "done" && step !== "submitting" && (
        <p className="text-xs text-muted-foreground">Last heard: <em>"{lastHeard}"</em></p>
      )}

      {/* Controls */}
      {step === "intro" ? (
        <Button className="w-full grad-indigo" onClick={begin}><Mic className="h-4 w-4 mr-2" />Start voice intake</Button>
      ) : step === "submitting" ? (
        <Button className="w-full" disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating scenario…</Button>
      ) : step === "done" ? (
        <div className="text-center text-sm text-emerald font-semibold flex items-center justify-center gap-2"><Check className="h-4 w-4" />Scenario created.</div>
      ) : (
        <>
          {typing ? (
            <div className="flex gap-2">
              <Input autoFocus value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitTyped(); } }}
                placeholder="Type your answer…" />
              <Button onClick={submitTyped} disabled={!typedAnswer.trim()}>Send</Button>
              <Button variant="outline" onClick={() => { setTyping(false); setTypedAnswer(""); }}>Cancel</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={repeat} disabled={speaking}><Volume2 className="h-3.5 w-3.5 mr-1" />Repeat</Button>
              <Button variant="outline" size="sm" onClick={retry} disabled={listening}><RotateCcw className="h-3.5 w-3.5 mr-1" />Retry</Button>
              <Button variant="outline" size="sm" onClick={() => setTyping(true)}><Keyboard className="h-3.5 w-3.5 mr-1" />Type</Button>
              <Button variant="outline" size="sm" onClick={skip}><SkipForward className="h-3.5 w-3.5 mr-1" />Skip</Button>
            </div>
          )}
        </>
      )}

      {/* Running summary */}
      <div className="text-[11px] text-muted-foreground border-t border-border pt-3 grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1">
        <span>Birth: <strong className="text-foreground">{birthYear ?? "—"}</strong></span>
        <span>ZIP3: <strong className="text-foreground">{zip3 || "—"}</strong></span>
        <span>County: <strong className="text-foreground">{county || "—"}</strong></span>
        <span>Gender: <strong className="text-foreground">{gender.replace(/_/g, " ")}</strong></span>
        <span>Tobacco: <strong className="text-foreground">{tobacco ? "Yes" : "No"}</strong></span>
        <span>Income: <strong className="text-foreground">{income}</strong></span>
        <span className="col-span-2 md:col-span-3">Conditions: <strong className="text-foreground">{conditions.join(", ") || "None"}</strong></span>
        <span className="col-span-2 md:col-span-3">Meds: <strong className="text-foreground">{meds.map((m) => `${m.medication_name}${m.strength ? ` ${m.strength}` : ""}`).join(", ") || "None"}</strong></span>
      </div>

      <div className="flex justify-center">
        <button type="button" className="text-xs text-muted-foreground underline hover:text-foreground" onClick={onSwitchToManual}>
          Switch to manual form
        </button>
      </div>
    </Card>
  );
}

function Badge({ active, color, icon, label }: { active: boolean; color: "primary" | "destructive"; icon: React.ReactNode; label: string }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border transition";
  const off = "bg-muted text-muted-foreground border-border";
  const on = color === "primary"
    ? "bg-primary/10 text-primary border-primary/30 animate-pulse"
    : "bg-destructive/10 text-destructive border-destructive/30 animate-pulse";
  return <span className={`${base} ${active ? on : off}`}>{icon}{label}</span>;
}