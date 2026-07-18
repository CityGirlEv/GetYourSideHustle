import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TouchCheckboxField } from "@/components/ui/touch-checkbox";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { requestLeadMagnetDownload } from "@/lib/email-signup.functions";
import {
  collectLeadClientMetadata,
  LEAD_MARKETING_OPT_IN_LABEL,
  LEAD_PRIVACY_ACK_LABEL,
  leadMagnetPdfDeliveryLabel,
} from "@/lib/lead-consent";
import { TPMO_PLATFORM_DISCLAIMER } from "@/lib/medicare-disclaimers";
import { DEFAULT_WORKBOOK_SLUG } from "@/lib/content-factory/lead-magnet-paths";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/batch-seed";

export function LeadMagnetEmailCapture({
  slug = DEFAULT_WORKBOOK_SLUG,
  workbookTitle = DEFAULT_WORKBOOK_LEAD_MAGNET.title,
  compact = false,
}: {
  slug?: string;
  workbookTitle?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [privacyAck, setPrivacyAck] = useState(false);
  const [pdfDelivery, setPdfDelivery] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const requestDownload = useServerFn(requestLeadMagnetDownload);

  const pdfLabel = leadMagnetPdfDeliveryLabel(workbookTitle);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!privacyAck) {
      toast.error("Please agree to the Privacy Policy and Terms of Use.");
      return;
    }
    if (!pdfDelivery) {
      toast.error("Please authorize email delivery of the PDF.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await requestDownload({
        data: {
          email: email.trim(),
          slug,
          privacy_acknowledged: true,
          pdf_delivery_authorized: true,
          newsletter_opt_in: newsletterOptIn,
          client_metadata: collectLeadClientMetadata(),
        },
      });
      setDownloadUrl(result.download_url);
      toast.success("Check your email — your download link is ready below too.");
    } catch (err) {
      toast.error((err as Error).message ?? "Could not send the workbook. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (downloadUrl) {
    return (
      <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <p className="text-sm text-foreground">
          Your workbook is on the way to <strong>{email}</strong>. You can also download it now:
        </p>
        <Button asChild className="grad-indigo">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-1.5" />
            Download PDF
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3" aria-label="Workbook download">
      <div className="space-y-1">
        <Label htmlFor="workbook-email" className={compact ? "text-xs" : "text-sm"}>
          Email address
        </Label>
        <Input
          id="workbook-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <TouchCheckboxField
        checked={privacyAck}
        onChange={(e) => setPrivacyAck(Boolean((e.target as HTMLInputElement).checked))}
      >
        <span className="text-xs">
          {LEAD_PRIVACY_ACK_LABEL}{" "}
          <Link to="/legal" hash="privacy" className="text-primary underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/legal" hash="terms" className="text-primary underline underline-offset-2">
            Terms of Use
          </Link>
          .
        </span>
      </TouchCheckboxField>

      <TouchCheckboxField
        checked={pdfDelivery}
        onChange={(e) => setPdfDelivery(Boolean((e.target as HTMLInputElement).checked))}
      >
        <span className="text-xs">{pdfLabel}</span>
      </TouchCheckboxField>

      <TouchCheckboxField
        checked={newsletterOptIn}
        onChange={(e) => setNewsletterOptIn(Boolean((e.target as HTMLInputElement).checked))}
      >
        <span className="text-xs">{LEAD_MARKETING_OPT_IN_LABEL}</span>
      </TouchCheckboxField>

      <Button type="submit" disabled={submitting} className="grad-indigo w-full sm:w-auto">
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Download className="h-4 w-4 mr-1.5" />
            Email me the workbook
          </>
        )}
      </Button>

      <p className="text-[11px] text-muted-foreground leading-snug">{TPMO_PLATFORM_DISCLAIMER}</p>
    </form>
  );
}
