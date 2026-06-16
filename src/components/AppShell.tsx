import { SecurityBanner } from "./SecurityBanner";
import { TrustBanner } from "./TrustBanner";
import { CMSFooter } from "./CMSFooter";
import { LoginAlertDialog } from "./LoginAlertDialog";
import { type ReactNode } from "react";

export function AppShell({
  children,
  title,
  subtitle,
  titleClassName,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  titleClassName?: string;
}) {
  return (
    <div className="flex flex-col">
      <LoginAlertDialog />
      <section className="relative z-20 w-full border-b border-primary/10">
        <TrustBanner />
        <div className="bg-background/95 backdrop-blur-sm">
          <SecurityBanner />
        </div>
      </section>
      <main className="px-4 md:px-8 pt-1 sm:pt-2 pb-4 max-w-7xl w-full mx-auto">
        {(title || subtitle) && (
          <div className="mb-3">
            {title && (
              <h1
                className={`font-display font-bold text-2xl md:text-3xl ${titleClassName ?? "text-primary"}`}
              >
                {title}
              </h1>
            )}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
      <CMSFooter />
    </div>
  );
}
