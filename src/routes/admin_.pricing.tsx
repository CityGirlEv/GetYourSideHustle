import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import { downloadProposalPdf, downloadProposalDocx } from "@/lib/proposal-export";
import {
  ArrowLeft,
  Download,
  FileText,
  DollarSign,
  Percent,
  CheckCircle2,
  Lock,
  Sparkles,
  Edit3,
  Save,
  Check,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/admin_/pricing")({
  head: () => ({
    meta: [
      { title: "Master Implementation Pricing — Angela Harris" },
      {
        name: "description",
        content: "Interactive Phase-by-Phase Pricing & Tiered Payment Discount Schedule for Angela Harris (Muntie Ev).",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPricingPage,
});

type PhaseLineItem = {
  id: string;
  name: string;
  description: string;
  hours: number;
  rate: number;
  baseAmount: number;
};

const DEFAULT_LINE_ITEMS: PhaseLineItem[] = [
  {
    id: "phase1",
    name: "Phase 1: Brand, Domain & Scaffold",
    description: "Canonical domain setup (myplannotmymood.com / http://localhost:3001), logo pipeline, design system, Supabase DB & Auth",
    hours: 25,
    rate: 85,
    baseAmount: 2500,
  },
  {
    id: "phase2",
    name: "Phase 2: E-Commerce Storefront & Catalog",
    description: "Storefront UI, product pages (Tees, Hoodies, Planners), cart drawer, Stripe/Shopify checkout",
    hours: 35,
    rate: 85,
    baseAmount: 3500,
  },
  {
    id: "phase3",
    name: "Phase 3: Digital Magic & Mood Tool",
    description: "Interactive Mood Selector (/mood), 'What Won Today?' Digital Receipt generator, 7-Day Challenge",
    hours: 32,
    rate: 85,
    baseAmount: 3200,
  },
  {
    id: "phase4",
    name: "Phase 4: Admin Command Suite & Email",
    description: "Task List board, QA Testing Matrix, User RBAC, Klaviyo/Resend template builder, POD routing",
    hours: 30,
    rate: 85,
    baseAmount: 3000,
  },
  {
    id: "phase5",
    name: "Phase 5: Hard Launch & Dual Growth",
    description: "Cloudflare Pages deployment, Meta/TikTok Pixel conversion tracking, social ad launching",
    hours: 18,
    rate: 85,
    baseAmount: 2400,
  },
  {
    id: "arch",
    name: "System Architecture & Cloud Setup",
    description: "Cloudflare DNS, SSL edge, Supabase DB design, Stripe payment binding, POD API setup",
    hours: 0,
    rate: 0,
    baseAmount: 1500,
  },
  {
    id: "design",
    name: "UI/UX Design & Brand Asset Creation",
    description: "E-commerce design system, logo processing, product mockups, email template styling",
    hours: 0,
    rate: 0,
    baseAmount: 1200,
  },
];

const DEFAULT_PROPOSAL_TEXT = `MY PLAN, NOT MY MOOD is a premium lifestyle, apparel, personal accountability, and digital productivity brand founded by Angela Harris (Muntie Ev), powered by Muntie Ev's AI Studio (muntiesaiagents.com). The brand is built on a foundational human truth: 'Do not let a temporary mood determine a permanent outcome. Feel it. Follow the Plan anyway.'`;

function AdminPricingPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  const [lineItems, setLineItems] = useState<PhaseLineItem[]>(DEFAULT_LINE_ITEMS);
  const [selectedDiscountTier, setSelectedDiscountTier] = useState<number>(15);
  const [proposalNotes, setProposalNotes] = useState<string>(DEFAULT_PROPOSAL_TEXT);
  const [isSaved, setIsSaved] = useState<boolean>(false);

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

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  const totalBasePrice = lineItems.reduce((sum, item) => sum + item.baseAmount, 0);

  const handleAmountChange = (id: string, newAmount: number) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, baseAmount: Math.max(0, newAmount) } : item))
    );
  };

  const getDiscountedTotal = (discountPercent: number) => {
    return totalBasePrice * (1 - discountPercent / 100);
  };

  const formatUsd = (num: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);

  const handleSaveAndRegenerate = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportPdf = () => {
    downloadProposalPdf({
      title: "MY PLAN, NOT MY MOOD — Master Implementation Proposal",
      subtitle: "Prepared for Angela Harris (Muntie Ev) & Executive Leadership",
      preparedFor: "Angela Harris (Muntie Ev)",
      proposalNotes,
      lineItems,
      totalBasePrice,
      selectedDiscountTier,
    });
  };

  const handleExportDocx = () => {
    downloadProposalDocx({
      title: "MY PLAN, NOT MY MOOD — Master Implementation Proposal",
      subtitle: "Prepared for Angela Harris (Muntie Ev) & Executive Leadership",
      preparedFor: "Angela Harris (Muntie Ev)",
      proposalNotes,
      lineItems,
      totalBasePrice,
      selectedDiscountTier,
    });
  };

  return (
    <AppShell
      title="Master Implementation Pricing & Payment Calculator"
      subtitle="Prepared for Angela Harris (Muntie Ev) — MY PLAN, NOT MY MOOD"
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Confidentiality & Logo Header */}
        <Card className="glass p-6 border-red-500/30 bg-red-950/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/munties_ai_agents_logo.png"
                alt="Muntie Ev's AI AGENTS Logo"
                className="h-10 md:h-12 w-auto rounded-lg shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="bg-red-600 text-white font-bold">
                    <Lock className="h-3 w-3 mr-1" /> CONFIDENTIAL & PROPRIETARY
                  </Badge>
                  <span className="text-xs text-muted-foreground">Trade Secret Disclosure</span>
                </div>
                <h1 className="text-xl font-bold font-display mt-1">
                  MY PLAN, NOT MY MOOD &mdash; Master Implementation Proposal
                </h1>
                <p className="text-xs text-muted-foreground">
                  Prepared for <strong>Angela Harris (Muntie Ev)</strong> & Executive Leadership · Powered by Muntie Ev&apos;s AI Studio
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://muntiesaiagents.com/MyPlan"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm">
                  <ExternalLink className="h-4 w-4 mr-1.5" /> Launch Live (muntiesaiagents.com/MyPlan)
                </Button>
              </a>
              <a
                href="https://myplannotmymood.com"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-950/30">
                  <ExternalLink className="h-4 w-4 mr-1.5" /> myplannotmymood.com
                </Button>
              </a>
              <a
                href="file:///C:/Users/evely/.gemini/antigravity-ide/brain/d5cb1c2c-6006-42e6-aceb-892bc4f384e2/implementation_plan_muntie_ev_final.pdf"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Download className="h-4 w-4 mr-1.5" /> Download PDF
                </Button>
              </a>
              <a
                href="file:///C:/Users/evely/.gemini/antigravity-ide/brain/d5cb1c2c-6006-42e6-aceb-892bc4f384e2/implementation_plan_muntie_ev.docx"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-1.5" /> Download Word (.docx)
                </Button>
              </a>
              <Link to="/admin">
                <Button size="sm" variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Admin
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Top Discount Percentage Selector Bar */}
        <Card className="glass p-6 border-amber-500/30 bg-amber-950/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-amber-400" />
                <h2 className="font-display text-xl font-bold">Select Pre-Payment Discount Incentive Tier</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Toggle between <strong>10%</strong>, <strong>15%</strong>, and <strong>25%</strong> pre-payment discount tiers to dynamically update all payment schedule options and savings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-background/60 p-2 rounded-xl border border-border">
              {[0, 10, 15, 25].map((discount) => (
                <Button
                  key={discount}
                  onClick={() => setSelectedDiscountTier(discount)}
                  variant={selectedDiscountTier === discount ? "default" : "outline"}
                  size="sm"
                  className={
                    selectedDiscountTier === discount
                      ? "bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md scale-105"
                      : "text-muted-foreground border-border"
                  }
                >
                  {discount === 0 ? "0% Standard" : `${discount}% OFF`}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-background/40 p-3 rounded-xl border border-border">
              <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground">Total Base Buildout</span>
              <div className="text-lg font-bold font-display text-foreground">{formatUsd(totalBasePrice)}</div>
            </div>
            <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-500/30">
              <span className="text-[11px] font-mono font-bold uppercase text-amber-400">Active Selected Discount</span>
              <div className="text-lg font-bold font-display text-amber-400">{selectedDiscountTier}% OFF TIER</div>
            </div>
            <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30">
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-400">Net Investment after Savings</span>
              <div className="text-lg font-bold font-display text-emerald-400">
                {formatUsd(getDiscountedTotal(selectedDiscountTier))}
                <span className="text-xs font-normal text-emerald-500 ml-1.5">(Save {formatUsd(totalBasePrice * (selectedDiscountTier / 100))})</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Schedule Discount Matrix */}
        <Card className="glass p-6 space-y-6">
          <div className="space-y-1 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Payment Schedule Options ({selectedDiscountTier}% Selected Discount)</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Numbers below dynamically reflect your selected <strong>{selectedDiscountTier}%</strong> discount. Select any card to customize terms.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Option 1: Standard 0% */}
            <div
              onClick={() => setSelectedDiscountTier(0)}
              className={`cursor-pointer rounded-xl border p-5 space-y-3 transition-all ${
                selectedDiscountTier === 0
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-background/40 hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <Badge variant="outline">Standard Plan</Badge>
                <span className="text-xs font-bold text-muted-foreground">0% OFF</span>
              </div>
              <h3 className="font-bold text-lg font-display">1/3 Split Schedule</h3>
              <div className="text-2xl font-bold font-display text-primary tabular-nums">
                {formatUsd(totalBasePrice)}
              </div>
              <p className="text-xs text-muted-foreground">Standard 3-stage milestone breakdown</p>
              <div className="text-xs space-y-1.5 pt-2 border-t border-border/60">
                <div>• <strong>1/3 Down:</strong> {formatUsd(totalBasePrice / 3)}</div>
                <div>• <strong>1/3 Sprint 3:</strong> {formatUsd(totalBasePrice / 3)}</div>
                <div>• <strong>1/3 Launch:</strong> {formatUsd(totalBasePrice / 3)}</div>
                <div className="text-muted-foreground">• <strong>Savings:</strong> $0.00</div>
              </div>
            </div>

            {/* Option 2: 10% Discount */}
            <div
              onClick={() => setSelectedDiscountTier(10)}
              className={`cursor-pointer rounded-xl border p-5 space-y-3 transition-all ${
                selectedDiscountTier === 10
                  ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30"
                  : "border-border bg-background/40 hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <Badge className="bg-blue-600 text-white">Milestone Plan</Badge>
                <span className="text-xs font-bold text-blue-400">10% OFF</span>
              </div>
              <h3 className="font-bold text-lg font-display">10% Milestone Plan</h3>
              <div className="text-2xl font-bold font-display text-blue-400 tabular-nums">
                {formatUsd(getDiscountedTotal(10))}
              </div>
              <p className="text-xs text-emerald-400 font-medium">You Save: {formatUsd(totalBasePrice * 0.10)}</p>
              <div className="text-xs space-y-1.5 pt-2 border-t border-border/60">
                <div>• <strong>1/3 Down:</strong> {formatUsd(getDiscountedTotal(10) / 3)}</div>
                <div>• <strong>40% Sprint 3:</strong> {formatUsd(getDiscountedTotal(10) * 0.40)}</div>
                <div>• <strong>26.7% Launch:</strong> {formatUsd(getDiscountedTotal(10) * 0.2667)}</div>
              </div>
            </div>

            {/* Option 3: 15% Discount */}
            <div
              onClick={() => setSelectedDiscountTier(15)}
              className={`cursor-pointer rounded-xl border p-5 space-y-3 transition-all ${
                selectedDiscountTier === 15
                  ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30"
                  : "border-border bg-background/40 hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <Badge className="bg-purple-600 text-white">50/50 Split</Badge>
                <span className="text-xs font-bold text-purple-400">15% OFF</span>
              </div>
              <h3 className="font-bold text-lg font-display">15% Split Plan</h3>
              <div className="text-2xl font-bold font-display text-purple-400 tabular-nums">
                {formatUsd(getDiscountedTotal(15))}
              </div>
              <p className="text-xs text-emerald-400 font-medium">You Save: {formatUsd(totalBasePrice * 0.15)}</p>
              <div className="text-xs space-y-1.5 pt-2 border-t border-border/60">
                <div>• <strong>50% Down:</strong> {formatUsd(getDiscountedTotal(15) * 0.5)}</div>
                <div>• <strong>50% Launch:</strong> {formatUsd(getDiscountedTotal(15) * 0.5)}</div>
              </div>
            </div>

            {/* Option 4: 25% Full Executive Discount */}
            <div
              onClick={() => setSelectedDiscountTier(25)}
              className={`cursor-pointer rounded-xl border p-5 space-y-3 transition-all relative overflow-hidden ${
                selectedDiscountTier === 25
                  ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40"
                  : "border-border bg-background/40 hover:border-muted-foreground/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <Badge className="bg-emerald-600 text-white">
                  <Sparkles className="h-3 w-3 mr-1" /> Executive Tier
                </Badge>
                <span className="text-xs font-bold text-emerald-400">25% OFF</span>
              </div>
              <h3 className="font-bold text-lg font-display">25% Upfront Plan</h3>
              <div className="text-2xl font-bold font-display text-emerald-400 tabular-nums">
                {formatUsd(getDiscountedTotal(25))}
              </div>
              <p className="text-xs text-emerald-400 font-medium font-bold">
                Max Savings: {formatUsd(totalBasePrice * 0.25)}
              </p>
              <div className="text-xs space-y-1.5 pt-2 border-t border-border/60">
                <div>• <strong>100% Paid Upfront</strong></div>
                <div className="text-emerald-400 font-bold">• Maximum Savings Included</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Inline Executive Summary Text Editor */}
        <Card className="glass p-6 space-y-4 border-primary/20">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Inline Proposal & Executive Summary Editor</h2>
            </div>
            <Badge variant="outline" className="text-xs">
              Live Interactive Sync
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Edit executive proposal notes inline below. Clicking save will update proposal copy across the live dashboard, PDF, and Word documents.
          </p>
          <Textarea
            value={proposalNotes}
            onChange={(e) => setProposalNotes(e.target.value)}
            rows={4}
            className="font-sans text-sm p-3 border-border"
          />
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-border/60">
            <Button
              onClick={() => {
                handleSaveAndRegenerate();
                handleExportDocx();
              }}
              variant="outline"
              className="border-blue-500/40 text-blue-300 hover:bg-blue-950/30 font-semibold"
            >
              <FileText className="h-4 w-4 mr-1.5" /> Save & Export Word (.docx)
            </Button>

            <Button
              onClick={() => {
                handleSaveAndRegenerate();
                handleExportPdf();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              {isSaved ? <Check className="h-4 w-4 mr-1.5" /> : <Download className="h-4 w-4 mr-1.5" />}
              {isSaved ? "Saved & PDF Exported!" : "Save & Export PDF (.pdf)"}
            </Button>
          </div>
        </Card>

        {/* Phase-by-Phase Line Item Calculator */}
        <Card className="glass p-6 space-y-6 border-primary/20">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Phase-by-Phase Line Item Investment
              </h2>
              <p className="text-xs text-muted-foreground">
                Adjust individual phase line items to recalculate total base investment & payment schedules in real time.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase text-muted-foreground tracking-wider font-medium">
                Turnkey Base Build Cost
              </span>
              <div className="text-2xl font-bold font-display text-primary tabular-nums">
                TBD
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {lineItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border border-border/80 bg-background/50 hover:bg-secondary/20 transition-colors"
              >
                <div className="space-y-1 flex-1 min-w-[280px]">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {item.name}
                    {item.hours > 0 && (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        ~{item.hours} hrs @ ${item.rate}/hr
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-36">
                    <Input
                      type="number"
                      value={item.baseAmount}
                      onChange={(e) => handleAmountChange(item.id, parseFloat(e.target.value) || 0)}
                      className="text-right font-mono text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </AppShell>
  );
}
