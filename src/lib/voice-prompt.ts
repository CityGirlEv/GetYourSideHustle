/** Spoken once at start — do not repeat before every question. */
export const VOICE_WIZARD_INTRO =
  "I'll ask, you answer — no typing required. Wait for the beep after each question, then speak your answer. You can pause anytime, repeat a question, or type instead. Let's begin.";

export const SPEAKER_TEST_PHRASE =
  "Testing your speakers. If you can hear this, voice is working.";

export const MIC_TEST_PROMPT =
  "After the beep, say hello so I can check your microphone.";

const MAX_SPEAK_WAIT_MS = 30_000;

let sharedBeepCtx: AudioContext | null = null;

function getBeepAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedBeepCtx || sharedBeepCtx.state === "closed") {
    sharedBeepCtx = new Ctx();
  }
  return sharedBeepCtx;
}

/** Call synchronously on user click — unlocks Web Audio beeps (browser autoplay policy). */
export function primeVoiceAudio(): void {
  try {
    const ctx = getBeepAudioContext();
    if (!ctx) return;
    void ctx.resume();
  } catch {
    /* noop */
  }
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang === "en-US" && v.default) ??
    voices.find((v) => v.lang.startsWith("en-US") && /microsoft|google|samantha|zira|david|aria/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en-US")) ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

function buildUtterance(text: string, voices?: SpeechSynthesisVoice[]): SpeechSynthesisUtterance {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 1;
  utter.volume = 1;
  utter.lang = "en-US";
  const list = voices ?? (typeof window !== "undefined" ? window.speechSynthesis.getVoices() : []);
  const voice = pickEnglishVoice(list);
  if (voice) utter.voice = voice;
  return utter;
}

/** Wait for Chrome/Edge to load voices (call after a sync getVoices in a click handler). */
export function ensureSpeechVoicesReady(timeoutMs = 3000): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    const synth = window.speechSynthesis;
    if (synth.getVoices().length > 0) {
      resolve();
      return;
    }
    const finish = () => resolve();
    const timer = setTimeout(finish, timeoutMs);
    synth.addEventListener(
      "voiceschanged",
      () => {
        clearTimeout(timer);
        finish();
      },
      { once: true },
    );
    synth.getVoices();
  });
}

/** Wait until the browser finishes speaking (checks speaking + pending). */
export function waitUntilSpeechSilent(maxMs = MAX_SPEAK_WAIT_MS): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    const synth = window.speechSynthesis;
    const deadline = Date.now() + maxMs;
    const tick = () => {
      if (!synth.speaking && !synth.pending) {
        resolve();
        return;
      }
      if (Date.now() >= deadline) {
        resolve();
        return;
      }
      setTimeout(tick, 80);
    };
    tick();
  });
}

export async function waitForSpeechToStart(maxMs = 2000): Promise<boolean> {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  const synth = window.speechSynthesis;
  const deadline = Date.now() + maxMs;
  while (!synth.speaking && !synth.pending && Date.now() < deadline) {
    if (synth.paused) {
      try {
        synth.resume();
      } catch {
        /* noop */
      }
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  return synth.speaking || synth.pending;
}

export function cancelSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

/**
 * Start TTS synchronously (must be called in the same turn as a user click/key).
 * Returns a promise that resolves when speech finishes.
 */
export function speakVoiceTextImmediate(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) {
      resolve();
      return;
    }

    const synth = window.speechSynthesis;
    cancelSpeech();

    try {
      synth.resume();
    } catch {
      /* noop */
    }

    const voices = synth.getVoices();
    const utter = buildUtterance(text, voices);

    let done = false;
    let keepAlive: ReturnType<typeof setInterval> | null = null;
    const finish = () => {
      if (done) return;
      done = true;
      if (keepAlive) clearInterval(keepAlive);
      clearTimeout(safety);
      resolve();
    };

    utter.onend = finish;
    utter.onerror = (e) => {
      console.warn("[voice] speech error", e.error);
      finish();
    };

    const cap = Math.max(8000, Math.min(MAX_SPEAK_WAIT_MS, text.length * 120));
    const safety = setTimeout(finish, cap);

    keepAlive = setInterval(() => {
      if (synth.speaking || synth.pending) {
        try {
          synth.resume();
        } catch {
          /* noop */
        }
      }
    }, 4000);

    synth.speak(utter);
    if (synth.paused) {
      try {
        synth.resume();
      } catch {
        /* noop */
      }
    }
  });
}

export async function speakVoiceText(text: string): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  await ensureSpeechVoicesReady();
  await speakVoiceTextImmediate(text);
  await waitUntilSpeechSilent(Math.max(8000, Math.min(MAX_SPEAK_WAIT_MS, text.length * 120)));
}

/** Loud mic-ready beep — awaits AudioContext resume so the tone is actually audible. */
export async function playVoiceBeep(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const ctx = getBeepAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    if (ctx.state !== "running") {
      await new Promise((r) => setTimeout(r, 40));
      if (ctx.state === "suspended") await ctx.resume();
    }

    const t0 = ctx.currentTime + 0.03;
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "square";
      gain.gain.setValueAtTime(0.0001, t0 + start);
      gain.gain.exponentialRampToValueAtTime(0.85, t0 + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + start);
      osc.stop(t0 + start + dur + 0.05);
    };

    playTone(880, 0, 0.22);
    playTone(1175, 0.24, 0.24);
    await new Promise((r) => setTimeout(r, 600));
  } catch (e) {
    console.warn("[voice] beep failed", e);
  }
}

/** Fire-and-forget beep — primes audio then plays; prefer await playVoiceBeep() after async work. */
export function playVoiceBeepSync(): void {
  primeVoiceAudio();
  void playVoiceBeep();
}

/** Prime voice list on first user gesture (Chrome). No beep — beep comes after each question. */
export function primeSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  try {
    window.speechSynthesis.resume();
  } catch {
    /* noop */
  }
  return window.speechSynthesis.getVoices();
}

/** Unlock TTS + Web Audio in one call — use synchronously on button click. */
export function primeVoiceSession(): SpeechSynthesisVoice[] {
  primeVoiceAudio();
  return primeSpeechVoices();
}

/** Question first, then beep — intro explains: wait for the beep, then speak. */
export async function speakQuestionThenCue(question: string): Promise<void> {
  await speakVoiceText(question);
  await playVoiceBeep();
}

/** Run after speakVoiceTextImmediate in the same click turn (Chrome user-gesture rule). */
export async function finishSpeakerTestFromUserGesture(
  speechPromise: Promise<void>,
): Promise<boolean> {
  const started =
    window.speechSynthesis?.speaking ||
    window.speechSynthesis?.pending ||
    (await waitForSpeechToStart(2000));
  await speechPromise;
  await waitUntilSpeechSilent(12000);
  await playVoiceBeep();
  return started;
}

/** Convenience wrapper — starts speech synchronously; use finishSpeakerTestFromUserGesture when already speaking. */
export async function testSpeakersFromUserGesture(): Promise<boolean> {
  primeSpeechVoices();
  const speechPromise = speakVoiceTextImmediate(SPEAKER_TEST_PHRASE);
  return finishSpeakerTestFromUserGesture(speechPromise);
}

/** Likely TV / room chatter picked up instead of a direct answer. */
export function looksLikeAmbientSpeech(text: string, maxWords = 12): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length > maxWords;
}
