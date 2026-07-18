import { BenchmarkReportBackToTopLink } from "@/components/BenchmarkReportBackToTopLink";
import { PreviousScenariosSection } from "@/components/PreviousBenchmarkScenarios";
import { useBenchmarkEstimateHistory } from "@/hooks/use-benchmark-estimate-history";
import { useApp } from "@/lib/app-store";
import type { BenchmarkPreviousScenariosSectionId } from "@/lib/benchmark-report-ui";

/** Previous scenarios list (when any) + back-to-top link — bottom of each report tab card. */
export function BenchmarkReportTabFooter({
  section,
  currentEstimateId,
}: {
  section: BenchmarkPreviousScenariosSectionId;
  currentEstimateId?: string;
}) {
  const { user } = useApp();
  const history = useBenchmarkEstimateHistory(currentEstimateId, user);
  const hasPreviousScenarios = history.device.length > 0 || history.all.length > 0;

  return (
    <>
      {hasPreviousScenarios ? (
        <PreviousScenariosSection section={section} currentEstimateId={currentEstimateId} />
      ) : null}
      <div className="flex justify-end border-t border-border/40 px-5 py-2">
        <BenchmarkReportBackToTopLink />
      </div>
    </>
  );
}
