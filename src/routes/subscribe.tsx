import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { NewsletterSignupForm } from "@/components/NewsletterSignupForm";
import { Card } from "@/components/ui/card";
import { BookOpen, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";
import { LEARNING_CENTER_SCOPE_NOTE } from "@/lib/learning-center";

const PAGE_URL = canonicalUrl("/subscribe");

export const Route = createFileRoute("/subscribe")({
  head: () => ({
    meta: [
      { title: `Subscribe — ${SITE_BRAND_NAME}` },
      {
        name: "description",
        content:
          "Subscribe for weekly Learning Center highlights — plain-language Medicare guides on enrollment, plan types, costs, and comparison tips. No sales pressure.",
      },
      { property: "og:title", content: `Subscribe — ${SITE_BRAND_NAME}` },
      {
        property: "og:description",
        content:
          "Weekly Medicare education in your inbox — new Learning Center articles, enrollment timing explained plainly, zero sales calls.",
      },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: SubscribePage,
});

const SUBSCRIBE_PERKS = [
  {
    icon: BookOpen,
    title: "Plain-language guides",
    body: "Enrollment windows, plan types, costs, and comparison tips — written so you actually understand them.",
  },
  {
    icon: Sparkles,
    title: "Fresh picks each week",
    body: "New Learning Center articles and highlights from our library, delivered to your inbox so nothing important slips by.",
  },
  {
    icon: ShieldCheck,
    title: "Zero sales pressure",
    body: "Educational email only. No agents calling, no enrollment pitches, no sharing your address with marketers.",
  },
] as const;

function SubscribePage() {
  return (
    <AppShell
      title="Subscribe"
      subtitle="Free weekly Medicare education from our Learning Center — clarity in your inbox, on your terms."
    >
      <div className="max-w-2xl mx-auto space-y-5">
        <Card className="glass p-5 sm:p-6 border-emerald-500/20 bg-emerald-500/5 space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
            <div className="space-y-2">
              <h2 className="font-display text-lg font-bold sm:text-xl">
                Get the Learning Center in your inbox
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Medicare is full of jargon, deadlines, and fine print. The{" "}
                <Link to="/learning-center" className="text-primary font-semibold hover:underline">
                  {SITE_BRAND_NAME} Learning Center
                </Link>{" "}
                cuts through the noise with calm, practical guides — and this weekly email brings the
                best of it straight to you.
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                Think of it as a short briefing from a friend who reads the Medicare stuff so you
                don&apos;t have to: what changed, what to know before you compare plans, and which
                articles are worth your time this week.
              </p>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {SUBSCRIBE_PERKS.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-lg border border-primary/15 bg-background/60 px-3 py-3 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {title}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{body}</p>
              </li>
            ))}
          </ul>

          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 space-y-1">
            <p className="text-xs font-semibold text-foreground">What you&apos;ll receive</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              One email per week with new article highlights, timely enrollment reminders explained
              in plain English, and links back to the full guides on our site. Unsubscribe anytime
              with one click.
            </p>
          </div>

          <NewsletterSignupForm />

          <p className="text-[11px] text-muted-foreground leading-snug border-t border-border/60 pt-3">
            {LEARNING_CENTER_SCOPE_NOTE} We do not sell insurance or enroll you in coverage through
            this newsletter.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
