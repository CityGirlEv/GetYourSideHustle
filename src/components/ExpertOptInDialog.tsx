import { useState } from "react";
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

/** @deprecated Use LEAD_OPT_IN_INTRO from lead-consent.ts */
export const EXPERT_OPT_IN_CTA = LEAD_OPT_IN_INTRO;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const submitContact = useServerFn(submitExpertContactRequest);

  const contactAuthLabel = leadContactAuthorizationLabel(agencyName);
  const canSubmit = privacyAck && contactAuth;

  const submit = async () => {
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
        },
      });
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
      onOpenChange(false);
    } catch {
      toast.error("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeDialog = (next: boolean) => {
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>{CMS_PARTNER_CTA}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {fromMedicationStep ? (
              <>You asked for help with your medications. {LEAD_OPT_IN_INTRO}</>
            ) : (
              LEAD_OPT_IN_INTRO
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="opt-name">Your name</Label>
            <Input
              id="opt-name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opt-email">Email</Label>
            <Input
              id="opt-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opt-phone">Phone</Label>
            <Input
              id="opt-phone"
              type="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={32}
            />
          </div>

          <div className="space-y-3 rounded-md border border-border bg-secondary/20 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Required acknowledgments
            </p>
            <TouchCheckboxField checked={privacyAck} onChange={(e) => setPrivacyAck(Boolean((e.target as HTMLInputElement).checked))}>
              <span className="text-sm leading-snug">
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
              <span className="text-sm leading-snug">{contactAuthLabel}</span>
            </TouchCheckboxField>
          </div>

          <TouchCheckboxField
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(Boolean((e.target as HTMLInputElement).checked))}
          >
            <span className="text-sm leading-snug text-muted-foreground">
              {LEAD_MARKETING_OPT_IN_LABEL}
            </span>
          </TouchCheckboxField>

          <p className="text-xs text-muted-foreground leading-relaxed">{TPMO_PLATFORM_DISCLAIMER}</p>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {ASSISTANCE_AGENCY_SHARING_NOTICE}
            {scenarioCode ? ` Scenario ${scenarioCode} will be included with your request.` : ""}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => closeDialog(false)} disabled={submitting}>
            No thanks
          </Button>
          <Button onClick={submit} disabled={submitting || !canSubmit} className="grad-indigo">
            {submitting ? "Submitting…" : "Contact me"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
