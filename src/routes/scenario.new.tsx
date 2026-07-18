import { createFileRoute } from "@tanstack/react-router";
import { EducationalIntakeForm } from "@/components/EducationalIntakeForm";
import { ScenarioNewHowItWorks } from "@/components/ScenarioNewHowItWorks";
import { BenchmarkIdLookupForm } from "@/components/BenchmarkIdLookupForm";
import {
  PreviousBenchmarksOnDeviceLink,
  PreviousBenchmarksOnDevicePanel,
} from "@/components/PreviousBenchmarkScenarios";
import { AppShell } from "@/components/AppShell";
import { BENCHMARK_TOOL_NAME } from "@/lib/plan-comparison-copy";

export const Route = createFileRoute("/scenario/new")({
  head: () => ({
    meta: [
      { title: `${BENCHMARK_TOOL_NAME} — Get Started` },
      {
        name: "description",
        content:
          "Answer a few benchmark questions about your Medicare needs and connect with a licensed professional when you are ready.",
      },
      { property: "og:title", content: `${BENCHMARK_TOOL_NAME} — Get Started` },
      {
        property: "og:description",
        content:
          "Multi-step Part B benchmark intake to explore Medicare options and authorize partner contact on your terms.",
      },
      { property: "og:url", content: "https://mypartb.com/scenario/new" },
    ],
    links: [{ rel: "canonical", href: "https://mypartb.com/scenario/new" }],
  }),
  component: ScenarioNew,
});

function ScenarioNew() {
  return (
    <AppShell
      title={BENCHMARK_TOOL_NAME}
      subtitle="Answer a few questions to benchmark your options. Partner contact happens only when you authorize it after submitting."
    >
      <ScenarioNewHowItWorks className="max-w-3xl mx-auto mb-3" />

      <div className="max-w-3xl mx-auto mb-3 flex justify-center">
        <PreviousBenchmarksOnDeviceLink />
      </div>

      <EducationalIntakeForm />
      <BenchmarkIdLookupForm className="max-w-3xl mx-auto mt-8" />

      <PreviousBenchmarksOnDevicePanel className="max-w-3xl mx-auto mt-4" />
    </AppShell>
  );
}
