import { ShieldCheck, Lock, Activity } from "lucide-react";

export function SecurityBanner() {
  return (
    <div className="grad-indigo px-4 py-2 text-xs font-medium flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white/95">
      <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald" /> HIPAA Compliant</span>
      <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald" /> AES-256 Encrypted in Transit &amp; at Rest</span>
      <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-emerald" /> Secure Session Active</span>
    </div>
  );
}
