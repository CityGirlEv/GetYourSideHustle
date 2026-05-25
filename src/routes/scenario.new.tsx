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
    <div className="min-h-screen flex flex-col">
      <SecurityBanner />
      <main className="flex-1 px-4 md:px-8 py-8 max-w-5xl w-full mx-auto">
        <div className="relative mb-6 bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <img src={muntieLogo} alt="The Medicare Optimizer" className="h-16 w-16 object-contain" />
          </div>
          <div className="text-center px-28">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald leading-tight">Build your scenario</h1>
            <p className="text-xs md:text-sm italic text-emerald font-semibold mt-1">You'll get a Scenario ID at the end — share it with the agent of your choice.</p>
          </div>
        </div>

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
      </main>
      <CMSFooter />
    </div>
  );
}
