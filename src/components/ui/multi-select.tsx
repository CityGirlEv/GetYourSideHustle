import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  /** Show a search box above the option list. Useful for long lists. */
  searchable?: boolean;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  className,
  triggerClassName,
  allLabel = "All",
  searchable = false,
  searchPlaceholder = "Search…",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const allValues = useMemo(() => options.map((o) => o.value), [options]);
  const isAll = value.length === 0 || value.length === options.length;
  const visibleOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search, searchable]);

  const toggle = (v: string, checked: boolean) => {
    // "All" state ([]): checking is a no-op (already included);
    // unchecking should narrow to every value EXCEPT this one.
    if (value.length === 0) {
      if (checked) return;
      onChange(allValues.filter((x) => x !== v));
      return;
    }
    // Sentinel "none" state — first click starts a fresh single selection.
    if (value.length === 1 && value[0] === "__none__") {
      onChange(checked ? [v] : ["__none__"]);
      return;
    }
    const set = new Set(value);
    if (checked) set.add(v);
    else set.delete(v);
    const arr = Array.from(set);
    // If the user selected everything, normalize to [] meaning "All".
    // If they cleared the last one, fall back to the "none" sentinel.
    if (arr.length === 0) onChange(["__none__"]);
    else if (arr.length === allValues.length) onChange([]);
    else onChange(arr);
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
          <span className="truncate text-left">
            {placeholder ? `${placeholder}: ${label}` : label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-2 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-[240px] p-2", className)}>
        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={selectAll}
          >
            <Check className="h-3 w-3 mr-1" /> Select all
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={setNone}
          >
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
        {searchable && (
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 mb-2 text-sm"
          />
        )}
        <div className="max-h-[260px] overflow-y-auto space-y-1">
          {visibleOptions.map((o) => {
            // When "All" is active, render every box as UNCHECKED so the
            // user can click one to start filtering. The label "All" on the
            // trigger button already communicates that nothing is filtered.
            // In "All" state every item is implicitly selected — render checked.
            const checked = isAll ? true : value.includes(o.value);
            return (
              <label
                key={o.value}
                className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-muted cursor-pointer text-sm"
              >
                <Checkbox checked={checked} onCheckedChange={(c) => toggle(o.value, Boolean(c))} />
                <span className="truncate">{o.label}</span>
              </label>
            );
          })}
          {visibleOptions.length === 0 && (
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
