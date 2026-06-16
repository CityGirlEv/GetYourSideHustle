import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { AlertTriangle, LogOut, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import {
  DEPLOY_BROADCAST_KEY,
  LOGOUT_COUNTDOWN_SECONDS,
  REQUEST_SAVE_BEFORE_DEPLOY_EVENT,
  VERSION_POLL_INTERVAL_MS,
  fetchRemoteBuildId,
  getCurrentAppPath,
  getLoadedBuildId,
  isAuthRoute,
  isDeployGateActive,
  isNewDeploy,
  markDeployHandled,
  parseDeployBroadcast,
  runDeploySaveHandlers,
  stashDeployResume,
  wasDeployAlreadyHandled,
} from "@/lib/deploy-version";
import { toast } from "sonner";

/**
 * Detects production deploys while a user is signed in, warns them to save work,
 * counts down, then signs out and sends them to /auth with a resume redirect.
 */
export function DeployVersionGate() {
  const { user, authLoading, signOut } = useApp();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const loadedBuildId = useRef(getLoadedBuildId());
  const triggeredRef = useRef(false);
  const loggingOutRef = useRef(false);
  const saveCompletedRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(LOGOUT_COUNTDOWN_SECONDS);
  const gateActive = isDeployGateActive();

  const resetDeployGateState = useCallback(() => {
    triggeredRef.current = false;
    loggingOutRef.current = false;
    saveCompletedRef.current = false;
    setOpen(false);
    setPaused(false);
    setSaving(false);
    setSaveCompleted(false);
    setSecondsLeft(LOGOUT_COUNTDOWN_SECONDS);
  }, []);

  const dismissDeployGateUi = useCallback(() => {
    setOpen(false);
    setPaused(false);
    setSaving(false);
    setSaveCompleted(false);
  }, []);

  const beginForcedLogout = useCallback((remoteBuildId: string) => {
    if (triggeredRef.current) return;
    if (!isNewDeploy(loadedBuildId.current, remoteBuildId)) return;
    if (wasDeployAlreadyHandled(remoteBuildId)) return;

    triggeredRef.current = true;
    markDeployHandled(remoteBuildId);
    setSecondsLeft(LOGOUT_COUNTDOWN_SECONDS);
    setPaused(false);
    setSaving(false);
    setOpen(true);
  }, []);

  const checkVersion = useCallback(async () => {
    if (!gateActive) return;
    if (triggeredRef.current) return;
    if (authLoading || !user) return;
    if (isAuthRoute(pathname)) return;

    const remote = await fetchRemoteBuildId();
    if (!remote) return;
    beginForcedLogout(remote);
  }, [authLoading, beginForcedLogout, gateActive, pathname, user]);

  useEffect(() => {
    if (!gateActive || authLoading || !user || isAuthRoute(pathname)) return;

    void checkVersion();

    const interval = window.setInterval(() => {
      void checkVersion();
    }, VERSION_POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void checkVersion();
    };
    const onFocus = () => {
      void checkVersion();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [authLoading, checkVersion, gateActive, pathname, user]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (!gateActive) return;
      if (event.key !== DEPLOY_BROADCAST_KEY) return;
      const payload = parseDeployBroadcast(event.newValue);
      if (!payload) return;
      if (authLoading || !user || isAuthRoute(pathname)) return;
      beginForcedLogout(payload.buildId);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [authLoading, beginForcedLogout, gateActive, pathname, user]);

  useEffect(() => {
    if (!gateActive) return;
    if (!user || isAuthRoute(pathname)) {
      resetDeployGateState();
    }
  }, [gateActive, pathname, resetDeployGateState, user]);

  const logoutNow = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    dismissDeployGateUi();

    const redirect = stashDeployResume(getCurrentAppPath()) ?? getCurrentAppPath();

    try {
      await signOut();
    } catch {
      /* proceed to login even if sign-out fails */
    }

    resetDeployGateState();

    await router.navigate({
      to: "/auth",
      search: { redirect },
    });
  }, [dismissDeployGateUi, resetDeployGateState, router, signOut]);

  useEffect(() => {
    if (!open || paused || saving) return;

    if (secondsLeft <= 0) {
      void logoutNow();
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [logoutNow, open, paused, saving, secondsLeft]);

  const handleSaveWork = async () => {
    if (saving) return;
    setSaving(true);
    setPaused(true);
    setOpen(false);
    stashDeployResume(getCurrentAppPath());

    window.dispatchEvent(new CustomEvent(REQUEST_SAVE_BEFORE_DEPLOY_EVENT));

    const { ran, failed } = await runDeploySaveHandlers();
    setSaving(false);

    if (failed > 0) {
      setPaused(true);
      toast.error("Some work could not be saved automatically.", {
        description: "Review any open save dialogs, then log out when ready.",
      });
    } else if (ran > 0) {
      saveCompletedRef.current = true;
      setSaveCompleted(true);
      setPaused(true);
      toast.success("Your work was saved.", {
        description: "Log out when you're ready to reload the new version.",
      });
    } else {
      saveCompletedRef.current = true;
      setSaveCompleted(true);
      setPaused(true);
      toast.message("Nothing new to save", {
        description: "Your in-progress work is stored locally where applicable.",
      });
    }
  };

  const showPausedBanner =
    triggeredRef.current &&
    (paused || saving) &&
    !!user &&
    !isAuthRoute(pathname);

  if (!gateActive) return null;

  if (open && !paused) {
    return (
      <AlertDialog open={open}>
        <AlertDialogContent
          className="max-w-lg border-amber-500/40 z-[200]"
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              New version available
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  A new version of Get Part B Optimizer has been deployed.{" "}
                  <strong className="font-semibold text-foreground">Save your work</strong> before
                  logging out — unsaved changes may be lost.
                </p>
                <p>
                  You will be logged out in{" "}
                  <strong className="font-semibold text-foreground">
                    {secondsLeft} second{secondsLeft === 1 ? "" : "s"}
                  </strong>{" "}
                  and will need to log back in.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:items-stretch">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                className="gap-1.5"
                disabled={saving}
                onClick={() => void handleSaveWork()}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save my work"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                disabled={saving}
                onClick={() => void logoutNow()}
              >
                <LogOut className="h-4 w-4" />
                Log out now
              </Button>
            </div>
            <div
              aria-live="polite"
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-2xl font-bold tabular-nums text-amber-600"
            >
              {secondsLeft}
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (showPausedBanner) {
    return (
      <div className="fixed bottom-4 left-1/2 z-[120] w-[min(100%,28rem)] -translate-x-1/2 px-4">
        <div className="rounded-xl border-2 border-amber-500 bg-background/95 p-4 shadow-2xl backdrop-blur space-y-3">
          <p className="text-sm font-semibold text-foreground">New version available</p>
          <p className="text-xs text-muted-foreground">
            {saving
              ? "Saving your work…"
              : saveCompleted
                ? "Your work is saved. Log out and sign back in to load the new version."
                : "Countdown paused. When you're ready, log out and sign back in to load the new version."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {!saving && !saveCompleted && (
              <Button type="button" size="sm" className="gap-1.5" onClick={() => void handleSaveWork()}>
                <Save className="h-4 w-4" />
                Save again
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={saving}
              onClick={() => void logoutNow()}
            >
              <LogOut className="h-4 w-4" />
              Log out now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
