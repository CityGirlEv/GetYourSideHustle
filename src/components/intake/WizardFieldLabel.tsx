import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function WizardFieldLabel({
  children,
  tip,
  required,
  htmlFor,
}: {
  children: ReactNode;
  tip: string;
  required?: boolean;
  htmlFor?: string;
}) {
  const labelText = typeof children === "string" ? children : "this field";
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 mb-1">
      <Label htmlFor={htmlFor} className="text-xs font-semibold leading-none mb-0">
        {children}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            aria-label={`About ${labelText}`}
          >
            <CircleHelp className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[16rem] text-left leading-snug normal-case font-normal"
        >
          {tip}
        </TooltipContent>
      </Tooltip>
    </div>
    </TooltipProvider>
  );
}
