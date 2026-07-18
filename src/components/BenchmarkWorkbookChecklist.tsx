import { WorkbookChecklistForm } from "@/components/WorkbookChecklistForm";

import type { Medication } from "@/lib/medicare-math";

type BenchmarkWorkbookChecklistProps = {
  scenarioCode?: string | null;
  /** Pre-fill prescription rows from completed benchmark intake for this scenario. */
  seedFromIntake?: boolean;
  medicationNames?: string[];
  medicationDetails?: Medication[];
};

export function BenchmarkWorkbookChecklist({
  scenarioCode = null,
  seedFromIntake = false,
  medicationNames = [],
  medicationDetails = [],
}: BenchmarkWorkbookChecklistProps) {
  return (
    <WorkbookChecklistForm
      compact
      downloadAtBottom
      showWorkbookPageLink
      scenarioCode={scenarioCode}
      seedFromIntake={seedFromIntake}
      medicationNames={medicationNames}
      medicationDetails={medicationDetails}
    />
  );
}
