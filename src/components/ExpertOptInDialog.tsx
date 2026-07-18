import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { SubmitWaitOverlay } from "@/components/SubmitWaitOverlay";
import { submitExpertContactRequest } from "@/lib/email-triggers.functions";
import { ASSISTANCE_AGENCY_SHARING_NOTICE, TPMO_PLATFORM_DISCLAIMER } from "@/lib/medicare-disclaimers";
import { TouchCheckboxField } from "@/components/ui/touch-checkbox";
import {
  collectLeadClientMetadata,
  CMS_PARTNER_CTA,
  DEFAULT_LEAD_AGENCY_NAME,
  LEAD_MARKETING_OPT_IN_LABEL,
  LEAD_OPT_IN_INTRO,
  LICENSED_AGENT_WILL_CONTACT,
  leadContactAuthorizationLabel,
} from "@/lib/lead-consent";
import { useTrustedFormCertify } from "@/hooks/use-trustedform";
import { trackMetaLead } from "@/lib/meta-pixel";
import {
  isTrustedFormEnabled,
  readTrustedFormFields,
} from "@/lib/trustedform-client";

/** @deprecated Use LEAD_OPT_IN_INTRO from lead-consent.ts */
export const EXPERT_OPT_IN_CTA = LEAD_OPT_IN_INTRO;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful lead submission (before the dialog closes). */
  onSuccess?: () => void;
  scenarioCode?: string;
  scenarioSnapshot?: Record<string, unknown>;
  /** User opted in on the medication step — tailor messaging. */
  fromMedicationStep?: boolean;
  /** Agency shown in contact authorization (defaults to CMS Health & Wealth). */
  agencyName?: string;
}

const schema = z.object({
  full_name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-().\s]{7,32}$/, "Enter a valid phone number"),
});

function resetConsentState(setters: {
  setFullName: (v: string) => void;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  setPrivacyAck: (v: boolean) => void;
  setContactAuth: (v: boolean) => void;
  setMarketingOptIn: (v: boolean) => void;
}) {
  setters.setFullName("");
  setters.setEmail("");
  setters.setPhone("");
  setters.setPrivacyAck(false);
  setters.setContactAuth(false);
  setters.setMarketingOptIn(false);
}

