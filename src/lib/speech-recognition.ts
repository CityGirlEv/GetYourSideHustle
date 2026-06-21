/** Web Speech API helpers — tuned for Chrome/Edge on Windows. */

export type SpeechRecognitionInstance = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult:
    | ((e: {
        resultIndex?: number;
        results: ArrayLike<
          ArrayLike<{ transcript: string; confidence?: number }> & { isFinal?: boolean }
        >;
      }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function getSpeechRecognitionCtor(): { new (): SpeechRecognitionInstance } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: { new (): SpeechRecognitionInstance };
    webkitSpeechRecognition?: { new (): SpeechRecognitionInstance };
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function transcriptFromResults(
  results: ArrayLike<
    ArrayLike<{ transcript: string; confidence?: number }> & { isFinal?: boolean }
  >,
): string {
  let text = "";
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    if (!result) continue;
    const chunk =
      Array.from(result)
        .map((alt) => alt.transcript ?? "")
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0] ?? "";
    text += chunk;
  }
  return text.trim();
}

/** Merge final + interim speech results (use resultIndex from the event). */
export function mergeSpeechResults(
  results: ArrayLike<
    ArrayLike<{ transcript: string; confidence?: number }> & { isFinal?: boolean }
  >,
  resultIndex: number,
  priorFinal: string,
): { final: string; display: string } {
  let interim = "";
  let finalText = priorFinal.trim();
  const start = Math.max(0, resultIndex);

  for (let i = start; i < results.length; i += 1) {
    const result = results[i];
    if (!result) continue;
    const chunk =
      Array.from(result)
        .map((alt) => alt.transcript ?? "")
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0] ?? "";
    if (!chunk) continue;
    if (result.isFinal) {
      finalText = finalText ? `${finalText} ${chunk}`.trim() : chunk.trim();
    } else {
      interim += chunk;
    }
  }

  const display = [finalText, interim.trim()].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return { final: finalText, display };
}

/** Rebuild full transcript from a continuous recognition results list. */
export function displayFromContinuousResults(
  results: ArrayLike<
    ArrayLike<{ transcript: string; confidence?: number }> & { isFinal?: boolean }
  >,
): { final: string; display: string } {
  let finalText = "";
  let interim = "";
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    if (!result) continue;
    const chunk =
      Array.from(result)
        .map((alt) => alt.transcript ?? "")
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0] ?? "";
    if (!chunk) continue;
    if (result.isFinal) {
      finalText += chunk;
    } else {
      interim += chunk;
    }
  }
  const display = [finalText.trim(), interim.trim()].filter(Boolean).join(" ").trim();
  return { final: finalText.trim(), display };
}

export type LiveSpeechSession = {
  stop: () => void;
  done: Promise<string>;
};

/**
 * Start Web Speech synchronously from a user click — do NOT await getUserMedia before start().
 * Uses VoiceButton-style single-utterance passes; restarts in onend while the session is open.
 */
export function startLiveSpeechRecognition(opts: {
  timeoutMs?: number;
  lang?: string;
  onTranscript?: (text: string) => void;
  onStarted?: () => void;
  onError?: (message: string) => void;
  onNetworkFailure?: () => void;
}): LiveSpeechSession | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return null;

  const timeoutMs = opts.timeoutMs ?? 35000;
  const lang = opts.lang ?? "en-US";
  let settled = false;
  let rec: SpeechRecognitionInstance | null = null;
  let stopTimer: ReturnType<typeof setTimeout> | null = null;
  let accumulated = "";
  let networkFailures = 0;
  let networkFailureNotified = false;
  let startedOnce = false;

  let resolveDone: (text: string) => void = () => undefined;
  const done = new Promise<string>((resolve) => {
    resolveDone = resolve;
  });

  const currentText = () => accumulated.trim();

  const finish = (text: string) => {
    if (settled) return;
    settled = true;
    if (stopTimer) clearTimeout(stopTimer);
    try {
      rec?.stop();
    } catch {
      /* noop */
    }
    try {
      rec?.abort();
    } catch {
      /* noop */
    }
    rec = null;
    resolveDone((text || accumulated).trim());
  };

  const appendTranscript = (raw: string) => {
    const chunk = raw.trim();
    if (!chunk) return;
    accumulated = accumulated ? `${accumulated} ${chunk}`.trim() : chunk;
    opts.onTranscript?.(accumulated);
  };

  const attachHandlers = (recognition: SpeechRecognitionInstance) => {
    recognition.onstart = () => {
      if (!startedOnce) {
        startedOnce = true;
        opts.onStarted?.();
      }
    };

    recognition.onresult = (e) => {
      networkFailures = 0;
      const result = e.results?.[e.results.length - 1];
      if (!result) return;
      const raw =
        Array.from(result)
          .map((alt) => alt.transcript?.trim() ?? "")
          .filter(Boolean)
          .sort((a, b) => b.length - a.length)[0] ?? "";
      if (raw) appendTranscript(raw);
    };

    recognition.onerror = (e) => {
      if (settled || e.error === "aborted") return;

      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        opts.onError?.(
          "Microphone blocked. Click the lock icon in your address bar and allow the microphone.",
        );
        finish("");
        return;
      }

      if (e.error === "audio-capture") {
        opts.onError?.(
          "Microphone is in use by another app. Close Zoom or Teams, then click Start speaking again.",
        );
        finish("");
        return;
      }

      if (e.error === "network") {
        networkFailures += 1;
        if (networkFailures >= 2) {
          if (!networkFailureNotified) {
            networkFailureNotified = true;
            opts.onNetworkFailure?.();
            opts.onError?.(
              "Voice recognition needs internet (Google). Type your answer or try Edge.",
            );
          }
          finish(currentText());
        }
        return;
      }

      if (e.error === "no-speech") return;
    };

    recognition.onend = () => {
      if (settled) return;
      try {
        recognition.start();
      } catch {
        finish(currentText());
      }
    };
  };

  try {
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    attachHandlers(recognition);
    rec = recognition;
    recognition.start();
  } catch {
    opts.onError?.("Could not start speech recognition. Click Start speaking again.");
    return null;
  }

  stopTimer = setTimeout(() => finish(currentText()), timeoutMs);

  return {
    stop: () => finish(currentText()),
    done,
  };
}

/** One-shot recognition — same behavior as VoiceButton (single phrase per click). */
export function startSingleSpeechRecognition(opts: {
  lang?: string;
  onTranscript: (text: string) => void;
  onStarted?: () => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}): { stop: () => void } | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return null;

  let rec: SpeechRecognitionInstance | null = null;
  try {
    const recognition = new Ctor();
    recognition.lang = opts.lang ?? "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.onstart = () => opts.onStarted?.();
    recognition.onresult = (e) => {
      const result = e.results?.[e.results.length - 1];
      if (!result) return;
      const raw =
        Array.from(result)
          .map((alt) => alt.transcript?.trim() ?? "")
          .filter(Boolean)
          .sort((a, b) => b.length - a.length)[0] ?? "";
      if (raw) opts.onTranscript(raw.trim());
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        opts.onError?.("Microphone permission denied. Enable it in your browser settings.");
      } else if (e.error === "no-speech") {
        opts.onError?.("Didn't hear anything — try again closer to the mic.");
      } else if (e.error !== "aborted") {
        opts.onError?.(`Voice error: ${e.error}`);
      }
    };
    recognition.onend = () => opts.onEnd?.();
    rec = recognition;
    recognition.start();
  } catch {
    opts.onError?.("Could not start voice input.");
    return null;
  }

  return {
    stop: () => {
      try {
        rec?.stop();
      } catch {
        /* noop */
      }
    },
  };
}
