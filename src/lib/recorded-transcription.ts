/** Record mic audio and transcribe via /api/public/transcribe (Workers AI Whisper). */

import type { LiveSpeechSession } from "@/lib/speech-recognition";

const DEFAULT_SILENCE_HANG_MS = 2200;
const DEFAULT_MAX_DURATION_MS = 60_000;
/** Pull data from MediaRecorder periodically — merged into one valid WebM before send. */
const DEFAULT_SLICE_MS = 1000;
const CALIBRATION_MS = 350;
const MIN_AUDIO_BYTES = 1200;
const TRANSCRIBE_DEBOUNCE_MS = 700;

function meterConstraints(deviceId?: string): MediaStreamConstraints {
  const audio: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: false,
  };
  if (deviceId) audio.deviceId = { ideal: deviceId };
  return { audio };
}

function pickRecorderMime(): string {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  return "";
}

async function transcribeBlob(blob: Blob, filename: string): Promise<string> {
  if (blob.size < MIN_AUDIO_BYTES) return "";
  const form = new FormData();
  form.append("file", blob, filename);

  const onLocalhost =
    typeof window !== "undefined" &&
    /localhost|127\.0\.0\.1/.test(window.location.hostname);
  const url = onLocalhost
    ? "https://mypartb.com/api/public/transcribe"
    : "/api/public/transcribe";

  const res = await fetch(url, { method: "POST", body: form, mode: "cors" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `Transcription failed (${res.status})`);
  }
  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}

function isDecodeError(message: string): boolean {
  return /decode audio|valid audio format|3030/i.test(message);
}

function rmsFromSamples(samples: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const v = (samples[i]! - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / samples.length);
}

/** Level meter + end-of-speech detection (waits through a pause in case you resume). */
function startSpeechActivityMonitor(
  stream: MediaStream,
  opts: {
    silenceHangMs: number;
    maxDurationMs: number;
    onLevel: (level: number) => void;
    onSpeechEnd: () => void;
  },
): () => void {
  let raf = 0;
  let ctx: AudioContext | null = null;
  let stopped = false;
  let ended = false;
  const startedAt = Date.now();
  let calibratingUntil = startedAt + CALIBRATION_MS;
  let noiseFloor = 0.008;
  let lastSpeechAt = 0;
  let heardSpeech = false;
  let speechFrames = 0;

  const finish = () => {
    if (stopped || ended) return;
    ended = true;
    opts.onSpeechEnd();
  };

  void (async () => {
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      if (ctx.state === "suspended") await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);

      const tick = () => {
        if (stopped || ended) return;

        analyser.getByteTimeDomainData(samples);
        const rms = rmsFromSamples(samples);
        const now = Date.now();

        if (now < calibratingUntil) {
          noiseFloor = Math.max(noiseFloor, rms * 1.15);
          opts.onLevel(0);
          raf = requestAnimationFrame(tick);
          return;
        }

        const gated = Math.max(0, rms - noiseFloor * 2.2);
        const level = Math.min(100, Math.round(gated * 420));
        opts.onLevel(level);

        const speakingNow = level >= 16 || speechFrames >= 2;
        if (level >= 16) {
          speechFrames += 1;
        } else {
          speechFrames = Math.max(0, speechFrames - 1);
        }

        if (speakingNow) {
          heardSpeech = true;
          lastSpeechAt = now;
        } else if (heardSpeech && now - lastSpeechAt >= opts.silenceHangMs) {
          finish();
          return;
        }

        if (now - startedAt >= opts.maxDurationMs) {
          finish();
          return;
        }

        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    } catch {
      opts.onLevel(0);
    }
  })();

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    void ctx?.close();
    opts.onLevel(0);
  };
}

/**
 * Record from mic, transcribe on the server, and stop after you pause speaking.
 * MediaRecorder timeslices are merged into one valid WebM before each Whisper call.
 */
