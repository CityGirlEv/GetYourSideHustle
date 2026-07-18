import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPARISON_ID_LABEL } from "@/lib/plan-comparison-copy";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TouchCheckboxField } from "@/components/ui/touch-checkbox";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Mail, Shield, Trash2 } from "lucide-react";
import {
  LEGAL_NAV,
  LEGAL_SECTIONS,
  PRIVACY_CONTACT_EMAIL,
  type LegalSection,
} from "@/lib/legal-content";
import {
  submitDeleteDataRequest,
  submitPrivacyContactRequest,
} from "@/lib/privacy-request.functions";
import { SITE_BRAND_NAME } from "@/lib/medicare-disclaimers";

export const Route = createFileRoute("/legal")({
  component: LegalPage,
  head: () => ({
    meta: [
      { title: `Legal & Privacy — ${SITE_BRAND_NAME}` },
      {
        name: "description",
        content:
          "Privacy Policy, Terms of Use, Cookie Policy, data deletion requests, and privacy contact information for The Part B Optimizer Benchmark Tool.",
      },
    ],
  }),
});

function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <section id={section.id} className="scroll-mt-24 space-y-4">
      <h2 className="font-display text-2xl font-bold">{section.title}</h2>
      {section.intro ? (
        <p className="text-sm text-muted-foreground leading-relaxed">{section.intro}</p>
      ) : null}
      {section.blocks.map((block) => (
        <div key={block.heading ?? block.paragraphs[0]?.slice(0, 24)} className="space-y-2">
          {block.heading ? <h3 className="text-sm font-semibold">{block.heading}</h3> : null}
          {block.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm text-muted-foreground leading-relaxed">
              {p}
            </p>
          ))}
          {block.bullets?.length ? (
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {block.bullets.map((b) => (
                <li key={b.slice(0, 40)}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </section>
  );
}

function DeleteDataForm() {
  const submit = useServerFn(submitDeleteDataRequest);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [scenarioCode, setScenarioCode] = useState("");
  const [details, setDetails] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm) {
      toast.error("Please confirm you are submitting this request for yourself.");
      return;
    }
    setBusy(true);
    try {
      await submit({
        data: {
          full_name: fullName,
          email,
          scenario_code: scenarioCode.trim() || null,
          details,
          confirm: true,
        },
      });
      toast.success("Delete request received. We will respond within 30 days.");
      setFullName("");
      setEmail("");
      setScenarioCode("");
      setDetails("");
      setConfirm(false);
    } catch (err) {
      toast.error((err as Error)?.message ?? "Could not submit request");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card id="delete-data" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trash2 className="h-5 w-5 text-primary" /> Delete My Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Use this form to request deletion of personal information associated with your use of{" "}
          {SITE_BRAND_NAME} (for example, expert opt-in contact details or account data). We will
          verify your request and respond within a reasonable time, typically within 30 days.
        </p>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delete-name">Full name</Label>
              <Input
                id="delete-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-email">Email</Label>
              <Input
                id="delete-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="delete-scenario">{COMPARISON_ID_LABEL} (optional)</Label>
            <Input
              id="delete-scenario"
              placeholder="SCN-XXXX"
              value={scenarioCode}
              onChange={(e) => setScenarioCode(e.target.value)}
              maxLength={64}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delete-details">What should we delete?</Label>
            <Textarea
              id="delete-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              minLength={10}
              maxLength={4000}
              rows={4}
              placeholder="Describe the data you want removed (contact opt-in, account, etc.)."
            />
          </div>
          <TouchCheckboxField checked={confirm} onChange={(e) => setConfirm((e.target as HTMLInputElement).checked)}>
            <span className="text-sm">
              I confirm this request relates to my own information and the details above are
              accurate.
            </span>
          </TouchCheckboxField>
          <Button type="submit" disabled={busy || !confirm}>
            {busy ? "Submitting…" : "Submit delete request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PrivacyContactSection() {
  const submit = useServerFn(submitPrivacyContactRequest);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ data: { full_name: fullName, email, subject, message } });
      toast.success("Message sent. We will reply to your email.");
      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error((err as Error)?.message ?? "Could not send message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card id="privacy-contact" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Mail className="h-5 w-5 text-primary" /> Contact Us About Privacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Questions about this Privacy Policy, your data, or your privacy rights? Email us at{" "}
          <a
            href={`mailto:${PRIVACY_CONTACT_EMAIL}?subject=${encodeURIComponent("Privacy inquiry — Part B Optimizer Benchmark Tool")}`}
            className="text-primary underline underline-offset-2"
          >
            {PRIVACY_CONTACT_EMAIL}
          </a>{" "}
          or use the form below.
        </p>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="privacy-name">Full name</Label>
              <Input
                id="privacy-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy-email">Email</Label>
              <Input
                id="privacy-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacy-subject">Subject</Label>
            <Input
              id="privacy-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacy-message">Message</Label>
            <Textarea
              id="privacy-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              maxLength={4000}
              rows={5}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send privacy message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LegalPage() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const id = window.location.hash.replace(/^#/, "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <AppShell title="Legal & Privacy" subtitle="Policies and privacy tools for Part B Optimizer Benchmark Tool">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">Legal &amp; Privacy</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Policies and privacy tools for {SITE_BRAND_NAME}. Jump to a section below or scroll the
            page.
          </p>
        </div>

        <nav
          aria-label="Legal page sections"
          className="flex flex-wrap gap-2 sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b border-border"
        >
          {LEGAL_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {LEGAL_SECTIONS.map((section) => (
          <LegalSectionBlock key={section.id} section={section} />
        ))}

        <DeleteDataForm />
        <PrivacyContactSection />

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          <Link to="/" className="underline underline-offset-2 hover:text-foreground">
            Return to home
          </Link>
          {" · "}
          <Link to="/sources" className="underline underline-offset-2 hover:text-foreground">
            Data sources
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
