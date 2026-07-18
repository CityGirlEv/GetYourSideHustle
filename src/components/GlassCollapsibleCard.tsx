import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function GlassCollapsibleCard({
  id,
  title,
  subtitle,
  icon,
  defaultOpen = true,
  className,
  contentClassName,
  headerExtra,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card id={id} className={cn("glass overflow-hidden scroll-mt-24", className)}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start gap-2 min-w-0 flex-1">
              {icon ? <span className="shrink-0 mt-0.5">{icon}</span> : null}
              <div className="space-y-1 min-w-0">
                <h3 className="font-display font-bold">{title}</h3>
                {subtitle ? (
                  <p className="text-xs text-muted-foreground leading-snug">{subtitle}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              {headerExtra}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={cn(
              "px-4 pb-4 pt-0 space-y-3 border-t border-border/40",
              contentClassName,
            )}
          >
            {children}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