export function startRecordedTranscription(opts: {
  deviceId?: string;
  timeoutMs?: number;
  chunkMs?: number;
  silenceHangMs?: number;
  autoStopOnSilence?: boolean;
  onTranscript?: (text: string) => void;
  onTranscribing?: () => void;
  onStarted?: (deviceLabel: string) => void;
  onError?: (message: string) => void;
  onLevel?: (level: number) => void;
  onSpeechEnd?: () => void;
}): LiveSpeechSession | null {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return null;

  const maxDurationMs = opts.timeoutMs ?? DEFAULT_MAX_DURATION_MS;
  const sliceMs = opts.chunkMs ?? DEFAULT_SLICE_MS;
  const silenceHangMs = opts.silenceHangMs ?? DEFAULT_SILENCE_HANG_MS;
  const autoStopOnSilence = opts.autoStopOnSilence ?? true;
  let settled = false;
  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let stopMonitor: (() => void) | null = null;
  let stopTimer: ReturnType<typeof setTimeout> | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let accumulated = "";
  let recordedParts: Blob[] = [];
  let recorderMime = "audio/webm";
  let transcribeGen = 0;
  let resolveDone: (text: string) => void = () => undefined;

  const done = new Promise<string>((resolve) => {
    resolveDone = resolve;
  });

  const mergedBlob = (): Blob | null => {
    if (!recordedParts.length) return null;
    return new Blob(recordedParts, { type: recorderMime });
  };

  const applyTranscript = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return accumulated;
    accumulated = trimmed;
    opts.onTranscript?.(accumulated);
    return accumulated;
  };

  const runTranscribe = async (finalAttempt: boolean): Promise<void> => {
    if (settled) return;
    const blob = mergedBlob();
    if (!blob || blob.size < MIN_AUDIO_BYTES) return;

    const gen = ++transcribeGen;
    opts.onTranscribing?.();
    try {
      const text = await transcribeBlob(blob, "recording.webm");
      if (settled || gen !== transcribeGen) return;
      applyTranscript(text);
    } catch (err) {
      if (settled || gen !== transcribeGen) return;
      const msg = err instanceof Error ? err.message : "Transcription failed.";
      if (!finalAttempt && isDecodeError(msg)) return;
      opts.onError?.(msg);
    }
  };

  const scheduleTranscribe = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void runTranscribe(false);
    }, TRANSCRIBE_DEBOUNCE_MS);
  };

  const finish = (text: string) => {
    if (settled) return;
    settled = true;
    if (stopTimer) clearTimeout(stopTimer);
    if (debounceTimer) clearTimeout(debounceTimer);
    stopMonitor?.();
    stopMonitor = null;
    try {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    } catch {
      /* noop */
    }
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    resolveDone(text.trim());
  };

  const requestStop = () => {
    if (settled) return;
    opts.onSpeechEnd?.();
    try {
      recorder?.stop();
    } catch {
      finish(accumulated);
    }
  };

  void (async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia(meterConstraints(opts.deviceId));
      const deviceLabel = stream.getAudioTracks()[0]?.label ?? "Microphone";
      opts.onStarted?.(deviceLabel);

      const mime = pickRecorderMime();
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderMime = recorder.mimeType || mime || "audio/webm";

      recorder.ondataavailable = (e) => {
        if (!e.data.size) return;
        recordedParts.push(e.data);
        scheduleTranscribe();
      };

      recorder.onstop = () => {
        transcribeGen += 1;
        void runTranscribe(true).finally(() => finish(accumulated));
      };

      if (autoStopOnSilence) {
        stopMonitor = startSpeechActivityMonitor(stream, {
          silenceHangMs,
          maxDurationMs,
          onLevel: opts.onLevel ?? (() => undefined),
          onSpeechEnd: requestStop,
        });
      } else if (opts.onLevel) {
        stopMonitor = startSpeechActivityMonitor(stream, {
          silenceHangMs: maxDurationMs,
          maxDurationMs,
          onLevel: opts.onLevel,
          onSpeechEnd: requestStop,
        });
      }

      recorder.start(sliceMs);
      stopTimer = setTimeout(requestStop, maxDurationMs);
    } catch {
      opts.onError?.("Could not open the microphone. Allow access in your browser.");
      finish("");
    }
  })();

  return {
    stop: requestStop,
    done,
  };
}
