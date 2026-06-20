/** Spoken cue before the mic opens on voice wizard / field controls. */
export const SPEAK_AFTER_BEEP_CUE = "Speak after the beep.";

const MAX_SPEAK_WAIT_MS = 30_000;

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-US" && v.localService) ??
    voices.find((v) => v.lang.startsWith("en-US")) ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

/** Wait for Chrome/Edge to load voices (first speak is silent without this). */
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

async function waitForSpeechToStart(maxMs = 1200): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
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
}

export async function playVoiceBeep(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
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
    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        /* noop */
      }
    }, 400);
  } catch {
    /* noop */
  }
}

export async function speakVoiceText(text: string): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

  await ensureSpeechVoicesReady();

  const synth = window.speechSynthesis;
  try {
    synth.cancel();
  } catch {
    /* noop */
  }

  await new Promise((r) => setTimeout(r, 120));

  try {
    synth.resume();
  } catch {
    /* noop */
  }

  await new Promise<void>((resolve) => {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1;
      utter.lang = "en-US";
      const voice = pickEnglishVoice();
      if (voice) utter.voice = voice;

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(safety);
        clearTimeout(retryTimer);
        resolve();
      };

      const cap = Math.max(6000, Math.min(MAX_SPEAK_WAIT_MS, text.length * 120));
      const safety = setTimeout(finish, cap);
      const retryTimer = setTimeout(() => {
        if (done) return;
        if (!synth.speaking && !synth.pending) {
          try {
            synth.resume();
            synth.speak(utter);
          } catch {
            /* noop */
          }
        }
      }, 450);

      utter.onend = finish;
      utter.onerror = finish;

      synth.speak(utter);
      if (synth.paused) {
        try {
          synth.resume();
        } catch {
          /* noop */
        }
      }
    } catch {
      resolve();
    }
  });

  await waitForSpeechToStart();
  await waitUntilSpeechSilent(Math.max(6000, Math.min(MAX_SPEAK_WAIT_MS, text.length * 120)));
}

/** After the question: say the cue, beep, brief pause — then open the mic. */
export async function cueMicWithBeep(): Promise<void> {
  await speakVoiceText(SPEAK_AFTER_BEEP_CUE);
  await playVoiceBeep();
  await new Promise((r) => setTimeout(r, 350));
}

/** Read the question aloud, then cue + beep — do not open the mic until this completes. */
export async function speakQuestionThenCue(question: string): Promise<void> {
  await ensureSpeechVoicesReady();
  try {
    window.speechSynthesis?.resume();
  } catch {
    /* noop */
  }
  await speakVoiceText(question);
  await new Promise((r) => setTimeout(r, 200));
  await cueMicWithBeep();
}

/** Prime voice list on first user gesture (Chrome). */
export function primeSpeechVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
}

/** Likely TV / room chatter picked up instead of a direct answer. */
export function looksLikeAmbientSpeech(text: string, maxWords = 12): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length > maxWords;
}
