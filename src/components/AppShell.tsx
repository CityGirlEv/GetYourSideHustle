import { SecurityBanner } from "./SecurityBanner";
import { TrustBanner } from "./TrustBanner";
import { CMSFooter } from "./CMSFooter";
import { LoginAlertDialog } from "./LoginAlertDialog";
import { type ReactNode } from "react";

export function AppShell({
  children,
  title,
  subtitle,
  subtitleFooter,
  titleClassName,
}: {
  children: ReactNode;
  title: string;
  subtitle?: ReactNode;
  subtitleFooter?: ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className="flex flex-col">
      <LoginAlertDialog />
      <section className="relative z-30 w-full border-b border-primary/10">
        <TrustBanner />
        <div className="bg-background/95 backdrop-blur-sm">
          <SecurityBanner />
        </div>
      </section>
      <main className="px-3 sm:px-4 md:px-8 pt-1 sm:pt-2 pb-4 max-w-7xl w-full mx-auto">
        {(title || subtitle) && (
          <div className="mb-3">
            {title && (
              <h1
                className={`font-display font-bold text-xl sm:text-2xl md:text-3xl leading-tight ${titleClassName ?? "text-primary"}`}
              >
                {title}
              </h1>
            )}
            {(subtitle || subtitleFooter) && (
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground leading-relaxed">
                {subtitle ? <span className="shrink-0">{subtitle}</span> : null}
                {subtitle && subtitleFooter ? (
                  <span className="hidden sm:inline text-muted-foreground/40" aria-hidden>
                    ·
                  </span>
                ) : null}
                {subtitleFooter}
              </div>
            )}
          </div>
        )}
        {children}
      </main>
      <CMSFooter />
    </div>
  );
}
