import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  /** Selected values. Empty array means "All" (no filter). */
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  /** Label used when all/none selected. Default: "All". */
  allLabel?: string;
}

export function MultiSelect({
  options, value, onChange,
  placeholder = "Select…",
  className, triggerClassName,
  allLabel = "All",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const allValues = useMemo(() => options.map((o) => o.value), [options]);
  const isAll = value.length === 0 || value.length === options.length;

  const toggle = (v: string, checked: boolean) => {
    const set = new Set(value.length === 0 ? allValues : value);
    if (checked) set.add(v); else set.delete(v);
    const arr = Array.from(set);
    // If user selected everything, normalize to [] meaning "All"
    onChange(arr.length === allValues.length ? [] : arr);
  };
  const selectAll = () => onChange([]);
  const clearAll = () => onChange(allValues.length > 0 ? [allValues[0] + "__none__"] : []);
  // We use a sentinel that matches nothing to represent "none selected".
  // Simpler: clear -> set to a synthetic empty marker by toggling all off:
  const setNone = () => {
    // Filtering by an empty allowed-set would match nothing — use sentinel.
    onChange(["__none__"]);
  };

  const label = (() => {
    if (isAll) return allLabel;
    if (value.length === 1 && value[0] === "__none__") return "None";
    if (value.length === 1) {
      return options.find((o) => o.value === value[0])?.label ?? value[0];
    }
    return `${value.length} selected`;
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-9 justify-between font-normal", triggerClassName)}
        >
          <span className="truncate text-left">{placeholder ? `${placeholder}: ${label}` : label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-2 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-[240px] p-2", className)}>
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b">
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={selectAll}>
            <Check className="h-3 w-3 mr-1" /> Select all
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={setNone}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
        <div className="max-h-[260px] overflow-y-auto space-y-1">
          {options.map((o) => {
            const checked = isAll ? true : value.includes(o.value);
            return (
              <label
                key={o.value}
                className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-muted cursor-pointer text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => toggle(o.value, Boolean(c))}
                />
                <span className="truncate">{o.label}</span>
              </label>
            );
          })}
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground px-1.5 py-2">No options.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Helper: should an item be visible given the multi-select state?
 * - Empty value array  => "All" (always true)
 * - ["__none__"]       => match nothing
 * - Otherwise           => itemValue must be in value array
 */
export function multiSelectMatches(value: string[], itemValue: string): boolean {
  if (value.length === 0) return true;
  if (value.length === 1 && value[0] === "__none__") return false;
  return value.includes(itemValue);
}