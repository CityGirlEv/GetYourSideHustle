import { SecurityBanner } from "./SecurityBanner";
import { TrustBanner } from "./TrustBanner";
import { CMSFooter } from "./CMSFooter";
import { LoginAlertDialog } from "./LoginAlertDialog";
import { type ReactNode } from "react";

export function AppShell({ children, title, subtitle, titleClassName }: { children: ReactNode; title: string; subtitle?: string; titleClassName?: string }) {
  return (
    <div className="min-h-screen flex flex-col">
      <LoginAlertDialog />
      <section className="relative z-20 w-full border-b border-primary/10">
        <div className="bg-background/95 backdrop-blur-sm">
          <SecurityBanner />
          <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 overflow-visible">
            <p className="mt-0.5 sm:mt-1 pb-0.5 text-center font-display text-[10px] sm:text-xs md:text-sm text-primary font-medium italic leading-snug max-w-xl mx-auto px-2">
              Let The Optimizer Find The Medicare Plan You Deserve!
            </p>
          </div>
        </div>
        <TrustBanner />
      </section>
      <main className="flex-1 px-4 md:px-8 pt-0 pb-6 max-w-7xl w-full mx-auto">
        {(title || subtitle) && (
          <div className="mb-2 mt-0.5">
            {title && <h2 className={`font-display font-bold text-2xl md:text-3xl ${titleClassName ?? "text-primary"}`}>{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
      <CMSFooter />
    </div>
  );
}
