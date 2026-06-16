import { useMemo } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Date picker that stores values as MM/DD/YY strings (the format already used
 * across the task sheet). Empty string === unset.
 */
export function DateField({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  buttonClassName,
  align = "start",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  align?: "start" | "center" | "end";
}) {
  const parsed = useMemo(() => {
    if (!value) return undefined;
    const d = parse(value, "MM/dd/yy", new Date());
    return isValid(d) ? d : undefined;
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "justify-start font-normal px-2",
            !parsed && "text-muted-foreground",
            buttonClassName,
            className,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 mr-1.5 opacity-60" />
          {parsed ? format(parsed, "MM/dd/yy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={parsed}
          onSelect={(d) => onChange(d ? format(d, "MM/dd/yy") : "")}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
        {parsed && (
          <div className="flex justify-end border-t p-2">
            <Button size="sm" variant="ghost" onClick={() => onChange("")}>
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
