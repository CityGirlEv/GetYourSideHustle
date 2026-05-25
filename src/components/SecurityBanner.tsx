import { ShieldCheck, EyeOff, KeyRound, Home, LogIn, Settings, Users, Briefcase } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { YearToggle } from "./YearToggle";
import { useApp } from "@/lib/app-store";

export function SecurityBanner() {
  const { user } = useApp();
  return (
    <div className="grad-indigo px-4 py-2 text-xs font-medium">
      <div className="max-w-7xl mx-auto space-y-1">
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <YearToggle />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-white/90">
            <Link to="/" className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
            {user?.role === "admin" && (
              <>
                <Link to="/admin" className="flex items-center gap-1 hover:text-white transition-colors">
                  <Settings className="h-3.5 w-3.5" /> Admin
                </Link>
                <Link to="/users" className="flex items-center gap-1 hover:text-white transition-colors">
                  <Users className="h-3.5 w-3.5" /> Users
                </Link>
              </>
            )}
            {user?.role === "agent" && (
              <Link to="/agent" className="flex items-center gap-1 hover:text-white transition-colors">
                <Briefcase className="h-3.5 w-3.5" /> My assignments
              </Link>
            )}
            {!user && (
              <Link to="/auth" className="flex items-center gap-1 hover:text-white transition-colors">
                <LogIn className="h-3.5 w-3.5" /> Agent login
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-white/95">
          <span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-emerald" /> No personal information collected</span>
          <span className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-emerald" /> De-identified scenarios only</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald" /> Your scenario is anonymous unless opted in</span>
        </div>
      </div>
    </div>
  );
}
