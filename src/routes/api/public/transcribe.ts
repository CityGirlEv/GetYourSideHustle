import { createFileRoute } from "@tanstack/react-router";
import { transcribeAudioBlob } from "@/lib/transcribe-audio.server";

const MAX_BYTES = 5 * 1024 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/transcribe")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
          const file = form.get("file");
          if (!file || !(file instanceof File)) {
            return Response.json(
              { error: "Missing audio file." },
              { status: 400, headers: corsHeaders },
            );
          }
          if (file.size === 0) {
            return Response.json({ text: "" }, { headers: corsHeaders });
          }
          if (file.size > MAX_BYTES) {
            return Response.json(
              { error: "Audio clip too large." },
              { status: 413, headers: corsHeaders },
            );
          }

          const text = await transcribeAudioBlob(file, file.name || "audio.webm");
          return Response.json({ text }, { headers: corsHeaders });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Transcription failed.";
          const status = /not configured|not available|not set/i.test(message) ? 503 : 500;
          return Response.json({ error: message }, { status, headers: corsHeaders });
        }
      },
    },
  },
});
