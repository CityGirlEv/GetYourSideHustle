import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { IntakeWizard } from "@/components/IntakeWizard";
import { VoiceIntakeWizard } from "@/components/VoiceIntakeWizard";
import { AppShell } from "@/components/AppShell";
import { Mic, Keyboard, Clock } from "lucide-react";
import { listScenarioHistory, type ScenarioHistoryEntry } from "@/lib/scenario-history";
import { VOICE_WIZARD_ENABLED } from "@/lib/feature-flags";

export const Route = createFileRoute("/scenario/new")({
  head: () => ({
    meta: [
      { title: "Build a Medicare Scenario — No Personal Info Required" },
      {
        name: "description",
        content:
          "Build a de-identified Medicare scenario. We never collect your name, address, phone, or date of birth.",
      },
      { property: "og:title", content: "Build a Medicare Scenario — No Personal Info Required" },
      {
        property: "og:description",
        content:
          "Create a zero-PII Medicare scenario in 2 minutes and get a shareable Scenario ID.",
      },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/scenario/new" },
    ],
    links: [{ rel: "canonical", href: "https://themedicareoptimizer.lovable.app/scenario/new" }],
  }),
  component: ScenarioNew,
});

function ScenarioNew() {
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "voice">("manual");
  const [history, setHistory] = useState<ScenarioHistoryEntry[]>([]);
  useEffect(() => {
    setHistory(listScenarioHistory());
  }, []);

  // If voice wizard is turned off in production, never stay on voice mode.
  useEffect(() => {
    if (!VOICE_WIZARD_ENABLED && mode === "voice") setMode("manual");
  }, [mode]);

  const showModeToggle = VOICE_WIZARD_ENABLED;
  const activeMode = VOICE_WIZARD_ENABLED ? mode : "manual";

  return (
    <AppShell
      title="Build your scenario"
      subtitle="You'll get a Scenario ID at the end — share it with the agent of your choice."
    >
      {history.length > 0 && (
        <div className="max-w-3xl mx-auto mb-4 rounded-lg border border-border bg-white/60 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            <Clock className="h-3 w-3" /> Previous scenarios on this device
          </div>
          <ul className="flex flex-wrap gap-2">
            {history.map((h) => (
              <li key={h.code}>
                <Link
                  to="/scenario/$code"
                  params={{ code: h.code }}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono hover:bg-secondary/60 hover:underline text-primary"
                >
                  {h.code}
                  <span className="text-[10px] text-muted-foreground font-sans">
                    {new Date(h.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showModeToggle ? (
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition ${activeMode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Keyboard className="h-3.5 w-3.5" />
              {activeMode === "manual" ? (
                <span className="flex flex-col items-start leading-tight text-left">
                  <span>You are in Manual Wizard mode</span>
                  <span className="text-[10px] font-normal opacity-90">(complete form below)</span>
                </span>
              ) : (
                <span>Go back to Manual Wizard</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMode("voice")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition ${activeMode === "voice" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Mic className="h-3.5 w-3.5" /> Voice
            </button>
          </div>
        </div>
      ) : null}

      {activeMode === "manual" ? (
        <IntakeWizard
          onDone={(code) => router.navigate({ to: "/scenario/created/$code", params: { code } })}
        />
      ) : (
        <VoiceIntakeWizard
          onDone={(code) => router.navigate({ to: "/scenario/created/$code", params: { code } })}
          onSwitchToManual={() => setMode("manual")}
        />
      )}
    </AppShell>
  );
}
