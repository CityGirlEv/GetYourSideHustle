import { Buffer } from "node:buffer";
import { getEnvVariable, getRuntimeSecret, isLocalDevEnvironment } from "@/lib/env";

type WorkersAiBinding = {
  run: (model: string, inputs: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

function readBindingAi(bag: unknown): WorkersAiBinding | undefined {
  if (!bag || typeof bag !== "object") return undefined;
  const ai = (bag as Record<string, unknown>).AI;
  if (!ai || typeof ai !== "object" || typeof (ai as WorkersAiBinding).run !== "function") {
    return undefined;
  }
  return ai as WorkersAiBinding;
}

function getCloudflareWorkerEnv(): Record<string, unknown> | undefined {
  try {
    const storageKey = Symbol.for("tanstack-start:event-storage");
    const storage = (globalThis as Record<symbol, unknown>)[storageKey] as
      | {
          getStore?: () => {
            h3Event?: { context?: { cloudflare?: { env?: Record<string, unknown> } } };
          };
        }
      | undefined;
    return storage?.getStore()?.h3Event?.context?.cloudflare?.env;
  } catch {
    return undefined;
  }
}

function getWorkersAi(): WorkersAiBinding | undefined {
  return (
    readBindingAi(getCloudflareWorkerEnv()) ??
    readBindingAi((globalThis as Record<string, unknown>).__env__) ??
    readBindingAi((globalThis as Record<string, unknown>).__ENV__)
  );
}

function textFromWorkersAiResult(result: Record<string, unknown>): string {
  if (typeof result.text === "string") return result.text.trim();
  const nested = result.result;
  if (nested && typeof nested === "object" && typeof (nested as { text?: string }).text === "string") {
    return (nested as { text: string }).text.trim();
  }
  return "";
}

async function transcribeWithWorkersAi(blob: Blob): Promise<string> {
  const ai = getWorkersAi();
  if (!ai) {
    throw new Error("Workers AI binding is not available.");
  }

  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const result = await ai.run("@cf/openai/whisper-large-v3-turbo", {
    audio: base64,
    language: "en",
  });

  const text = textFromWorkersAiResult(result);
  if (!text) {
    throw new Error("Workers AI returned no transcript.");
  }
  return text;
}

async function transcribeWithOpenAi(blob: Blob, filename: string): Promise<string> {
  const apiKey = getRuntimeSecret("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const body = new FormData();
  body.append("file", blob, filename);
  body.append("model", "whisper-1");
  body.append("language", "en");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });

  if (!res.ok) {
    let detail = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(detail) as { error?: { message?: string } };
      detail = parsed.error?.message ?? detail;
    } catch {
      /* use raw detail */
    }
    throw new Error(detail || `OpenAI transcription failed (${res.status})`);
  }

  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}

/** Local vite dev has no Workers AI — forward to production (Workers AI deployed there). */
async function transcribeViaProductionProxy(blob: Blob, filename: string): Promise<string> {
  const configured =
    getEnvVariable("PUBLIC_SITE_URL")?.replace(/\/$/, "") ||
    getEnvVariable("SITE_ORIGIN")?.replace(/\/$/, "");
  const origin =
    configured && !/localhost|127\.0\.0\.1/i.test(configured)
      ? configured
      : "https://mypartb.com";

  const body = new FormData();
  body.append("file", blob, filename);

  const res = await fetch(`${origin}/api/public/transcribe`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `Transcription failed (${res.status})`);
  }

  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}

/** Transcribe audio — Workers AI on Cloudflare, OpenAI or production proxy in local dev. */
export async function transcribeAudioBlob(blob: Blob, filename = "audio.webm"): Promise<string> {
  const ai = getWorkersAi();
  if (ai) {
    try {
      return await transcribeWithWorkersAi(blob);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[transcribe] Workers AI failed:", message);
      const apiKey = getRuntimeSecret("OPENAI_API_KEY");
      if (apiKey) {
        try {
          return await transcribeWithOpenAi(blob, filename);
        } catch (openAiErr) {
          console.warn("[transcribe] OpenAI fallback failed:", openAiErr);
        }
      }
      throw new Error(`Voice transcription failed: ${message}`);
    }
  }

  try {
    return await transcribeWithOpenAi(blob, filename);
  } catch {
    if (isLocalDevEnvironment()) {
      return transcribeViaProductionProxy(blob, filename);
    }
    throw new Error("Voice transcription is unavailable.");
  }
}
