import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { ArticleTitleWithImage } from "@/components/ArticleTitleWithImage";
import { ContentDispatchLogPanel } from "@/components/content-factory/ContentDispatchLogPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  listNewsletterArticlesAdmin,
  sendNewsletterCenterTestAdmin,
} from "@/lib/content-factory.functions";
import { publicSiteUrl } from "@/lib/site-url";
import { ArrowLeft, Eye, Loader2, Mail, Send } from "lucide-react";

export const Route = createFileRoute("/admin_/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter Center — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NewsletterCenterPage,
});

const DEFAULT_SUBJECT =
  "This week in Medicare education — enrollment timing and plan comparisons";

function buildNewsletterBody(
  articles: Array<{ slug: string; title: string }>,
  selectedSlugs: string[],
): string {
  const site = publicSiteUrl();
  const guides = selectedSlugs
    .map((slug) => {
      const article = articles.find((item) => item.slug === slug);
      if (!article) return "";
      return `- [${article.title}](${site}/learning-center/${slug})`;
    })
    .filter(Boolean)
    .join("\n");

  return [
    "Hello {{fullName}},",
    "",
    "Welcome to this week's Learning Center roundup from The Part B Optimizer. We publish plain-language Medicare education — not enrollment sales.",
    "",
    "## Featured guides",
    "",
    guides,
    "",
    "## Quick reminders",
    "",
    "- Confirm enrollment deadlines that apply to your situation on Medicare.gov or with SSA",
    "- Compare plans using official tools before sharing personal identifiers online",
    "- Contact SHIP in your state for free, unbiased help",
    "",
    "Educational only — we do not sell insurance or enroll you in coverage.",
  ].join("\n");
}

function NewsletterCenterPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const listArticles = useServerFn(listNewsletterArticlesAdmin);
  const sendTest = useServerFn(sendNewsletterCenterTestAdmin);

  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState(DEFAULT_SUBJECT);
  const [selectedArticleSlugs, setSelectedArticleSlugs] = useState<string[]>([]);
  const [draftBody, setDraftBody] = useState("");
  const [bodyTouched, setBodyTouched] = useState(false);

  const articlesQuery = useQuery({
    queryKey: ["newsletter-articles"],
    queryFn: () => listArticles({ data: {} }),
    enabled: Boolean(user && userHasAdminRole(user)),
  });

  const articles = articlesQuery.data ?? [];

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

  useEffect(() => {
    if (!articles.length || selectedArticleSlugs.length) return;
    setSelectedArticleSlugs(articles.slice(0, 2).map((article) => article.slug));
  }, [articles, selectedArticleSlugs.length]);

  useEffect(() => {
    if (bodyTouched || !articles.length || !selectedArticleSlugs.length) return;
    setDraftBody(buildNewsletterBody(articles, selectedArticleSlugs));
  }, [articles, selectedArticleSlugs, bodyTouched]);

  const sendTestMutation = useMutation({
    mutationFn: () =>
      sendTest({
        data: {
          recipient: targetEmail.trim(),
          subject: newsletterSubject.trim(),
          body: draftBody,
          featuredSlugs: selectedArticleSlugs,
        },
      }),
    onSuccess: () => {
      setTestEmailOpen(false);
      setTargetEmail("");
      toast.success("Test newsletter queued. Check dispatch log below for delivery status.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const selectedArticles = useMemo(
    () => articles.filter((article) => selectedArticleSlugs.includes(article.slug)),
    [articles, selectedArticleSlugs],
  );

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  const toggleArticle = (slug: string) => {
    setSelectedArticleSlugs((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
    );
  };

  const handleSendTest = () => {
    if (!targetEmail.trim()) {
      toast.error("Enter a recipient email address.");
      return;
    }
    if (!draftBody.trim()) {
      toast.error("Compose a newsletter body first.");
      return;
    }
    sendTestMutation.mutate();
  };

  return (
    <AppShell
      title="Newsletter Center"
      subtitle="Educational weekly digest — test sends go through Resend with full dispatch logging."
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="truncate">Learning Center email digest</span>
          </div>
          <Link to="/admin" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Admin dashboard
            </Button>
          </Link>
        </div>

        <Card className="glass p-5 border-primary/10 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold">Compose Weekly Digest</h2>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
              Educational draft
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Use calm, educational language — not sales headlines like &quot;Medicare Education
            Highlights.&quot; The default template matches Content Factory batch newsletters.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Subject line</label>
              <Input
                value={newsletterSubject}
                onChange={(event) => setNewsletterSubject(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Featured Learning Center guides
              </label>
              {articlesQuery.isLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading articles…
                </div>
              ) : (
                <div className="grid gap-2 bg-muted/20 p-3 rounded-lg border">
                  {articles.map((article) => (
                    <label
                      key={article.slug}
                      className="flex items-start gap-3 rounded-md p-2 cursor-pointer hover:bg-background/70"
                    >
                      <Checkbox
                        className="mt-2"
                        checked={selectedArticleSlugs.includes(article.slug)}
                        onCheckedChange={() => toggleArticle(article.slug)}
                      />
                      <div className="min-w-0 flex-1">
                        <ArticleTitleWithImage
                          title={article.title}
                          excerpt={article.excerpt}
                          imageSrc={article.featuredImage}
                          size="newsletter"
                          titleAs="h3"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Email body (Markdown/text)
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setBodyTouched(false);
                    setDraftBody(buildNewsletterBody(articles, selectedArticleSlugs));
                  }}
                >
                  Reset from selection
                </Button>
              </div>
              <Textarea
                rows={12}
                className="font-mono text-xs"
                value={draftBody}
                onChange={(event) => {
                  setBodyTouched(true);
                  setDraftBody(event.target.value);
                }}
              />
            </div>

            {selectedArticles.length ? (
              <div className="space-y-2 rounded-lg border border-border/70 bg-background/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Email preview — featured guides</p>
                <div className="space-y-3">
                  {selectedArticles.map((article) => (
                    <ArticleTitleWithImage
                      key={article.slug}
                      title={article.title}
                      excerpt={article.excerpt}
                      imageSrc={article.featuredImage}
                      size="newsletter"
                      titleAs="h3"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {selectedArticles.length ? (
              <p className="text-[11px] text-muted-foreground">
                Including {selectedArticles.length} guide
                {selectedArticles.length === 1 ? "" : "s"} in this draft.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setTestEmailOpen(true)}>
                <Eye className="h-4 w-4 mr-1.5" /> Send Test
              </Button>
            </div>
          </div>
        </Card>

        <ContentDispatchLogPanel
          channel="newsletter"
          title="Newsletter dispatch log"
          description="Every test send, schedule, and publish attempt. Status updates when Resend processes the queue."
        />
      </div>

      <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send test newsletter</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Delivers through the same Resend pipeline as other transactional mail. In sandbox
              mode, only the Resend account owner may receive mail until mypartb.com is verified.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Recipient address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={targetEmail}
                onChange={(event) => setTargetEmail(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTestEmailOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSendTest}
              disabled={sendTestMutation.isPending}
              className="grad-indigo"
            >
              {sendTestMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1" />
              )}
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
