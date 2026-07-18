import { AGENCY_REFERRAL_NOTICE } from "@/lib/medicare-disclaimers";
import { PRODUCTION_SITE_ORIGIN, PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Facebook,
  Image,
  Video,
  Mail,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  ShieldCheck,
  Copy,
  ThumbsUp,
  MessageSquare,
  Share2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateMarketingContent,
  checkMarketingCompliance,
  TRENDING_TOPICS,
  type MarketingContent,
  type ComplianceCheck,
} from "@/lib/agent-marketing-utils";

export function AgentMarketing() {
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [content, setContent] = useState<MarketingContent | null>(null);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [approvedAssets, setApprovedAssets] = useState<Record<string, boolean>>({
    seoArticle: false,
    facebookPost: false,
    infographicConcept: false,
    videoScript: false,
    newsletterDraft: false,
  });
  const [publishDate, setPublishDate] = useState("");
  const [queueStatus, setQueueStatus] = useState<"draft" | "reviewing" | "approved" | "published">("draft");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const steps = [
    "Analyzing search trends...",
    "Drafting SEO blog article...",
    "Formatting Facebook Business Page copy...",
    "Structuring email newsletter body...",
    "Validating compliance disclaimers...",
  ];

  // Run initial generation on first mount with a trending topic
  useEffect(() => {
    handleGenerate(TRENDING_TOPICS[0]);
  }, []);

  const handleGenerate = async (topicName?: string) => {
    const topicToUse = topicName || query || "Medicare Basics";
    setGenerating(true);
    setGenStep(0);
    setQueueStatus("draft");
    setApprovedAssets({
      seoArticle: false,
      facebookPost: false,
      infographicConcept: false,
      videoScript: false,
      newsletterDraft: false,
    });

    // Simulated generator steps
    for (let i = 0; i < steps.length; i++) {
      setGenStep(i);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    const generated = generateMarketingContent(topicToUse);
    const checks = checkMarketingCompliance(generated);

    setContent(generated);
    setComplianceChecks(checks);
    setGenerating(false);
    toast.success("AI Growth Agent generated daily marketing package!");
  };

  const toggleApprove = (key: string) => {
    setApprovedAssets((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const allApproved = Object.values(next).every(Boolean);
      if (allApproved) {
        setQueueStatus("approved");
      } else {
        setQueueStatus("reviewing");
      }
      return next;
    });
  };

  const handleApproveAll = () => {
    setApprovedAssets({
      seoArticle: true,
      facebookPost: true,
      infographicConcept: true,
      videoScript: true,
      newsletterDraft: true,
    });
    setQueueStatus("approved");
    toast.success("All daily marketing assets approved for publishing!");
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleLaunchCampaign = () => {
    setQueueStatus("published");
    toast.success("Daily marketing campaign successfully launched! Assets queued for publication.");
  };

  const allApproved = Object.values(approvedAssets).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Overview & Branding Card */}
      <Card className="glass p-6 border-l-4 border-l-indigo bg-gradient-to-r from-indigo/5 to-emerald/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo/10 text-indigo border border-indigo/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                CMO & AI Growth Agent
              </span>
              <span className="bg-emerald/10 text-emerald border border-emerald/20 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                Compliance Verified
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">Part B Optimizer Benchmark Tool Marketing Center</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              We position **Part B Optimizer Benchmark Tool** (
              <a href={PRODUCTION_SITE_ORIGIN} target="_blank" rel="noreferrer" className="underline text-indigo hover:text-indigo/80 font-medium">
                {PRODUCTION_SITE_ORIGIN}
              </a>
              ) strictly as an **independent educational technology platform and Third-Party Marketing Organization (TPMO)**. We do not sell insurance directly. {AGENCY_REFERRAL_NOTICE}
            </p>
          </div>
          <div className="shrink-0 bg-background/50 border border-border rounded-xl p-3 text-xs space-y-1.5 max-w-xs">
            <div className="font-bold text-foreground uppercase tracking-wide">Facebook Page Profile</div>
            <div><strong className="text-muted-foreground">Name:</strong> Part B Optimizer Benchmark Tool</div>
            <div><strong className="text-muted-foreground">Category:</strong> Educational Website</div>
            <div><strong className="text-muted-foreground">CTA:</strong> Learn More &rarr; {PUBLIC_WEBSITE_HOST}</div>
          </div>
        </div>
      </Card>

      {/* Topics & Generating Panel */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <Card className="glass p-5 space-y-4">
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo animate-pulse" />
              Daily Campaign Research & Generation
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter a custom Medicare topic (e.g. Can I Keep My Doctor?)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-11"
                  disabled={generating}
                />
              </div>
              <Button
                onClick={() => handleGenerate()}
                disabled={generating}
                className="grad-indigo h-11 px-6 font-semibold shrink-0"
              >
                {generating ? "Generating..." : "Research & Generate"}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Trending Medicare Topics:
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setQuery(topic);
                      handleGenerate(topic);
                    }}
                    disabled={generating}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-secondary hover:border-indigo/40 transition duration-150 cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {generating && (
            <Card className="glass p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo/30 border-t-indigo animate-spin mx-auto"></div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-sm">{steps[genStep]}</h4>
                <p className="text-xs text-muted-foreground">Gathering compliance guidelines and market rates...</p>
              </div>
              <div className="w-full max-w-md bg-secondary h-1.5 rounded-full overflow-hidden mx-auto">
                <div
                  className="bg-indigo h-full transition-all duration-300"
                  style={{ width: `${((genStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </Card>
          )}

          {content && !generating && (
            <Tabs defaultValue="seo" className="space-y-4">
              <TabsList className="glass grid grid-cols-3 sm:grid-cols-6 h-auto p-1">
                <TabsTrigger value="seo" className="py-2 text-xs flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  SEO Article
                </TabsTrigger>
                <TabsTrigger value="fb" className="py-2 text-xs flex items-center gap-1.5">
                  <Facebook className="h-3.5 w-3.5" />
                  Facebook Post
                </TabsTrigger>
                <TabsTrigger value="infographic" className="py-2 text-xs flex items-center gap-1.5">
                  <Image className="h-3.5 w-3.5" />
                  Infographic
                </TabsTrigger>
                <TabsTrigger value="video" className="py-2 text-xs flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5" />
                  Video Script
                </TabsTrigger>
                <TabsTrigger value="newsletter" className="py-2 text-xs flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Newsletter
                </TabsTrigger>
                <TabsTrigger value="faqs" className="py-2 text-xs flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  FAQs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="seo">
                <Card className="glass p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{content.seoArticle.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <strong className="text-foreground">Meta Description:</strong> {content.seoArticle.metaDescription}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleCopy(content.seoArticle.body, "seo")}
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        {copiedSection === "seo" ? "Copied" : "Copy Body"}
                      </Button>
                      <Button
                        onClick={() => toggleApprove("seoArticle")}
                        variant={approvedAssets.seoArticle ? "default" : "outline"}
                        size="sm"
                        className={`h-8 font-semibold ${approvedAssets.seoArticle ? "bg-emerald hover:bg-emerald/90 text-emerald-foreground" : ""}`}
                      >
                        {approvedAssets.seoArticle ? "✓ Approved" : "Approve"}
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground space-y-4 whitespace-pre-line font-normal">
                    {content.seoArticle.body.split("\n\n").map((para, idx, arr) => {
                      const isFooter = idx === arr.length - 1;
                      return (
                        <p
                          key={idx}
                          className={
                            isFooter
                              ? "bg-indigo/5 border border-indigo/20 rounded-xl p-4 text-indigo font-semibold text-center italic mt-4 shadow-sm"
                              : ""
                          }
                        >
                          {para}
                        </p>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="fb">
                <Card className="glass p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Facebook Page Mockup</span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopy(content.facebookPost.text, "fb")}
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        {copiedSection === "fb" ? "Copied" : "Copy Post"}
                      </Button>
                      <Button
                        onClick={() => toggleApprove("facebookPost")}
                        variant={approvedAssets.facebookPost ? "default" : "outline"}
                        size="sm"
                        className={`h-8 font-semibold ${approvedAssets.facebookPost ? "bg-emerald hover:bg-emerald/90 text-emerald-foreground" : ""}`}
                      >
                        {approvedAssets.facebookPost ? "✓ Approved" : "Approve"}
                      </Button>
                    </div>
                  </div>

                  {/* Simulated Facebook Post UI */}
                  <div className="border border-border rounded-xl bg-background overflow-hidden max-w-xl mx-auto shadow-md">
                    {/* Header */}
                    <div className="p-4 flex items-center gap-3 border-b border-border/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo to-teal flex items-center justify-center text-white font-bold text-sm">
                        MO
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          Part B Optimizer Benchmark Tool
                          <ShieldCheck className="h-4 w-4 text-blue-500 fill-blue-500/10" />
                        </div>
                        <div className="text-[11px] text-muted-foreground">Sponsored · Educational Website</div>
                      </div>
                    </div>
                    {/* Post Copy */}
                    <div className="p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-normal">
                      {content.facebookPost.text}
                    </div>
                    {/* Link Card Attachment */}
                    <div className="border-t border-border bg-secondary/20 flex flex-col sm:flex-row items-stretch">
                      <div className="sm:w-1/3 bg-gradient-to-br from-indigo/20 to-teal/20 min-h-[100px] flex items-center justify-center border-r border-border p-4">
                        <Sparkles className="h-8 w-8 text-indigo/60" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                            {PUBLIC_WEBSITE_HOST}
                          </div>
                          <div className="font-bold text-sm text-foreground truncate">
                            Compare Medicare Options Unbiased &amp; Anonymously
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            Build a de-identified Medicare scenario in 2 minutes. No personal details collected.
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/40">
                          <span className="text-[10px] text-indigo font-semibold">{PUBLIC_WEBSITE_HOST}/compare</span>
                          <a
                            href={content.facebookPost.link}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-secondary hover:bg-secondary/80 border border-border px-3.5 py-1.5 rounded-lg text-xs font-bold text-foreground transition"
                          >
                            {content.facebookPost.cta}
                          </a>
                        </div>
                      </div>
                    </div>
                    {/* Footer Interactions */}
                    <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-secondary/10">
                      <div className="flex gap-4">
                        <button className="flex items-center gap-1 hover:text-foreground transition"><ThumbsUp className="h-3.5 w-3.5" /> Like</button>
                        <button className="flex items-center gap-1 hover:text-foreground transition"><MessageSquare className="h-3.5 w-3.5" /> Comment</button>
                        <button className="flex items-center gap-1 hover:text-foreground transition"><Share2 className="h-3.5 w-3.5" /> Share</button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="infographic">
                <Card className="glass p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-foreground">Graphic Asset Concept</h4>
                      <p className="text-xs text-muted-foreground">Storyboard specifications for the design team</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleApprove("infographicConcept")}
                        variant={approvedAssets.infographicConcept ? "default" : "outline"}
                        size="sm"
                        className={`h-8 font-semibold ${approvedAssets.infographicConcept ? "bg-emerald hover:bg-emerald/90 text-emerald-foreground" : ""}`}
                      >
                        {approvedAssets.infographicConcept ? "✓ Approved" : "Approve"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <div className="border border-border/60 bg-secondary/20 rounded-xl p-3.5 text-center font-bold text-sm text-indigo uppercase tracking-wider">
                      Infographic Title: {content.infographicConcept.title}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {content.infographicConcept.panels.map((p, idx) => (
                        <div key={idx} className="border border-border rounded-xl p-4 bg-background space-y-2 shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-indigo/10 text-indigo flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </div>
                          <div className="font-bold text-sm text-foreground">{p.title}</div>
                          <p className="text-xs text-muted-foreground leading-relaxed font-normal">{p.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-emerald/5 border border-emerald-500/20 text-emerald-700 text-xs rounded-xl p-3 text-center">
                      <strong>Visual Theme:</strong> Harmony of deep blues and organic greens. Prominent {PUBLIC_WEBSITE_HOST} logo. Clear CTA layout at the bottom panel.
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="video">
                <Card className="glass p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-foreground">Short-Form Video Script</h4>
                      <p className="text-xs text-muted-foreground">Optimized for Reels, TikTok, and Shorts (~30-45s)</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopy(`${content.videoScript.hook}\n\n${content.videoScript.body}\n\n${content.videoScript.cta}`, "video")}
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        {copiedSection === "video" ? "Copied" : "Copy Script"}
                      </Button>
                      <Button
                        onClick={() => toggleApprove("videoScript")}
                        variant={approvedAssets.videoScript ? "default" : "outline"}
                        size="sm"
                        className={`h-8 font-semibold ${approvedAssets.videoScript ? "bg-emerald hover:bg-emerald/90 text-emerald-foreground" : ""}`}
                      >
                        {approvedAssets.videoScript ? "✓ Approved" : "Approve"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-xl mx-auto font-normal text-sm">
                    <div className="border-l-4 border-l-red-500 bg-red-500/5 p-3 rounded-r-xl">
                      <div className="text-xs uppercase font-bold text-red-500 mb-0.5">The Hook (First 3s)</div>
                      <p className="text-muted-foreground italic font-semibold">&ldquo;{content.videoScript.hook}&rdquo;</p>
                    </div>
                    <div className="border-l-4 border-l-indigo bg-indigo/5 p-3 rounded-r-xl">
                      <div className="text-xs uppercase font-bold text-indigo mb-0.5">The Body (15-30s)</div>
                      <p className="text-muted-foreground leading-relaxed">{content.videoScript.body}</p>
                    </div>
                    <div className="border-l-4 border-l-emerald bg-emerald/5 p-3 rounded-r-xl">
                      <div className="text-xs uppercase font-bold text-emerald mb-0.5">Outro &amp; CTA (Final 5s)</div>
                      <p className="text-muted-foreground italic font-semibold">&ldquo;{content.videoScript.cta}&rdquo;</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="newsletter">
                <Card className="glass p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-foreground">{content.newsletterDraft.subject}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <strong className="text-foreground">Preview text:</strong> {content.newsletterDraft.previewText}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCopy(content.newsletterDraft.body, "news")}
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        {copiedSection === "news" ? "Copied" : "Copy Email"}
                      </Button>
                      <Button
                        onClick={() => toggleApprove("newsletterDraft")}
                        variant={approvedAssets.newsletterDraft ? "default" : "outline"}
                        size="sm"
                        className={`h-8 font-semibold ${approvedAssets.newsletterDraft ? "bg-emerald hover:bg-emerald/90 text-emerald-foreground" : ""}`}
                      >
                        {approvedAssets.newsletterDraft ? "✓ Approved" : "Approve"}
                      </Button>
                    </div>
                  </div>
                  <div className="border border-border/80 rounded-xl bg-background p-6 font-mono text-xs text-muted-foreground whitespace-pre-line leading-relaxed max-w-xl mx-auto shadow-sm">
                    {content.newsletterDraft.body}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="faqs">
                <Card className="glass p-6 space-y-4">
                  <h4 className="font-bold text-foreground border-b border-border pb-3">Generated FAQs</h4>
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {content.faqContent.map((faq, idx) => (
                      <div key={idx} className="border border-border rounded-xl p-4 bg-background space-y-2 shadow-sm font-normal">
                        <div className="font-bold text-sm text-foreground flex gap-2">
                          <span className="text-indigo">Q:</span>
                          {faq.question}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-5 border-l border-border">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Sidebar Status, Compliance & Performance */}
        <div className="space-y-6">
          {/* Campaign Approval Queue */}
          <Card className="glass p-5 space-y-4">
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Publishing Queue
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">Approval Status</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                  queueStatus === "published"
                    ? "bg-emerald/15 text-emerald border border-emerald/20"
                    : queueStatus === "approved"
                    ? "bg-indigo/15 text-indigo border border-indigo/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                }`}>
                  {queueStatus}
                </span>
              </div>
              <div className="space-y-1 border-b border-border/40 pb-3">
                <span className="text-muted-foreground block mb-1">Approved Assets Checklist</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(approvedAssets).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1.5 truncate">
                      <span className={`h-2.5 w-2.5 rounded-full ${value ? "bg-emerald" : "bg-muted"}`}></span>
                      <span className="capitalize tracking-tight text-[11px] truncate">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground">Simulated Queue Date/Time</label>
                <Input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="h-8 text-xs cursor-pointer"
                />
              </div>
              <div className="pt-2 space-y-2">
                {!allApproved ? (
                  <Button onClick={handleApproveAll} size="sm" variant="outline" className="w-full h-8 text-xs font-semibold cursor-pointer">
                    Approve All Assets
                  </Button>
                ) : (
                  <Button
                    onClick={handleLaunchCampaign}
                    disabled={queueStatus === "published"}
                    size="sm"
                    className="w-full h-9 grad-indigo font-bold text-xs cursor-pointer shadow-md"
                  >
                    Launch Campaign
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Compliance Scan Results */}
          <Card className="glass p-5 space-y-4">
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald" />
              Compliance Guard
            </h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              CMS Marketing Rules (42 CFR §422.2262 / §423.2262) prohibit absolute marketing claims or government misrepresentation.
            </p>
            <div className="space-y-2.5 text-xs">
              {complianceChecks.length > 0 ? (
                complianceChecks.map((check) => (
                  <div key={check.id} className="space-y-1 border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground leading-tight">{check.name}</span>
                      <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                        check.status === "pass"
                          ? "bg-emerald/10 text-emerald border-emerald/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        {check.status === "pass" ? "Pass" : "Fail"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{check.description}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground py-2 text-center w-full justify-center">
                  <AlertCircle className="h-4 w-4" />
                  <span>No generated content scanned.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Marketing Analytics Performance */}
          <Card className="glass p-5 space-y-4">
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Organic Impact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                    Referral Traffic
                  </div>
                  <div className="font-bold text-base text-foreground">12,450</div>
                </div>
                <div className="flex items-center gap-1 text-emerald font-semibold text-xs bg-emerald/10 px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +14%
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                    Leads (Connection Requests)
                  </div>
                  <div className="font-bold text-base text-foreground">248</div>
                </div>
                <div className="text-[10px] text-muted-foreground italic">
                  Permission-based
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                    Facebook reach
                  </div>
                  <div className="font-bold text-base text-foreground">45,200</div>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Impressions
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">
                    Newsletter Open / CTR
                  </div>
                  <div className="font-bold text-base text-foreground">38.2% / 5.4%</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
