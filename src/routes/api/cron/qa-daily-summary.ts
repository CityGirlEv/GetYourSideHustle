import { createFileRoute } from "@tanstack/react-router";
import { getEnvVariable } from "@/lib/env";
import { sendQaDailySummaryToAdmins } from "@/lib/qa-daily-summary.server";

/**
 * Cron endpoint — send the QA daily summary to admin inboxes.
 * Protect with QA_DAILY_SUMMARY_SECRET (or TEST_EMAIL_SECRET as fallback).
 *
 * Example pg_cron (8 PM Eastern daily):
 *   SELECT net.http_post(
 *     url := 'https://mypartb.com/api/cron/qa-daily-summary?secret=...',
 *     headers := '{"Content-Type":"application/json"}'::jsonb,
 *     body := '{}'::jsonb
 *   );
 */
export const Route = createFileRoute("/api/cron/qa-daily-summary")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const secret = url.searchParams.get("secret") ?? request.headers.get("x-cron-secret") ?? "";
        const expected =
          getEnvVariable("QA_DAILY_SUMMARY_SECRET") ?? getEnvVariable("TEST_EMAIL_SECRET");

        if (!expected) {
          return Response.json(
            { error: "Endpoint disabled: QA_DAILY_SUMMARY_SECRET is not configured" },
            { status: 503 },
          );
        }
        if (secret !== expected) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const result = await sendQaDailySummaryToAdmins();
          return Response.json({
            success: true,
            ...result,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Send failed";
          console.error("[qa-daily-summary] cron failed", err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
