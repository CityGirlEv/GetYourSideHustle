import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  Mail,
  ArrowLeft,
  Users,
  Percent,
  History,
  Send,
  Calendar,
  Eye,
  Loader2,
  FileCode,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/admin_/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter Center — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NewsletterCenterPage,
});

interface NewsletterCampaign {
  id: string;
  subject: string;
  recipientsCount: number;
  openRate: number;
  clickRate: number;
  sentAt: string;
  status: "draft" | "scheduled" | "sent";
}

const PAST_CAMPAIGNS: NewsletterCampaign[] = [
  {
    id: "camp-1",
    subject: "Understanding Medicare Part B Surcharges & IRMAA rules",
    recipientsCount: 94,
    openRate: 46.8,
    clickRate: 21.2,
    sentAt: "2026-06-12T14:00:00Z",
    status: "sent",
  },
  {
    id: "camp-2",
    subject: "Medicare Advantage vs. Medigap: Standard Math Breakdown",
    recipientsCount: 88,
    openRate: 41.5,
    clickRate: 16.4,
    sentAt: "2026-06-05T14:30:00Z",
    status: "sent",
  },
  {
    id: "camp-3",
    subject: "Your Timeline: 3 Months Before Turning 65",
    recipientsCount: 82,
    openRate: 48.2,
    clickRate: 24.6,
    sentAt: "2026-05-29T14:00:00Z",
    status: "sent",
  },
];

const MOCK_ARTICLES = [
  { slug: "turning-65-medicare-guide", title: "Turning 65? Start Here: The Ultimate Guide" },
  { slug: "medicare-at-65-action-plan", title: "3 Months Before 65: Your Medicare Action Plan" },
  { slug: "medicare-enrollment-timeline", title: "Medicare Enrollment Timeline: Month-by-Month" },
  { slug: "turning-65-and-still-working", title: "Turning 65 Still Working: What Happens to My Insurance?" },
];

function NewsletterCenterPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>(PAST_CAMPAIGNS);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [newsletterSubject, setNewsletterSubject] = useState("Weekly Medicare Highlights: Essential Action Steps");
  const [selectedArticleSlugs, setSelectedArticleSlugs] = useState<string[]>([
    "turning-65-medicare-guide",
    "medicare-at-65-action-plan",
  ]);
  const [draftBody, setDraftBody] = useState("");
  const [busyAction, setBusyAction] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth" });
      return;
    }
    if (!userHasAdminRole(user)) {
      router.navigate({ to: "/" });
    }
  }, [user, authLoading, router]);

  // Update draft body template whenever articles selection changes
  useEffect(() => {
    const articlesBlock = selectedArticleSlugs
      .map((slug) => {
        const art = MOCK_ARTICLES.find((a) => a.slug === slug);
        return art
          ? `* [${art.title}](https://getpartb.com/learning-center/${slug})\n  Learn how this impact rules and costs inside.`
          : "";
      })
      .filter(Boolean)
      .join("\n\n");

    const completeTemplate = `Hello {{fullName}},\n\nHere are this week's featured Medicare education highlights from Get Part B Optimizer. Review these steps on your own before coordinating with brokers or agencies.\n\n${articlesBlock}\n\nNeed to model plan costs? Compare premiums and drug tiers side-by-side using our private, de-identified Scenario Creator:\n👉 https://getpartb.com/scenario/new\n\nBest regards,\nThe Get Part B Optimizer Team\n\nTo manage your settings: [Unsubscribe](https://getpartb.com/unsubscribe)`;
    setDraftBody(completeTemplate);
  }, [selectedArticleSlugs]);

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  const toggleArticle = (slug: string) => {
    setSelectedArticleSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSendTest = () => {
    if (!targetEmail.trim()) {
      toast.error("Enter a recipient email address.");
      return;
    }
    setBusyAction(true);
    setTimeout(() => {
      setBusyAction(false);
      setTestEmailOpen(false);
      setTargetEmail("");
      toast.success("Test newsletter dispatched successfully via Resend API.");
    }, 800);
  };

  const handleScheduleCampaign = () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error("Set both date and time parameters.");
      return;
    }
    setBusyAction(true);
    setTimeout(() => {
      const newScheduled: NewsletterCampaign = {
        id: `camp-${Date.now()}`,
        subject: newsletterSubject,
        recipientsCount: 124, // current list count
        openRate: 0,
        clickRate: 0,
        sentAt: `${scheduleDate}T${scheduleTime}:00Z`,
        status: "scheduled",
      };
      setCampaigns((prev) => [newScheduled, ...prev]);
      setBusyAction(false);
      setScheduleOpen(false);
      toast.success("Newsletter scheduled successfully.");
    }, 800);
  };

  const handleSendNow = () => {
    setBusyAction(true);
    setTimeout(() => {
      const newSent: NewsletterCampaign = {
        id: `camp-${Date.now()}`,
        subject: newsletterSubject,
        recipientsCount: 124,
        openRate: 0,
        clickRate: 0,
        sentAt: new Date().toISOString(),
        status: "sent",
      };
      setCampaigns((prev) => [newSent, ...prev]);
      setBusyAction(false);
      toast.success("Campaign launched successfully to all subscribers!");
    }, 1000);
  };

  return (
    <AppShell
      title="Newsletter Center"
      subtitle="Broadcast templates, subscriber metrics, and campaign dispatch queues."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-emerald-400" />
            Email Broadcast Control Center
          </div>
          <Link to="/admin">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Admin dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="glass p-4 border-border/40 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-semibold">Subscribers</div>
              <div className="text-xl font-bold">124</div>
            </div>
          </Card>
          <Card className="glass p-4 border-border/40 flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Percent className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-semibold">Avg Open Rate</div>
              <div className="text-xl font-bold">45.5%</div>
            </div>
          </Card>
          <Card className="glass p-4 border-border/40 flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 rounded-lg">
              <Percent className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-semibold">Avg Click Rate</div>
              <div className="text-xl font-bold">20.7%</div>
            </div>
          </Card>
          <Card className="glass p-4 border-border/40 flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <History className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-semibold">Total Campaigns</div>
              <div className="text-xl font-bold">14</div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="glass p-5 border-primary/10 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Compose Campaign (Weekly Digest)</h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">Active Draft</Badge>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Subject Line</label>
                <Input
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Featured Articles to Include</label>
                <div className="grid sm:grid-cols-2 gap-2 bg-muted/20 p-3 rounded-lg border">
                  {MOCK_ARTICLES.map((art) => (
                    <label key={art.slug} className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      <Checkbox
                        checked={selectedArticleSlugs.includes(art.slug)}
                        onCheckedChange={() => toggleArticle(art.slug)}
                      />
                      <span>{art.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Email Body Preview (Markdown/Text)</label>
                <Textarea
                  rows={10}
                  className="font-mono text-xs"
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setTestEmailOpen(true)}>
                  <Eye className="h-4 w-4 mr-1.5" /> Send Test
                </Button>
                <Button size="sm" variant="outline" onClick={() => setScheduleOpen(true)}>
                  <Calendar className="h-4 w-4 mr-1.5" /> Schedule Broadcast
                </Button>
                <Button size="sm" className="grad-indigo" onClick={handleSendNow}>
                  <Send className="h-4 w-4 mr-1.5" /> Send to All (124)
                </Button>
              </div>
            </div>
          </Card>

          <Card className="glass p-5 border-border/40 space-y-4">
            <h2 className="font-display text-base font-bold flex items-center gap-1.5">
              <History className="h-4 w-4" /> Sent Campaigns
            </h2>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {campaigns.map((camp) => (
                <div key={camp.id} className="rounded-lg border bg-background/40 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {new Date(camp.sentAt).toLocaleDateString()}
                    </span>
                    <Badge
                      className={`text-[9px] uppercase ${
                        camp.status === "sent"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      }`}
                    >
                      {camp.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground line-clamp-1">{camp.subject}</h4>
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t text-[10px] text-muted-foreground">
                    <div>
                      <div className="font-semibold text-foreground">{camp.recipientsCount}</div>
                      <div>Sent</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{camp.openRate}%</div>
                      <div>Open</div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{camp.clickRate}%</div>
                      <div>Click</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dispatch Test Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Send a raw HTML version of this draft to verification accounts to review rendering formats.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Recipient Address</label>
              <Input
                type="email"
                placeholder="developer@getpartb.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTestEmailOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendTest} disabled={busyAction} className="grad-indigo">
              {busyAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Campaign Broadcast</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-3">
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-muted-foreground">
                Broadcast locks 30 minutes prior to queue dispatch. Check compliance filters beforehand.
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Target Date</label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Target Time</label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleScheduleCampaign} disabled={busyAction} className="grad-indigo">
              {busyAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
