import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TouchCheckboxField } from "@/components/ui/touch-checkbox";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/email-signup.functions";
import {
  collectLeadClientMetadata,
  LEAD_PRIVACY_ACK_LABEL,
  NEWSLETTER_EDUCATIONAL_OPT_IN_LABEL,
} from "@/lib/lead-consent";
import { TPMO_PLATFORM_DISCLAIMER } from "@/lib/medicare-disclaimers";
import { cn } from "@/lib/utils";

export function NewsletterSignupForm({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [privacyAck, setPrivacyAck] = useState(false);
  const [educationalOptIn, setEducationalOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useServerFn(subscribeNewsletter);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!privacyAck) {
      toast.error("Please agree to the Privacy Policy and Terms of Use.");
      return;
    }
    if (!educationalOptIn) {
      toast.error("Please check the box to receive educational emails.");
      return;
    }
    setSubmitting(true);
    try {
      await subscribe({
        data: {
          email: email.trim(),
          privacy_acknowledged: true,
          educational_opt_in: true,
          client_metadata: collectLeadClientMetadata(),
        },
      });
      setSubmitted(true);
      toast.success("You are subscribed — check your inbox for a confirmation email.");
    } catch (err) {
      toast.error((err as Error).message ?? "Could not subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <p className={cn("text-sm text-emerald-700 dark:text-emerald-400", className)}>
        Thanks — you are subscribed. Check your email for a welcome message from us.
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className={cn("space-y-3", className)}
      aria-label="Newsletter signup"
    >
      <div className="space-y-1">
        <Label htmlFor="newsletter-email" className={compact ? "text-xs" : "text-sm"}>
          Email for weekly Medicare education
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className={compact ? "h-9 text-sm" : undefined}
          />
          <Button
            type="submit"
            disabled={submitting}
            className={cn("grad-indigo shrink-0", compact ? "h-9 text-sm" : undefined)}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Mail className="h-4 w-4 mr-1.5" />
                Subscribe
              </>
            )}
          </Button>
        </div>
      </div>

      <TouchCheckboxField
        checked={privacyAck}
        onChange={(e) => setPrivacyAck(Boolean((e.target as HTMLInputElement).checked))}
      >
        <span className={compact ? "text-xs" : "text-xs"}>
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
        checked={educationalOptIn}
        onChange={(e) => setEducationalOptIn(Boolean((e.target as HTMLInputElement).checked))}
      >
        <span className={compact ? "text-xs" : "text-xs"}>{NEWSLETTER_EDUCATIONAL_OPT_IN_LABEL}</span>
      </TouchCheckboxField>

      <p className={cn("text-muted-foreground leading-snug", compact ? "text-micro" : "text-xs")}>
        {TPMO_PLATFORM_DISCLAIMER}
      </p>
    </form>
  );
}
