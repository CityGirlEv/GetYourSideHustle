import React, { useState } from 'react';
import {
  FileText,
  Download,
  Lock,
  ExternalLink,
  DollarSign,
  Percent,
  Edit3,
  Save,
  Check,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CLIENT_DISPLAY_NAME, CLIENT_EMAIL, CLIENT_NAME, CLIENT_ROLE } from '../lib/clientIdentity';

interface SprintLineItem {
  id: string;
  name: string;
  duration?: string;
  dates?: string;
  summary?: string;
  deliverables?: string[];
  description: string;
  hours: number;
  rate: number;
  baseAmount: number;
  visible?: boolean;
}

const DEFAULT_LINE_ITEMS: SprintLineItem[] = [
  {
    id: "sprint0",
    name: "Sprint 0: Infrastructure, Brand Foundation & Ad Setup",
    duration: "1 Week",
    dates: "Date TBD (1-Week Cadence)",
    summary: "Establish official brand foundation, domain registration, social media presence across TikTok, Facebook, & YouTube, and full ad management infrastructure.",
    deliverables: [
      "Canonical Public Domain (http://www.MuntiesAIAgents.com/MyPlan / localhost:3001)",
      "Setup of Official Social Channels (TikTok, Facebook, YouTube)",
      "Meta & TikTok Business Manager + Pixel & Ad Management Infrastructure",
      "Supabase Database Schema & User Auth Engine",
    ],
    description: "Canonical public URL (http://www.MuntiesAIAgents.com/MyPlan / http://localhost:3001), logo pipeline, design system, Supabase DB & Auth, setup of official social channels (TikTok, Facebook, YouTube), Meta/TikTok Business Manager & Ad Management configuration",
    hours: 35,
    rate: 85,
    baseAmount: 3000,
  },
  {
    id: "sprint1",
    name: "Sprint 1: E-Commerce Storefront & Apparel/Planner Catalog",
    duration: "1 Week",
    dates: "Date TBD (1-Week Cadence)",
    summary: "Build high-converting e-commerce storefront UI, product catalog (Tees, Hoodies, Planners), and responsive checkout drawer.",
    deliverables: [
      "Apparel (Tees, Hoodies) & 2026 Daily Accountability Planner Product Catalog",
      "Interactive Product Preview Modals & Variant Customizer",
      "Shopping Cart Drawer & Stripe Payment Binding",
    ],
    description: "Storefront UI, product catalog pages (Tees, Hoodies, Planners), responsive cart drawer, Stripe/Shopify checkout integration",
    hours: 35,
    rate: 85,
    baseAmount: 3500,
  },
  {
    id: "sprint2",
    name: "Sprint 2: Digital Magic & Mood Selector Tool",
    duration: "1 Week",
    dates: "Date TBD (1-Week Cadence)",
    summary: "Develop interactive Mindset & Mood Selector Tool, 'What Won Today?' Digital Receipt Engine, and 7-Day Challenge.",
    deliverables: [
      "Interactive Mood Selection Matrix (/mood)",
      "'What Won Today?' Digital Accountability Receipt Generator",
      "7-Day Mindset Challenge Modal & Lead Opt-in Form",
    ],
    description: "Interactive Mood Selector (/mood), 'What Won Today?' Digital Receipt generator, 7-Day Challenge modal",
    hours: 32,
    rate: 85,
    baseAmount: 3200,
  },
  {
    id: "sprint3",
    name: "Sprint 3: Admin Command Suite & Content Factory Engine",
    duration: "1 Week",
    dates: "Date TBD (1-Week Cadence)",
    summary: "Deploy gated Admin Command Portal, Content Factory automated publishing engine, QA testing matrix, and email automation.",
    deliverables: [
      "Gated Admin Command Portal with Multi-Role Access & Account Activation Matrix",
      "Content Factory Engine for daily social post creation, reels, and video prompts",
      "Vitest Unit Test & Playwright E2E QA Testing Portal Matrix",
      "Klaviyo / Resend Transactional & Marketing Email Templates",
    ],
    description: "Task List board, QA Testing Matrix, User RBAC & Activation, Content Factory automated post generator, Klaviyo/Resend email templates",
    hours: 30,
    rate: 85,
    baseAmount: 3000,
  },
  {
    id: "sprint4",
    name: "Sprint 4: Hard Launch, Growth Execution & Conversion Scaling",
    duration: "1 Week",
    dates: "Date TBD (1-Week Cadence)",
    summary: "Finalize Cloudflare Pages production deployment, scale paid ad campaigns, and execute live customer onboarding.",
    deliverables: [
      "Cloudflare Pages Production Deployment & SSL binding",
      "Meta & TikTok Paid Ad Campaign Launch & Conversion Tracking",
      "Live Customer Onboarding & Retainer Hand-off",
    ],
    description: "Cloudflare Pages production deployment, active ad campaign scaling, live customer onboarding",
    hours: 18,
    rate: 85,
    baseAmount: 2400,
  },
  {
    id: "maint-website",
    name: "Website & Platform Ongoing Maintenance Retainer",
    duration: "Monthly Ongoing",
    dates: "Post-Launch Retainer",
    summary: "24/7 Platform monitoring, security patches, backups, uptime assurance, and performance optimization.",
    deliverables: [
      "24/7 Server & Domain Uptime Monitoring",
      "Weekly Security Patches, SSL Renewal & Database Backups",
      "Bug Fixes & Speed Performance Optimization",
    ],
    description: "24/7 Uptime monitoring, domain & SSL management, security updates, database backups, bug fixes & performance optimization",
    hours: 0,
    rate: 0,
    baseAmount: 1200,
  },
  {
    id: "maint-socials",
    name: "Social Media Management & Content Factory Operations Retainer",
    duration: "Monthly Ongoing",
    dates: "Post-Launch Retainer",
    summary: "Daily Content Factory social posting across TikTok, Facebook, and YouTube, community management, and ad audience optimization.",
    deliverables: [
      "Daily Content Factory Social Posts across TikTok, Facebook & YouTube",
      "Community Engagement & Inbox Management",
      "Monthly Analytics Reporting & Ad Audience Optimization",
    ],
    description: "Daily Content Factory posting across TikTok, Facebook, and YouTube, community engagement management, ad audience optimization & monthly analytics reporting",
    hours: 0,
    rate: 0,
    baseAmount: 1800,
  },
  {
    id: "arch",
    name: "System Architecture & Cloud Setup",
    duration: "Included",
    dates: "Sprint 0-1",
    summary: "Core cloud infra setup.",
    deliverables: ["Cloudflare DNS, SSL edge, Supabase DB design, Stripe payment binding"],
    description: "Cloudflare DNS, SSL edge, Supabase DB design, Stripe payment binding, POD API setup",
    hours: 0,
    rate: 0,
    baseAmount: 1500,
  },
  {
    id: "design",
    name: "UI/UX Design & Brand Asset Creation",
    duration: "Included",
    dates: "Sprint 0-1",
    summary: "Visual design system.",
    deliverables: ["E-commerce design system, logo processing, product mockups, email styling"],
    description: "E-commerce design system, logo processing, product mockups, email template styling",
    hours: 0,
    rate: 0,
    baseAmount: 1200,
  },
];

