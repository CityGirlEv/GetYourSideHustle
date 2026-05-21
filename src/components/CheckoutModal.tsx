import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useApp } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PACKAGES = [
  { id: "starter", name: "Starter", price: 29, credits: 10, blurb: "Best for solo agents" },
  { id: "growth", name: "Growth", price: 99, credits: 50, blurb: "Most popular" },
  { id: "unlimited", name: "Unlimited", price: 199, credits: 999, blurb: "Monthly all-access" },
];

export function CheckoutModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const { addCredits } = useApp();
  const [pkg, setPkg] = useState<string>("growth");
  const [success, setSuccess] = useState(false);

  const selected = PACKAGES.find((p) => p.id === pkg)!;

  const checkout = () => {
    setTimeout(() => {
      addCredits(selected.credits, `Purchased ${selected.name} pack`);
      setSuccess(true);
      toast.success(`Added ${selected.credits} credits`);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 1800);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald"/> Top up audit credits</DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-emerald flex items-center justify-center animate-in zoom-in">
              <Check className="h-8 w-8 text-emerald-foreground" />
            </div>
            <p className="font-semibold text-lg">Payment successful</p>
            <p className="text-sm text-muted-foreground">Credits added to your balance.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PACKAGES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPkg(p.id)}
                  className={`text-left rounded-2xl p-4 border-2 transition ${pkg === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                >
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.name}</div>
                  <div className="text-2xl font-bold mt-1">${p.price}</div>
                  <div className="text-sm text-emerald font-medium">{p.credits} audits</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.blurb}</div>
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-2">
              <Input placeholder="Card number  4242 4242 4242 4242" />
              <div className="flex gap-2">
                <Input placeholder="MM / YY" />
                <Input placeholder="CVC" />
                <Input placeholder="ZIP" />
              </div>
            </div>
            <Button onClick={checkout} className="w-full grad-indigo">
              <CreditCard className="h-4 w-4 mr-2"/> Pay ${selected.price} for {selected.credits} credits
            </Button>
            <p className="text-xs text-muted-foreground text-center">Demo checkout · no real charges</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
