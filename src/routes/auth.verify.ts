import { createFileRoute } from "@tanstack/react-router";
import { supabaseAuthVerifyUrl } from "@/lib/auth-recovery";

/**
 * Branded entry point for Supabase auth verify links (password recovery, etc.).
 * Emails link here on mypartb.com; this route forwards to Supabase verify, then
 * Supabase redirects back to /reset-password with tokens.
 */
export const Route = createFileRoute("/auth/verify")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const incoming = new URL(request.url);
        const supabaseBase = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseBase) {
          return new Response("Auth not configured", { status: 500 });
        }
        const target = supabaseAuthVerifyUrl(incoming.searchParams, supabaseBase);
        return Response.redirect(target, 302);
      },
    },
  },
  component: () => null,
});
