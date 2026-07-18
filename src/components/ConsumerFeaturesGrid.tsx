import {
  BookOpen,
  FileBarChart,
  FileSpreadsheet,
  GitCompare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { CONSUMER_PRODUCT_FEATURES } from "@/lib/product-features";

const FEATURE_ICONS: Record<string, LucideIcon> = {
  "benchmark-tool": FileBarChart,
  "benchmark-report": FileBarChart,
  "plan-comparison": GitCompare,
  workbook: BookOpen,
  exports: FileSpreadsheet,
  privacy: ShieldCheck,
};

export function ConsumerFeaturesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CONSUMER_PRODUCT_FEATURES.map((feature) => {
        const Icon = FEATURE_ICONS[feature.id] ?? FileBarChart;
        return (
          <Card key={feature.id} className="glass p-5 space-y-2 border-border/60">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <h3 className="font-display text-base font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
