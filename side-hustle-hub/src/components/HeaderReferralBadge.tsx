import { useEffect, useState } from "react";
import { Copy, Link2 } from "lucide-react";
import { buildReferralUrl, getOrCreateReferralCode } from "../lib/referral";

/** Compact copy control that sits beside the My Dashboard header chip. */
export function HeaderReferralBadge() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = getOrCreateReferralCode();
    setUrl(buildReferralUrl(code));
  }, []);

  const copy = async () => {
    const next = url || buildReferralUrl();
    if (!url) setUrl(next);
    try {
      await navigator.clipboard.writeText(next);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className="header-title-referral-badge"
      data-testid="header-referral"
      title={url ? `Copy referral link: ${url}` : "Copy your referral link"}
      onClick={() => void copy()}
    >
      {copied ? <Copy size={16} aria-hidden /> : <Link2 size={16} aria-hidden />}
      <span>{copied ? "Copied" : "Referral"}</span>
    </button>
  );
}
