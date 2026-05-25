import { ShieldCheck, EyeOff, KeyRound, Home, LogIn, Settings } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { YearToggle } from "./YearToggle";

export function SecurityBanner() {
  const router = useRouter();
  const handleAdminClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };
  return (
    <div className="grad-indigo px-4 py-2 text-xs font-medium">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white/95">
          <span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-emerald" /> No personal information collected</span>
          <span className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-emerald" /> De-identified scenarios only</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald" /> Your scenario is anonymous unless opted in</span>
        </div>
        <div className="flex items-center gap-4 text-white/90">
          <YearToggle />
          <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
          <Link to="/auth" className="flex items-center gap-1 hover:text-white transition-colors">
            <LogIn className="h-3.5 w-3.5" /> Agent login
          </Link>
          <button onClick={handleAdminClick} className="flex items-center gap-1 hover:text-white transition-colors">
            <Settings className="h-3.5 w-3.5" /> Admin
          </button>
        </div>
      </div>
    </div>
  );
}
