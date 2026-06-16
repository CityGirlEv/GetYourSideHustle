import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { getEnvVariable } from "@/lib/env";
import { dispatchTransactionalTemplate } from "@/lib/dispatch-transactional-template.server";
import { triggerEmailQueueProcess } from "@/lib/trigger-email-queue-process";

export const Route = createFileRoute("/api/email/transactional/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = getEnvVariable("SUPABASE_URL");
        const supabaseServiceKey = getEnvVariable("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.slice("Bearer ".length).trim();
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        if (token !== supabaseServiceKey) {
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser(token);
          if (authError || !user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }
          const { data: roles, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          if (roleError) {
            console.error("Role lookup failed for transactional send", { error: roleError });
            return Response.json({ error: "Authorization check failed" }, { status: 500 });
          }
          const allowed = new Set(["admin", "qa", "agent"]);
          const hasRole = (roles ?? []).some((r) => allowed.has(r.role as string));
          if (!hasRole) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        }

        let templateName: string;
        let recipientEmail: string;
        let idempotencyKey: string;
        let messageId: string;
        let templateData: Record<string, unknown> = {};
        try {
          const body = await request.json();
          templateName = body.templateName || body.template_name;
          recipientEmail = body.recipientEmail || body.recipient_email;
          messageId = crypto.randomUUID();
          idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId;
          if (body.templateData && typeof body.templateData === "object") {
            templateData = body.templateData;
          }
        } catch {
          return Response.json({ error: "Invalid JSON in request body" }, { status: 400 });
        }

        if (!templateName) {
          return Response.json({ error: "templateName is required" }, { status: 400 });
        }

        const result = await dispatchTransactionalTemplate(supabase, {
          templateName,
          recipientEmail,
          idempotencyKey,
          templateData,
          messageId,
        });

        if (!result.ok) {
          if ("reason" in result && result.reason === "email_suppressed") {
            return Response.json({ success: false, reason: "email_suppressed" });
          }
          return Response.json({ error: result.error }, { status: result.status });
        }

        await triggerEmailQueueProcess(request.url);

        return Response.json({ success: true, queued: true });
      },
    },
  },
});
