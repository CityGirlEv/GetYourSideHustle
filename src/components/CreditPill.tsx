import { useApp } from "@/lib/app-store";
import { CheckoutModal } from "./CheckoutModal";
import { useState } from "react";
import { Coins } from "lucide-react";

export function CreditPill() {
  const { credits } = useApp();
  const [open, setOpen] = useState(false);
  const low = credits <= 3;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          low ? "bg-warning text-warning-foreground" : "bg-emerald text-emerald-foreground"
        } hover:opacity-90`}
      >
        <Coins className="h-4 w-4" /> Credits: {credits}
      </button>
      <CheckoutModal open={open} onOpenChange={setOpen} />
    </>
  );
}
