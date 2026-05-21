import { ShieldCheck, EyeOff, KeyRound } from "lucide-react";

export function SecurityBanner() {
  return (
    <div className="grad-indigo px-4 py-2 text-xs font-medium flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white/95">
      <span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-emerald" /> No personal information collected</span>
      <span className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-emerald" /> De-identified scenarios only</span>
      <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald" /> You control who sees your Scenario ID</span>
    </div>
  );
}
