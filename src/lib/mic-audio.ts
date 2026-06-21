/** Microphone helpers — hardware levels + permission priming (separate from Web Speech STT). */

export type MicDevice = {
  deviceId: string;
  label: string;
};

export type MicLevelSnapshot = {
  /** 0–100, gated so silence stays at 0 */
  level: number;
  deviceLabel: string;
  quality: "calibrating" | "quiet" | "noise" | "good";
  hint?: string;
};

const VIRTUAL_MIC =
  /broadcast|virtual|nvidia|stereo mix|loopback|wave link|voicemod|what u hear|output/i;

function rankDevice(label: string): number {
  if (/emeet|smartcam|c60/i.test(label)) return 0;
  if (/microphone array|intel.*smart sound/i.test(label)) return 1;
  if (/headset|usb audio|realtek/i.test(label)) return 2;
  if (VIRTUAL_MIC.test(label)) return 99;
  return 10;
}

export async function listMicDevices(): Promise<MicDevice[]> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === "audioinput" && d.deviceId)
      .map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone (${d.deviceId.slice(0, 8)}…)`,
      }))
      .filter((d) => !VIRTUAL_MIC.test(d.label))
      .sort((a, b) => rankDevice(a.label) - rankDevice(b.label) || a.label.localeCompare(b.label));
  } catch {
    return [];
  }
}

function primeConstraints(deviceId?: string): MediaStreamConstraints {
  const audio: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };
  if (deviceId) audio.deviceId = { ideal: deviceId };
  return { audio };
}

/** Raw signal for level meter — AGC off so bars don't twitch on their own. */
function meterConstraints(deviceId?: string): MediaStreamConstraints {
  const audio: MediaTrackConstraints = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
  if (deviceId) audio.deviceId = { ideal: deviceId };
  return { audio };
}

async function openMic(constraints: MediaStreamConstraints): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

/** Open mic briefly so Chrome/Windows routes the right device, then release before STT. */
export async function primeMicAccess(deviceId?: string): Promise<string> {
  const stream = await openMic(primeConstraints(deviceId));
  const label = stream.getAudioTracks()[0]?.label ?? "Unknown microphone";
  stream.getTracks().forEach((t) => t.stop());
  return label;
}

export type MicLevelMonitor = {
  stop: () => void;
};

function rmsLevel(samples: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const v = (samples[i]! - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / samples.length);
}

/** Real input levels — gated; use only when NOT running Web Speech STT. */
export function startMicLevelMonitor(
  onSnapshot: (snapshot: MicLevelSnapshot) => void,
  deviceId?: string,
): MicLevelMonitor {
  let stopped = false;
  let stream: MediaStream | null = null;
  let raf = 0;
  let ctx: AudioContext | null = null;
  let noiseFloor = 0.008;
  let calibratingUntil = 0;
  const recent: number[] = [];
  let speechFrames = 0;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    void ctx?.close();
    ctx = null;
    onSnapshot({
      level: 0,
      deviceLabel: "",
      quality: "quiet",
    });
  };

  void (async () => {
    try {
      stream = await openMic(meterConstraints(deviceId));
      if (stopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const track = stream.getAudioTracks()[0];
      const deviceLabel = track?.label ?? "Unknown microphone";
      calibratingUntil = Date.now() + 900;

      onSnapshot({
        level: 0,
        deviceLabel,
        quality: "calibrating",
        hint: "Stay quiet for one second…",
      });

      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      if (ctx.state === "suspended") await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);

      const tick = () => {
        if (stopped) return;
        analyser.getByteTimeDomainData(samples);
        const rms = rmsLevel(samples);

        if (Date.now() < calibratingUntil) {
          noiseFloor = Math.max(noiseFloor, rms * 1.15);
          onSnapshot({
            level: 0,
            deviceLabel,
            quality: "calibrating",
            hint: "Stay quiet for one second…",
          });
          raf = requestAnimationFrame(tick);
          return;
        }

        const gated = Math.max(0, rms - noiseFloor * 2.2);
        const level = Math.min(100, Math.round(gated * 420));

        recent.push(level);
        if (recent.length > 36) recent.shift();

        const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
        const variance =
          recent.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / Math.max(1, recent.length);

        if (level >= 22) speechFrames += 1;
        else speechFrames = Math.max(0, speechFrames - 1);

        let quality: MicLevelSnapshot["quality"] = "quiet";
        let hint: string | undefined;

        if (speechFrames >= 4 || level >= 45) {
          quality = "good";
          hint = "Good — this mic is picking up your voice.";
        } else if (mean >= 8 && variance >= 90 && level < 35) {
          quality = "noise";
          hint =
            "Random flutter usually means the wrong mic (virtual/Broadcast) or electrical noise. Pick EMEET in the list and set it as Windows default input.";
        } else if (level > 0) {
          quality = "quiet";
          hint = "Some signal — speak louder and closer to the mic.";
        } else {
          hint = "Silent — speak now. Bars should jump when you talk.";
        }

        onSnapshot({ level, deviceLabel, quality, hint });
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    } catch {
      onSnapshot({
        level: 0,
        deviceLabel: "",
        quality: "noise",
        hint: "Could not open microphone. Allow access in the browser.",
      });
    }
  })();

  return { stop };
}

/** Record a short clip in the browser — same path Windows Sound Recorder uses. */
export async function recordMicClip(
  seconds = 3,
  deviceId?: string,
): Promise<{ url: string; deviceLabel: string; revoke: () => void }> {
  const stream = await openMic(meterConstraints(deviceId));
  const deviceLabel = stream.getAudioTracks()[0]?.label ?? "Unknown microphone";
  const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const chunks: Blob[] = [];

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => reject(new Error("Recording failed"));
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
  });

  recorder.start();
  await new Promise((r) => setTimeout(r, seconds * 1000));
  recorder.stop();
  stream.getTracks().forEach((t) => t.stop());

  const blob = await done;
  const url = URL.createObjectURL(blob);
  return {
    url,
    deviceLabel,
    revoke: () => URL.revokeObjectURL(url),
  };
}
