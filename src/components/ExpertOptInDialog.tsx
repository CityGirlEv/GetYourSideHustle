import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^[0-9+\-().\s]{7,32}$/, "Enter a valid phone number"),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioCode?: string;
  scenarioSnapshot?: Record<string, unknown>;
}

export function ExpertOptInDialog({ open, onOpenChange, scenarioCode, scenarioSnapshot }: Props) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const parsed = schema.safeParse({ email, phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your entries");
      return;
    }
    setSubmitting(true);
    // Intentionally NOT linked to any scenario or health data — contact info only.
    const { error } = await supabase.from("expert_contact_requests").insert({
      email: parsed.data.email,
      phone: parsed.data.phone,
      scenario_code: scenarioCode ?? null,
      scenario_snapshot: scenarioSnapshot ? (scenarioSnapshot as never) : null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }
    toast.success("Thanks — a licensed expert will reach out shortly.");
    setEmail("");
    setPhone("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>Talk to a licensed expert</DialogTitle>
          <DialogDescription>
            Opt in to be contacted by a licensed Medicare expert. Your contact
            information{scenarioCode ? " will be linked to this scenario so the expert can review what you entered before reaching out." : " will be shared with a licensed expert."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="opt-email">Email</Label>
            <Input id="opt-email" type="email" autoComplete="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opt-phone">Phone</Label>
            <Input id="opt-phone" type="tel" autoComplete="tel" placeholder="(555) 123-4567"
              value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={32} />
          </div>
          <p className="text-xs text-muted-foreground">
            By submitting, you consent to be contacted about Medicare options.
            {scenarioCode ? ` Scenario ${scenarioCode} will be shared with the expert.` : ""}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>No thanks</Button>
          <Button onClick={submit} disabled={submitting} className="grad-indigo">
            {submitting ? "Submitting…" : "Contact me"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}