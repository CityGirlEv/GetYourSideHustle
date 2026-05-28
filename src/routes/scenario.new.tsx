import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { IntakeWizard } from "@/components/IntakeWizard";
import { VoiceIntakeWizard } from "@/components/VoiceIntakeWizard";
import { AppShell } from "@/components/AppShell";
import { Mic, Keyboard, Clock } from "lucide-react";
import { listScenarioHistory, type ScenarioHistoryEntry } from "@/lib/scenario-history";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/scenario/new")({
  head: () => ({
    meta: [
      { title: "Build a Medicare Scenario — No Personal Info Required" },
      { name: "description", content: "Build a de-identified Medicare scenario. We never collect your name, address, phone, or full date of birth." },
      { property: "og:title", content: "Build a Medicare Scenario — No Personal Info Required" },
      { property: "og:description", content: "Create a zero-PII Medicare scenario in 2 minutes and get a shareable Scenario ID." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/scenario/new" },
    ],
    links: [
      { rel: "canonical", href: "https://themedicareoptimizer.lovable.app/scenario/new" },
    ],
  }),
  component: ScenarioNew,
});

function ScenarioNew() {
  const router = useRouter();
  const { user } = useApp();
  const isQaOrAdmin = user?.role === "admin" || user?.role === "qa";
  const [mode, setMode] = useState<"manual" | "voice">("manual");
  const [history, setHistory] = useState<ScenarioHistoryEntry[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  useEffect(() => { setHistory(listScenarioHistory()); }, []);
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("popup") === "1" && isQaOrAdmin) {
      setPopupOpen(true);
    }
  }, [isQaOrAdmin]);

  const openManualPopup = () => {
    if (typeof window === "undefined") return;
    const w = 900;
    const h = 800;
    const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
    window.open(
      "/scenario/new?popup=1",
      "manual-wizard",
      `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`,
    );
  };
  return (
    <AppShell title="Build your scenario" subtitle="You'll get a Scenario ID at the end — share it with the agent of your choice.">
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
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              if (mode === "voice") {
                setMode("manual");
              } else {
                openManualPopup();
              }
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition ${mode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Keyboard className="h-3.5 w-3.5" /> {mode === "voice" ? "Go back to Manual Wizard" : "Manual Wizard"}
          </button>
          <button
            type="button"
            onClick={() => setMode("voice")}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full transition ${mode === "voice" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Mic className="h-3.5 w-3.5" /> Voice
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

      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enter Scenario Information</DialogTitle>
          </DialogHeader>
          <IntakeWizard
            onDone={(code) => {
              setPopupOpen(false);
              router.navigate({ to: "/scenario/created/$code", params: { code } });
            }}
          />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
