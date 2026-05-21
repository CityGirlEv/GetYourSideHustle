import { useApp } from "@/lib/app-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";

export function HipaaAck() {
  const { user, acknowledgeHipaa } = useApp();
  const [busy, setBusy] = useState(false);
  const open = !!user && !user.hipaa_acknowledged_at;
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e)=>e.preventDefault()} onEscapeKeyDown={(e)=>e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-warning" /><DialogTitle>HIPAA &amp; PHI handling — please read</DialogTitle></div>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm text-foreground/80 pt-2">
              <p>This platform applies strong technical safeguards for Protected Health Information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>All client PHI is encrypted in your browser (AES-256-GCM) with a passphrase only you know.</li>
                <li>The server stores ciphertext only — never plaintext names, DOBs, diagnoses, or prescriptions.</li>
                <li>Every access is recorded in an append-only audit log.</li>
                <li>Idle sessions auto-lock after 15 minutes.</li>
              </ul>
              <p className="text-xs"><strong>Important:</strong> Full HIPAA compliance also requires Business Associate Agreements with hosting, email, and AI vendors, plus written policies and workforce training. Until those are in place at your organization, do not enter real patient data — use synthetic/test data only.</p>
              <p className="text-xs">By clicking <em>I understand</em>, you accept responsibility for handling PHI in accordance with your organization's HIPAA policies.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={busy} onClick={async ()=>{ setBusy(true); await acknowledgeHipaa(); setBusy(false); }} className="grad-indigo w-full">
            I understand — continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
