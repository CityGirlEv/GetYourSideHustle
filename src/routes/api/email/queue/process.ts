import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { getEnvVariable } from "@/lib/env";
import { processEmailQueue } from "@/lib/process-email-queue";

export const Route = createFileRoute("/api/email/queue/process")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.slice("Bearer ".length).trim();
        if (!token) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabaseUrl = getEnvVariable("SUPABASE_URL") ?? getEnvVariable("VITE_SUPABASE_URL");
        if (!supabaseUrl) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, token, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { error: authProbeError } = await supabase
          .from("email_send_state")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (authProbeError) {
          console.error("Email queue auth probe failed", authProbeError.message);
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }

        try {
          const result = await processEmailQueue(supabase);
          return Response.json(result);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Email queue processor failed", message);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
