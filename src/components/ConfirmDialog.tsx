import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmContextValue = (opts: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{
    open: boolean;
    opts: ConfirmOptions;
    resolve?: (v: boolean) => void;
  }>({ open: false, opts: { description: "" } });

  const confirm = React.useCallback<ConfirmContextValue>((input) => {
    const opts: ConfirmOptions =
      typeof input === "string" ? { description: input } : input;
    return new Promise<boolean>((resolve) => {
      setState({ open: true, opts, resolve });
    });
  }, []);

  const close = (result: boolean) => {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false, resolve: undefined }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={state.open}
        onOpenChange={(v) => { if (!v) close(false); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.opts.title ?? "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {state.opts.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => close(false)}>
              {state.opts.cancelLabel ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => close(true)}
              className={state.opts.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
            >
              {state.opts.confirmLabel ?? "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    // Fallback to native confirm if provider missing (shouldn't happen).
    return (input) => {
      const msg = typeof input === "string" ? input : input.description;
      return Promise.resolve(typeof window !== "undefined" ? window.confirm(msg) : false);
    };
  }
  return ctx;
}