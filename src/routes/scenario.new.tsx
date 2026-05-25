import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { IntakeWizard } from "@/components/IntakeWizard";
import { VoiceIntakeWizard } from "@/components/VoiceIntakeWizard";
import { AppShell } from "@/components/AppShell";
import { Mic, Keyboard } from "lucide-react";

export const Route = createFileRoute("/scenario/new")({
  head: () => ({
    meta: [
      { title: "Build a Medicare Scenario — No Personal Info Required" },
      { name: "description", content: "Build a de-identified Medicare scenario. We never collect your name, address, phone, or full date of birth." },
    ],
  }),
  component: ScenarioNew,
});

function ScenarioNew() {
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "voice">("manual");
  return (
    <AppShell title="Build your scenario" subtitle="You'll get a Scenario ID at the end — share it with the agent of your choice.">
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition ${mode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Keyboard className="h-3.5 w-3.5" /> Manual form
          </button>
          <button
            type="button"
            onClick={() => setMode("voice")}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition ${mode === "voice" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Mic className="h-3.5 w-3.5" /> Voice wizard
          </button>
        </div>
      </div>

      {mode === "manual" ? (
        <IntakeWizard onDone={(code) => router.navigate({ to: "/scenario/created/$code", params: { code } })} />
      ) : (
        <VoiceIntakeWizard
          onDone={(code) => router.navigate({ to: "/scenario/created/$code", params: { code } })}
          onSwitchToManual={() => setMode("manual")}
        />
      )}
    </AppShell>
  );
}
