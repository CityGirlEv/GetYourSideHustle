import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, ExternalLink, Building2, ShieldCheck, Pill, Activity } from "lucide-react";
import {
  CMS_CATALOG,
  type CarrierRow,
  type MedigapPlanRow,
  type AdvantageTypeRow,
} from "@/data/cms-catalog";

function Disclosure({
  title,
  subtitle,
  badge,
  defaultOpen,
  children,
  depth = 0,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  depth?: number;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const pad = depth === 0 ? "pl-3" : depth === 1 ? "pl-6" : "pl-9";
  return (
    <div className={`border-l-2 ${depth === 0 ? "border-primary/40" : depth === 1 ? "border-primary/20" : "border-border"} ${pad}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 py-2 text-left hover:bg-secondary/40 rounded-md px-2 -ml-2"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className="font-medium text-sm">{title}</span>
        {badge && <Badge variant="outline" className="text-[10px]">{badge}</Badge>}
        {subtitle && <span className="text-xs text-muted-foreground truncate ml-1">{subtitle}</span>}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

function CarrierCard({ c }: { c: CarrierRow }) {
  const url = c["Carrier Portal"];
  const isReal = !!url && /^https?:\/\//i.test(url);
  return (
    <div className="rounded-md border border-border bg-card/60 px-3 py-2 my-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            {c["Carrier Name"]}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{c["Key Characteristics"]}</div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <Badge variant="secondary" className="text-[10px]">{c["Market Share Tier"]}</Badge>
            <Badge variant="outline" className="text-[10px]">{c["A.M. Best Rating"]}</Badge>
            <Badge variant="outline" className="text-[10px]">{c["National Footprint"]}</Badge>
          </div>
        </div>
        {isReal ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 flex-shrink-0"
          >
            Portal <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">No portal link</span>
        )}
      </div>
    </div>
  );
}

function MedigapPlanDetail({ p }: { p: MedigapPlanRow }) {
  const benefits: [string, string][] = [
    ["Part A coinsurance", p["Part A Coinsurance"]],
    ["Part B coinsurance", p["Part B Coinsurance"]],
    ["Blood (first 3 pints)", p["Blood (First 3 Pints)"]],
    ["Part A hospice coinsurance", p["Part A Hospice Coinsurance"]],
    ["Skilled nursing coinsurance", p["Skilled Nursing Coinsurance"]],
    ["Part A deductible", p["Part A Deductible"]],
    ["Part B deductible", p["Part B Deductible"]],
    ["Part B excess charges", p["Part B Excess Charges"]],
    ["Foreign travel emergency", p["Foreign Travel Emergency"]],
  ];
  return (
    <div className="px-2 py-1.5 space-y-2">
      <p className="text-xs text-muted-foreground">{p["General Summary"]}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
        {benefits.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 border border-border/60 rounded px-2 py-1">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium text-right">{v}</span>
          </div>
        ))}
      </div>
      <Disclosure title="Carriers offering this letter" depth={2} badge={`${CMS_CATALOG.medigapCarriers.length}`}>
        {CMS_CATALOG.medigapCarriers.map((c) => <CarrierCard key={c["Carrier Name"]} c={c} />)}
      </Disclosure>
    </div>
  );
}

function AdvantageTypeDetail({ t }: { t: AdvantageTypeRow }) {
  return (
    <div className="px-2 py-1.5 space-y-2">
      <div className="text-xs"><span className="text-muted-foreground">Full name: </span>{t["Full Name"]}</div>
      <p className="text-xs text-muted-foreground">{t.Description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div className="border border-emerald/30 bg-emerald/5 rounded px-2 py-1.5">
          <div className="font-semibold text-emerald mb-0.5">Pros</div>
          <div className="text-muted-foreground">{t["Pros / Advantages"]}</div>
        </div>
        <div className="border border-destructive/30 bg-destructive/5 rounded px-2 py-1.5">
          <div className="font-semibold text-destructive mb-0.5">Trade-offs</div>
          <div className="text-muted-foreground">{t["Cons / Trade-offs"]}</div>
        </div>
      </div>
      <Disclosure title="Carriers offering this plan type" depth={2} badge={`${CMS_CATALOG.advantageCarriers.length}`}>
        {CMS_CATALOG.advantageCarriers.map((c) => <CarrierCard key={c["Carrier Name"]} c={c} />)}
      </Disclosure>
    </div>
  );
}

export function CatalogExplorer() {
  return (
    <Card className="glass p-5 space-y-4">
      <div>
        <h3 className="font-display font-bold flex items-center gap-2">
          <Pill className="h-5 w-5" />
          CMS-approved plan catalog ({CMS_CATALOG.year})
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drill down: Pathway → Plan type / letter → Benefit detail → Carriers + portal links.
        </p>
      </div>

      <Disclosure
        title="Pathway A — Original Medicare + Medigap"
        subtitle={`${CMS_CATALOG.medigapPlans.length} standardized letters · ${CMS_CATALOG.medigapCarriers.length} carriers`}
        defaultOpen
        depth={0}
      >
        <div className="flex items-center gap-1 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Standardized federal benefits — same coverage from any carrier.
        </div>
        {CMS_CATALOG.medigapPlans.map((p) => (
          <Disclosure
            key={p["Plan Letter"]}
            title={p["Plan Letter"]}
            badge={p["Enrollment Status"]}
            depth={1}
          >
            <MedigapPlanDetail p={p} />
          </Disclosure>
        ))}
      </Disclosure>

      <Disclosure
        title="Pathway B — Medicare Advantage (Part C)"
        subtitle={`${CMS_CATALOG.advantageTypes.length} plan types · ${CMS_CATALOG.advantageCarriers.length} carriers`}
        depth={0}
      >
        <div className="flex items-center gap-1 py-1 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> Bundled Part A/B/D with carrier networks and extra benefits.
        </div>
        {CMS_CATALOG.advantageTypes.map((t) => (
          <Disclosure
            key={t["Plan Type"]}
            title={t["Plan Type"]}
            subtitle={t["Full Name"]}
            badge={t["Enrollment Status"]}
            depth={1}
          >
            <AdvantageTypeDetail t={t} />
          </Disclosure>
        ))}
      </Disclosure>

      <Disclosure
        title="Standalone Part D (PDP)"
        subtitle={`${CMS_CATALOG.partDPlans.length} tiers · ${CMS_CATALOG.partDCarriers.length} carriers`}
        depth={0}
      >
        <div className="flex items-center gap-1 py-1 text-xs text-muted-foreground">
          <Pill className="h-3.5 w-3.5" /> Standalone prescription drug plans paired with Pathway A.
        </div>
        {CMS_CATALOG.partDPlans.map((t, i) => {
          const tier = String(t["Plan Tier"] ?? t["Tier"] ?? `Tier ${i + 1}`);
          return (
            <Disclosure key={tier + i} title={tier} depth={1}>
              <div className="px-2 py-1.5 space-y-1 text-xs">
                {Object.entries(t).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border border-border/60 rounded px-2 py-1">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-right">{String(v)}</span>
                  </div>
                ))}
              </div>
            </Disclosure>
          );
        })}
        <Disclosure title="Part D carriers" depth={1} badge={`${CMS_CATALOG.partDCarriers.length}`}>
          <div className="px-2">
            {CMS_CATALOG.partDCarriers.map((c) => <CarrierCard key={c["Carrier Name"]} c={c} />)}
          </div>
        </Disclosure>
      </Disclosure>
    </Card>
  );
}