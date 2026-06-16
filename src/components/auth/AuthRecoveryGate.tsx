import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  RESET_PASSWORD_PATH,
  hasRecoveryTokensInUrl,
  redirectToResetPasswordWithTokens,
} from "@/lib/auth-recovery";

/**
 * Sends password-recovery traffic to /reset-password before auth routes
 * auto-redirect a freshly recovered session to the app home.
 */
export function AuthRecoveryGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === RESET_PASSWORD_PATH) return;
    if (hasRecoveryTokensInUrl()) {
      redirectToResetPasswordWithTokens();
    }
  }, [pathname]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "PASSWORD_RECOVERY") return;
      if (typeof window === "undefined") return;
      if (window.location.pathname === RESET_PASSWORD_PATH) return;
      redirectToResetPasswordWithTokens();
    });
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