const DEFAULT_PROPOSAL_TEXT = `MY PLAN, NOT MY MOOD is a premium lifestyle, apparel, personal accountability, and digital productivity brand founded by ${CLIENT_DISPLAY_NAME}, powered by Muntie Ev's AI Studio (muntiesaiagents.com). The brand is built on a foundational human truth: 'Do not let a temporary mood determine a permanent outcome. Feel it. Follow the Plan anyway.'

The idea for MY PLAN, NOT MY MOOD came to Angela Harris through her niece. Watching someone she loves almost let a temporary feeling decide a lasting outcome, Angela named what she has been teaching for years as an empowerment speaker and author: the mood gets a vote, but the plan gets the final decision. That family moment became the brand — feel it, follow the plan anyway.`;

interface ProposalPageProps {
  onBackToStore: () => void;
}

export const ProposalPage: React.FC<ProposalPageProps> = ({ onBackToStore }) => {
  const [lineItems, setLineItems] = useState<SprintLineItem[]>(DEFAULT_LINE_ITEMS);
  const [selectedDiscountTier, setSelectedDiscountTier] = useState<number>(15);
  const [proposalNotes, setProposalNotes] = useState<string>(DEFAULT_PROPOSAL_TEXT);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const totalBasePrice = lineItems
    .filter((item) => item.visible !== false)
    .reduce((sum, item) => sum + item.baseAmount, 0);

  const handleAmountChange = (id: string, newAmount: number) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, baseAmount: Math.max(0, newAmount) } : item))
    );
  };

  const handleToggleVisibility = (id: string) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, visible: item.visible === false ? true : false } : item))
    );
  };

  const getDiscountedTotal = (discountPercent: number) => {
    return totalBasePrice * (1 - discountPercent / 100);
  };

  const formatUsd = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportDocx = () => {
    handleSave();
    const cleanNotes = proposalNotes
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&mdash;/g, '—')
      .replace(/&rarr;/g, '->');

    const discountedPrice = getDiscountedTotal(selectedDiscountTier);

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>MY PLAN, NOT MY MOOD - Master Implementation Proposal</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c2541; line-height: 1.6; padding: 30px; }
          h1 { color: #0b132b; font-size: 24px; margin-bottom: 4px; border-bottom: 2px solid #81b29a; padding-bottom: 8px; }
          h2 { color: #0b132b; font-size: 18px; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #81b29a; padding-left: 10px; }
          .subtitle { color: #81b29a; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
          .badge { background: #fee2e2; color: #dc2626; padding: 4px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 20px; }
          th { background-color: #0b132b; color: #ffffff; text-align: left; padding: 10px; font-size: 12px; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .total-box { background: #f0fdf4; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="badge">CONFIDENTIAL & PROPRIETARY EXECUTIVE DELIVERABLE</div>
        <h1>MY PLAN, NOT MY MOOD — Master Implementation Proposal</h1>
        <div class="subtitle">Prepared for ${CLIENT_DISPLAY_NAME}</div>
        <p><strong>${CLIENT_ROLE}:</strong> ${CLIENT_NAME} &nbsp;·&nbsp; <strong>Email:</strong> ${CLIENT_EMAIL}</p>

        <h2>1. Executive Summary & Brand Thesis</h2>
        <p>${cleanNotes}</p>

        <h2>2. Implementation Agile Sprint Breakdown & Pricing Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Sprint / Component</th>
              <th>Description & Scope</th>
              <th style="text-align: right;">Base Investment</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems
              .map(
                (item) => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.description}</td>
                <td style="text-align: right; font-weight: bold;">$${item.baseAmount.toLocaleString()}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>

        <div class="total-box">
          <p style="margin:0; font-size:14px;"><strong>Total Base Buildout Investment:</strong> $${totalBasePrice.toLocaleString()}</p>
          <p style="margin:4px 0 0 0; font-size:14px; color:#059669;"><strong>Selected Pre-Payment Tier (${selectedDiscountTier}% Off):</strong> $${discountedPrice.toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'implementation_plan_muntie_ev.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    handleSave();
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1917] p-4 sm:p-8 space-y-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E5DFD3] shadow-sm">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-sm font-bold text-[#1F1917] hover:text-[#C2410C] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://muntiesaiagents.com/MyPlan"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              title="Launch Live Staging on Muntie Ev's AI Studio Domain"
            >
              <ExternalLink className="w-3.5 h-3.5" /> muntiesaiagents.com/MyPlan
            </a>
            <a
              href="https://nonnegotiation.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[#C2410C] bg-[#FFEDD5] hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-[#C2410C]/30 flex items-center gap-1.5 transition-all"
              title="Canonical Live Production Domain"
            >
              <ExternalLink className="w-3.5 h-3.5" /> nonnegotiation.com
            </a>
          </div>
        </div>

        {/* Confidentiality & Logo Header Card */}
        <div className="bg-white rounded-2xl p-6 border-2 border-red-500/30 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/munties_ai_agents_logo.png"
                alt="Muntie Ev's AI AGENTS Logo"
                className="h-12 w-auto rounded-lg shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-3 h-3" /> CONFIDENTIAL & PROPRIETARY
                  </span>
                  <span className="text-xs text-slate-500">Trade Secret Disclosure</span>
                </div>
                <h1 className="text-2xl font-black text-[#1F1917] tracking-tight mt-1">
                  MY PLAN, NOT MY MOOD — Master Implementation Proposal
                </h1>
                <p className="text-xs text-slate-500">
                  Prepared for <strong>{CLIENT_DISPLAY_NAME}</strong> · {CLIENT_ROLE} · {CLIENT_EMAIL}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportDocx}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Save & Export Word (.docx)
              </button>
              <button
                onClick={handleExportPdf}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Save & Print PDF (.pdf)
              </button>
            </div>
          </div>
        </div>

        {/* TOP PRE-PAYMENT DISCOUNT SELECTOR BANNER */}
        <div className="bg-white rounded-2xl p-6 border-2 border-amber-500/40 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DFD3] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#C2410C]" />
                <h2 className="text-xl font-black text-[#1F1917]">Select Pre-Payment Discount Incentive Tier</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Toggle between <strong>10%</strong>, <strong>15%</strong>, and <strong>25%</strong> pre-payment discount tiers to dynamically update all payment schedule options and savings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-[#FAF8F5] p-2 rounded-xl border border-[#E5DFD3]">
              {[0, 10, 15, 25].map((discount) => (
                <button
                  key={discount}
                  onClick={() => setSelectedDiscountTier(discount)}
                  className={`px-4 py-2 rounded-lg font-extrabold text-xs transition-all cursor-pointer ${
                    selectedDiscountTier === discount
                      ? 'bg-[#C2410C] text-white shadow-md scale-105'
                      : 'bg-white text-slate-700 hover:bg-orange-50 border border-[#E5DFD3]'
                  }`}
                >
                  {discount === 0 ? '0% Standard' : `${discount}% OFF`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD3]">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Base Buildout</span>
              <div className="text-lg font-black text-[#1F1917]">{formatUsd(totalBasePrice)}</div>
            </div>
            <div className="bg-orange-50/80 p-3 rounded-xl border border-[#C2410C]/30">
              <span className="text-[11px] font-mono font-bold uppercase text-[#C2410C]">Active Selected Discount</span>
              <div className="text-lg font-black text-[#C2410C]">{selectedDiscountTier}% OFF TIER</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-500/30">
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-700">Net Investment after Savings</span>
              <div className="text-lg font-black text-emerald-700">
                {formatUsd(getDiscountedTotal(selectedDiscountTier))}
                <span className="text-xs font-normal text-emerald-600 ml-1.5">(Save {formatUsd(totalBasePrice * (selectedDiscountTier / 100))})</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT SCHEDULE OPTIONS MATRIX CARDS (MOVED TO TOP) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5DFD3] shadow-sm space-y-6">
          <div className="space-y-1 border-b border-[#E5DFD3] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C2410C]" />
              <h2 className="text-xl font-black text-[#1F1917]">Payment Schedule Options ({selectedDiscountTier}% Selected Discount)</h2>
            </div>
            <p className="text-xs text-slate-500">
              Numbers below dynamically reflect your selected <strong>{selectedDiscountTier}%</strong> discount. Select any card to customize terms.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Option 1: Standard 0% */}
            <div
              onClick={() => setSelectedDiscountTier(0)}
              className={`cursor-pointer rounded-xl border p-5 space-y-3 transition-all ${
                selectedDiscountTier === 0
                  ? 'border-[#C2410C] bg-orange-50/60 ring-2 ring-[#C2410C]/20 shadow-md'
                  : 'border-[#E5DFD3] bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Standard</span>
                <span className="text-xs font-bold text-slate-400">0% OFF</span>
              </div>
              <h3 className="font-bold text-base text-[#1F1917]">1/3 Split Schedule</h3>
              <div className="text-xl font-black text-[#C2410C] tabular-nums">{formatUsd(totalBasePrice)}</div>
              <div className="text-xs space-y-1 pt-2 border-t border-[#E5DFD3] text-slate-600">
                <div>• 1/3 Down: {formatUsd(totalBasePrice / 3)}</div>
                <div>• 1/3 Sprint 3: {formatUsd(totalBasePrice / 3)}</div>
                <div>• 1/3 Launch: {formatUsd(totalBasePrice / 3)}</div>
                <div className="text-slate-400">• Savings: $0.00</div>
              </div>
            </div>

            {/* Option 2: Milestone 10% */}
            <div
              onClick={() => setSelectedDiscountTier(10)}
              className={`cursor-pointer rounded-xl border p-5 space-y-3 transition-all ${
                selectedDiscountTier === 10
                  ? 'border-[#C2410C] bg-orange-50/60 ring-2 ring-[#C2410C]/20 shadow-md'
                  : 'border-[#E5DFD3] bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Milestone</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">10% OFF</span>
              </div>
              <h3 className="font-bold text-base text-[#1F1917]">10% Milestone Plan</h3>
              <div className="text-xl font-black text-[#C2410C] tabular-nums">{formatUsd(getDiscountedTotal(10))}</div>
              <div className="text-xs space-y-1 pt-2 border-t border-[#E5DFD3] text-slate-600">
                <div>• 1/3 Down: {formatUsd(getDiscountedTotal(10) / 3)}</div>
                <div>• 40% Sprint 3: {formatUsd(getDiscountedTotal(10) * 0.4)}</div>
                <div>• 26.7% Launch: {formatUsd(getDiscountedTotal(10) * 0.2667)}</div>
                <div className="text-emerald-700 font-bold">• You Save: {formatUsd(totalBasePrice * 0.1)}</div>
              </div>
            </div>

            {/* Option 3: 15% Discount */}
            <div
              onClick={() => setSelectedDiscountTier(15)}
              className={`cursor-pointer rounded-xl border p-5 space-y-3 transition-all ${
                selectedDiscountTier === 15
                  ? 'border-[#C2410C] bg-orange-50/60 ring-2 ring-[#C2410C]/20 shadow-md'
                  : 'border-[#E5DFD3] bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">50/50 Split</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">15% OFF</span>
              </div>
              <h3 className="font-bold text-base text-[#1F1917]">15% Split Plan</h3>
              <div className="text-xl font-black text-[#C2410C] tabular-nums">{formatUsd(getDiscountedTotal(15))}</div>
              <div className="text-xs space-y-1 pt-2 border-t border-[#E5DFD3] text-slate-600">
                <div>• 50% Down: {formatUsd(getDiscountedTotal(15) / 2)}</div>
                <div>• 50% Launch: {formatUsd(getDiscountedTotal(15) / 2)}</div>
                <div className="text-emerald-700 font-bold">• You Save: {formatUsd(totalBasePrice * 0.15)}</div>
              </div>
            </div>

            {/* Option 4: 25% Upfront */}
            <div
              onClick={() => setSelectedDiscountTier(25)}
              className={`cursor-pointer rounded-xl border p-5 space-y-3 transition-all relative overflow-hidden ${
                selectedDiscountTier === 25
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/30 shadow-md'
                  : 'border-[#E5DFD3] bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Executive</span>
                <span className="text-xs font-bold text-white bg-emerald-600 px-2 py-0.5 rounded">25% OFF</span>
              </div>
              <h3 className="font-bold text-base text-[#1F1917]">25% Upfront Plan</h3>
              <div className="text-xl font-black text-emerald-700 tabular-nums">{formatUsd(getDiscountedTotal(25))}</div>
              <div className="text-xs space-y-1 pt-2 border-t border-[#E5DFD3] text-slate-600">
                <div>• 100% Paid Upfront</div>
                <div className="text-emerald-700 font-bold">• Maximum Savings: {formatUsd(totalBasePrice * 0.25)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inline Word-Type Rich Text Editor */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5DFD3] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#C2410C]" />
              <h2 className="text-lg font-black text-[#1F1917]">Inline Word-Type Proposal & Executive Summary Editor</h2>
            </div>
            <span className="text-xs font-mono font-bold bg-[#FFEDD5] text-[#C2410C] px-2.5 py-1 rounded-md">
              Live Word & PDF Editor Sync
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Edit executive proposal notes inline below. Clicking export will immediately download customized Microsoft Word (.docx) and PDF (.pdf) documents.
          </p>

          <textarea
            value={proposalNotes}
            onChange={(e) => setProposalNotes(e.target.value)}
            rows={5}
            className="w-full p-4 rounded-xl border border-[#E5DFD3] font-sans text-sm text-[#1F1917] focus:ring-2 focus:ring-[#C2410C] focus:border-transparent outline-none transition-all shadow-inner"
            placeholder="Type proposal executive summary notes here..."
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleExportDocx}
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              {isSaved ? 'Saved & Exported Word!' : 'Save & Export Word (.docx)'}
            </button>
          </div>
        </div>

        {/* Phase-by-Phase Line Item Calculator */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5DFD3] shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DFD3] pb-4">
            <div>
              <h2 className="text-xl font-black text-[#1F1917] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#C2410C]" /> Sprint-by-Sprint Line Item Investment
              </h2>
              <p className="text-xs text-slate-500">
                Adjust individual sprint line items to recalculate total base investment & payment schedules in real time.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase text-slate-400 font-mono font-bold tracking-wider">
                Turnkey Base Build Cost
              </span>
              <div className="text-2xl font-black text-[#C2410C] tabular-nums">
                TBD
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {lineItems.map((item) => (
              <div
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  item.visible === false
                    ? 'bg-gray-100/70 border-gray-300 opacity-60'
                    : 'border-[#E5DFD3] bg-[#FAF8F5] hover:bg-orange-50/40'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-[280px]">
                  <div className="font-bold text-sm text-[#1F1917] flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVisibility(item.id)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black uppercase flex items-center gap-1 cursor-pointer transition-all border ${
                        item.visible === false
                          ? 'bg-gray-200 text-gray-600 border-gray-400 hover:bg-gray-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                      }`}
                      title={item.visible === false ? "Click to Show line item" : "Click to Hide line item"}
                    >
                      {item.visible === false ? <EyeOff className="w-3.5 h-3.5 text-gray-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-700" />}
                      {item.visible === false ? 'Hidden' : 'Shown'}
                    </button>
                    <span className={item.visible === false ? 'line-through text-gray-500' : ''}>
                      {item.name}
                    </span>
                    {item.hours > 0 && (
                      <span className="text-[10px] font-mono font-semibold bg-white border border-[#E5DFD3] px-2 py-0.5 rounded text-slate-600">
                        ~{item.hours} hrs @ ${item.rate}/hr
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>

                <div className="w-36">
                  <input
                    type="number"
                    value={item.baseAmount}
                    onChange={(e) => handleAmountChange(item.id, parseFloat(e.target.value) || 0)}
                    disabled={item.visible === false}
                    className="w-full text-right font-mono text-sm font-bold p-2 bg-white rounded-lg border border-[#E5DFD3] focus:ring-2 focus:ring-[#C2410C] outline-none disabled:bg-gray-200 disabled:text-gray-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
