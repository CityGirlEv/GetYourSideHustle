import { useEffect, useRef } from "react";
import { isTrustedFormEnabled, loadTrustedFormCertify } from "@/lib/trustedform-client";

/**
 * Load TrustedForm Certify when a lead capture form mounts (e.g. expert opt-in dialog open).
 * Pass the form ref once inputs are rendered.
 */
export function useTrustedFormCertify(active: boolean, sessionKey?: string) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!active || !isTrustedFormEnabled()) {
      loadedRef.current = false;
      return;
    }

    // Defer until after paint so the <form> is in the DOM before the SDK runs.
    const timer = window.setTimeout(() => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      loadTrustedFormCertify({ sessionIdentifier: sessionKey });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      loadedRef.current = false;
      const existing = document.getElementById("trustedform-certify-sdk");
      existing?.remove();
    };
  }, [active, sessionKey]);
}
