/** ActiveProspect TrustedForm Certify Web SDK — client-side lead certification. */

export const ACTIVEPROSPECT_TRUSTEDFORM_URL =
  "https://activeprospect.com/products/trustedform/";

export const TRUSTEDFORM_CERT_FIELD = "xxTrustedFormCertUrl";
export const TRUSTEDFORM_TOKEN_FIELD = "xxTrustedFormToken";
export const TRUSTEDFORM_PING_FIELD = "xxTrustedFormPingUrl";

export const TRUSTEDFORM_SCRIPT_ID = "trustedform-certify-sdk";

export type TrustedFormCapture = {
  certUrl: string | null;
  token: string | null;
  pingUrl: string | null;
};

const PRODUCTION_HOSTS = new Set(["mypartb.com", "www.mypartb.com"]);

/** Whether to load TrustedForm on this page (production mypartb.com by default). */
export function isTrustedFormEnabled(): boolean {
  const flag = import.meta.env.VITE_TRUSTEDFORM_ENABLED;
  if (flag === "false") return false;
  if (flag === "true") return true;
  if (typeof window === "undefined") return false;
  return PRODUCTION_HOSTS.has(window.location.hostname.toLowerCase());
}

/** Sandbox certs on localhost — cannot be claimed/retained until domain is verified in production. */
export function isTrustedFormSandbox(): boolean {
  if (import.meta.env.VITE_TRUSTEDFORM_SANDBOX === "true") return true;
  if (import.meta.env.VITE_TRUSTEDFORM_SANDBOX === "false") return false;
  if (typeof window === "undefined") return true;
  return !PRODUCTION_HOSTS.has(window.location.hostname.toLowerCase());
}

export function readTrustedFormFields(form: HTMLFormElement): TrustedFormCapture {
  const read = (name: string) => {
    const el = form.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
    const value = el?.value?.trim();
    return value ? value : null;
  };
  return {
    certUrl: read(TRUSTEDFORM_CERT_FIELD),
    token: read(TRUSTEDFORM_TOKEN_FIELD),
    pingUrl: read(TRUSTEDFORM_PING_FIELD),
  };
}

function scriptAlreadyLoading(): boolean {
  return Boolean(document.getElementById(TRUSTEDFORM_SCRIPT_ID));
}

/**
 * Load TrustedForm Certify after the lead form is in the DOM.
 * Form must exist before the script runs (ActiveProspect requirement).
 */
export function loadTrustedFormCertify(opts?: {
  sandbox?: boolean;
  sessionIdentifier?: string;
}): void {
  if (typeof document === "undefined" || !isTrustedFormEnabled()) return;
  if (scriptAlreadyLoading()) return;

  const field = TRUSTEDFORM_CERT_FIELD;
  const sandbox = opts?.sandbox ?? isTrustedFormSandbox();
  const params = new URLSearchParams({
    provide_referrer: "false",
    field,
    l: `${Date.now()}${Math.random()}`,
  });
  if (sandbox) params.set("sandbox", "true");
  const identifier = opts?.sessionIdentifier?.trim().slice(0, 128);
  if (identifier) params.set("identifier", identifier);

  const tf = document.createElement("script");
  tf.id = TRUSTEDFORM_SCRIPT_ID;
  tf.type = "text/javascript";
  tf.async = true;
  tf.src = `https://api.trustedform.com/trustedform.js?${params.toString()}`;
  const firstScript = document.getElementsByTagName("script")[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(tf, firstScript);
  } else {
    document.head.appendChild(tf);
  }
}

/** Domain to verify in ActiveProspect → Domains (matches production site). */
export function trustedFormVerifyDomain(): string {
  return "mypartb.com";
}
