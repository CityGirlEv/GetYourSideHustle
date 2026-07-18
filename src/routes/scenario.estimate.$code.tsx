import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BenchmarkReportZipLine,
  EducationalBenchmarkReportView,
} from "@/components/EducationalBenchmarkReport";
import { ExpertOptInDialog } from "@/components/ExpertOptInDialog";
import { loadBenchmarkEstimate } from "@/lib/benchmark-estimate-storage";
import type { FinalizedBenchmark } from "@/lib/benchmark-intake";
import {
  benchmarkOptInSessionKeys,
  shouldAutoOpenBenchmarkExpertOptIn,
} from "@/lib/benchmark-optin-trigger";
import {
  BENCHMARK_REPORT_PAGE_SUBTITLE,
  BENCHMARK_TOOL_CTA,
  BENCHMARK_TOOL_ID_LABEL,
} from "@/lib/plan-comparison-copy";

export const Route = createFileRoute("/scenario/estimate/$code")({
  head: () => ({
    meta: [
      { title: `${BENCHMARK_REPORT_PAGE_SUBTITLE} — mypartb.com` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BenchmarkEstimateReport,
});

function BenchmarkEstimateReport() {
  const { code } = Route.useParams();
  const [benchmark, setBenchmark] = useState<FinalizedBenchmark | null>(null);
  const [ready, setReady] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [optInOpen, setOptInOpen] = useState(false);

  const scenarioSnapshot = useMemo(() => {
    if (!benchmark) return undefined;
    return {
      ...benchmark.intakeSnapshot,
      benchmark_report: benchmark.report,
      kind: "part_b_benchmark_tool",
    };
  }, [benchmark]);

  const handleOptInOpenChange = useCallback(
    (open: boolean) => {
      setOptInOpen(open);
      if (open) {
        const { justCreated: justCreatedKey, shown: shownKey } = benchmarkOptInSessionKeys(code);
        sessionStorage.setItem(shownKey, "1");
        sessionStorage.removeItem(justCreatedKey);
      }
    },
    [code],
  );

  useEffect(() => {
    setReady(false);
    setBenchmark(loadBenchmarkEstimate(code));

    const { justCreated: justCreatedKey } = benchmarkOptInSessionKeys(code);
    setJustCreated(sessionStorage.getItem(justCreatedKey) === "1");
    setReady(true);
  }, [code]);

  useEffect(() => {
    if (!ready || !benchmark) return;

    const { justCreated: justCreatedKey, shown: shownKey } = benchmarkOptInSessionKeys(code);
    const shouldOpen = shouldAutoOpenBenchmarkExpertOptIn({
      justCreated,
      benchmarkJustCreatedFlag: sessionStorage.getItem(justCreatedKey),
      expertOptInShown: sessionStorage.getItem(shownKey),
    });
    if (!shouldOpen) {
      if (sessionStorage.getItem(shownKey)) {
        sessionStorage.removeItem(justCreatedKey);
      }
      return;
    }

    const timer = window.setTimeout(() => handleOptInOpenChange(true), 800);
    return () => window.clearTimeout(timer);
  }, [code, justCreated, benchmark, ready, handleOptInOpenChange]);

  const title = BENCHMARK_REPORT_PAGE_SUBTITLE;
  const subtitle = (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
      <span>{BENCHMARK_TOOL_ID_LABEL}</span>
      <code className="rounded border border-primary/30 bg-background px-1.5 py-0.5 font-mono text-xs text-foreground select-all">
        {code}
      </code>
    </span>
  );

  let body: React.ReactNode;
  if (!ready) {
    body = <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>;
  } else if (!benchmark) {
    body = (
      <Card className="glass p-8 max-w-lg mx-auto text-center space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          We could not find a saved benchmark for this {BENCHMARK_TOOL_ID_LABEL} on this device.
          Benchmark reports are stored locally in your browser — open the link on the same device
          where you created it, or run the tool again.
        </p>
        <p className="font-mono text-sm text-primary break-all">{code}</p>
        <Link to="/scenario/new">
          <Button className="w-full">{BENCHMARK_TOOL_CTA}</Button>
        </Link>
      </Card>
    );
  } else {
    body = (
      <EducationalBenchmarkReportView
        estimateId={benchmark.estimateId}
        report={benchmark.report}
        benchmark={benchmark}
        showActions
        justCreated={justCreated}
        onBenchmarkUpdate={setBenchmark}
      />
    );
  }

  return (
    <>
      <AppShell
        title={title}
        subtitle={subtitle}
        subtitleFooter={benchmark ? <BenchmarkReportZipLine report={benchmark.report} /> : undefined}
      >
        {body}
      </AppShell>
      <ExpertOptInDialog
        open={optInOpen}
        onOpenChange={handleOptInOpenChange}
        scenarioCode={code}
        scenarioSnapshot={scenarioSnapshot}
      />
    </>
  );
}
