import { Buffer } from "node:buffer";

type AiBinding = {
  run: (model: string, inputs: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function textFromResult(result: Record<string, unknown>): string {
  if (typeof result.text === "string") return result.text.trim();
  const nested = result.result;
  if (nested && typeof nested === "object" && typeof (nested as { text?: string }).text === "string") {
    return (nested as { text: string }).text.trim();
  }
  return "";
}

export async function handleTranscribeRequest(
  request: Request,
  env: Record<string, unknown>,
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: CORS });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return Response.json({ error: "Missing audio file." }, { status: 400, headers: CORS });
    }
    if (file.size === 0) {
      return Response.json({ text: "" }, { headers: CORS });
    }
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Audio clip too large." }, { status: 413, headers: CORS });
    }

    const ai =
      (env.AI as AiBinding | undefined) ??
      ((globalThis as Record<string, unknown>).__env__ as { AI?: AiBinding } | undefined)?.AI;
    if (!ai || typeof ai.run !== "function") {
      return Response.json(
        { error: "Voice transcription is not available on this server." },
        { status: 503, headers: CORS },
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const result = await ai.run("@cf/openai/whisper-large-v3-turbo", {
      audio: base64,
      language: "en",
    });

    const text = textFromResult(result);
    return Response.json({ text }, { headers: CORS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Transcription failed.";
    console.error("[transcribe]", message);
    if (/decode audio|valid audio format|3030/i.test(message)) {
      return Response.json({ text: "" }, { headers: CORS });
    }
    return Response.json({ error: message }, { status: 500, headers: CORS });
  }
}