export function ExpertOptInDialog({
  open,
  onOpenChange,
  onSuccess,
  scenarioCode,
  scenarioSnapshot,
  fromMedicationStep,
  agencyName = DEFAULT_LEAD_AGENCY_NAME,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyAck, setPrivacyAck] = useState(false);
  const [contactAuth, setContactAuth] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitContact = useServerFn(submitExpertContactRequest);
  const trustedFormSessionKey = scenarioCode ? `scenario-${scenarioCode}` : "expert-opt-in";
  useTrustedFormCertify(open, trustedFormSessionKey);

  const contactAuthLabel = leadContactAuthorizationLabel(agencyName);
  const canSubmit = privacyAck && contactAuth;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!privacyAck) {
      toast.error("Please agree to the Privacy Policy and Terms of Use.");
      return;
    }
    if (!contactAuth) {
      toast.error("Please authorize contact before requesting assistance.");
      return;
    }
    const parsed = schema.safeParse({ full_name: fullName, email, phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your entries");
      return;
    }
    setSubmitting(true);
    try {
      const trustedForm = formRef.current
        ? readTrustedFormFields(formRef.current)
        : { certUrl: null, token: null, pingUrl: null };
      if (isTrustedFormEnabled() && !trustedForm.certUrl) {
        console.warn(
          "[TrustedForm] No certificate URL on submit — verify mypartb.com in ActiveProspect Domains and enable Auto-Retain.",
        );
      }
      await submitContact({
        data: {
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          scenario_code: scenarioCode ?? null,
          scenario_snapshot: scenarioSnapshot ?? null,
          agency_name: agencyName,
          privacy_acknowledged: true,
          contact_authorized: true,
          marketing_opt_in: marketingOptIn,
          client_metadata: collectLeadClientMetadata(),
          trustedform_cert_url: trustedForm.certUrl,
          trustedform_token: trustedForm.token,
          trustedform_ping_url: trustedForm.pingUrl,
        },
      });
      trackMetaLead({ scenarioCode, source: "expert_opt_in_dialog" });
      toast.success(
        `Thanks — ${LICENSED_AGENT_WILL_CONTACT} shortly. Check your email for confirmation.`,
      );
      resetConsentState({
        setFullName,
        setEmail,
        setPhone,
        setPrivacyAck,
        setContactAuth,
        setMarketingOptIn,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("[ExpertOptIn] submit failed", err);
      const message =
        err instanceof Error && import.meta.env.DEV
          ? err.message
          : "Could not submit. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeDialog = (next: boolean) => {
    if (!next && submitting) return;
    if (!next) {
      resetConsentState({
        setFullName,
        setEmail,
        setPhone,
        setPrivacyAck,
        setContactAuth,
        setMarketingOptIn,
      });
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="z-[52] flex max-h-[90dvh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <SubmitWaitOverlay open={submitting} label="Sending your contact request…" />
        <DialogHeader className="shrink-0 space-y-2 px-5 pt-5 pr-12 text-left sm:px-6 sm:pt-6">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-balance text-xl font-bold leading-snug sm:text-2xl">
            {CMS_PARTNER_CTA}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed sm:text-base">
            {fromMedicationStep ? (
              <>You asked for help with your medications. {LEAD_OPT_IN_INTRO}</>
            ) : (
              LEAD_OPT_IN_INTRO
            )}
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          id="expert-lead-opt-in-form"
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={submit}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <div className="space-y-1.5">
              <Label htmlFor="opt-name" className="text-sm font-medium">
                Your name
              </Label>
              <Input
                id="opt-name"
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className="h-11 text-base"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                data-tf-sensitive="true"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opt-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="opt-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                data-tf-sensitive="true"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="opt-phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="opt-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(555) 123-4567"
                className="h-11 text-base"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={32}
                data-tf-sensitive="true"
              />
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
                Required acknowledgments
              </p>
              <TouchCheckboxField checked={privacyAck} onChange={(e) => setPrivacyAck(Boolean((e.target as HTMLInputElement).checked))}>
                <span className="text-sm leading-relaxed sm:text-base">
                  I have read and agree to the{" "}
                  <Link to="/legal" hash="privacy" className="text-primary underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link to="/legal" hash="terms" className="text-primary underline">
                    Terms of Use
                  </Link>
                  .
                </span>
              </TouchCheckboxField>
              <TouchCheckboxField
                checked={contactAuth}
                onChange={(e) => setContactAuth(Boolean((e.target as HTMLInputElement).checked))}
              >
                <span className="text-sm leading-relaxed sm:text-base">{contactAuthLabel}</span>
              </TouchCheckboxField>
            </div>

            <TouchCheckboxField
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(Boolean((e.target as HTMLInputElement).checked))}
            >
              <span className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {LEAD_MARKETING_OPT_IN_LABEL}
              </span>
            </TouchCheckboxField>

            <div className="max-h-28 overflow-y-auto overscroll-contain rounded-md border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground sm:max-h-32 sm:text-sm">
              <p>{TPMO_PLATFORM_DISCLAIMER}</p>
              <p className="mt-2">
                {ASSISTANCE_AGENCY_SHARING_NOTICE}
                {scenarioCode ? ` Comparison ${scenarioCode} will be included with your request.` : ""}
              </p>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 z-10 shrink-0 gap-3 border-t border-border bg-background px-5 py-4 sm:flex-row sm:justify-stretch sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full px-6 text-base font-semibold sm:flex-1"
              onClick={() => closeDialog(false)}
              disabled={submitting}
            >
              No thanks
            </Button>
            <Button
              type="submit"
              disabled={submitting || !canSubmit}
              className="grad-indigo min-h-11 w-full px-6 text-base font-semibold sm:flex-1"
            >
              Contact me
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
