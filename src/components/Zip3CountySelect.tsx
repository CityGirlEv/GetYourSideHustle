import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  countyMatchesZip3,
  countiesForZip3,
  formatCountyOptionLabel,
  type Zip3County,
} from "@/lib/zip3-county-lookup";
import { cn } from "@/lib/utils";

type Zip3CountySelectProps = {
  zip3: string;
  value: string;
  onChange: (county: string) => void;
  id?: string;
  className?: string;
};

export function Zip3CountySelect({ zip3, value, onChange, id, className }: Zip3CountySelectProps) {
  const [open, setOpen] = useState(false);
  const options: Zip3County[] = /^\d{3}$/.test(zip3) ? countiesForZip3(zip3) : [];
  const zip3Unknown = /^\d{3}$/.test(zip3) && options.length === 0;
  const selected = countyMatchesZip3(value, zip3);

  if (options.length > 0) {
    return (
      <div className={className}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full max-w-full min-h-11 justify-between font-normal text-base md:text-sm touch-manipulation"
            >
              <span className={cn("truncate", !selected && "text-muted-foreground")}>
                {selected ? formatCountyOptionLabel(selected) : "Select your county…"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,22rem)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Type to filter counties…" />
              <CommandList>
                <CommandEmpty>No county found.</CommandEmpty>
                <CommandGroup>
                  {options.map((c) => {
                    const label = formatCountyOptionLabel(c);
                    return (
                      <CommandItem
                        key={`${c.county}-${c.stateCode}`}
                        value={label}
                        onSelect={() => {
                          onChange(c.county);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selected?.county === c.county ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p className="text-[11px] text-muted-foreground mt-1 leading-snug whitespace-normal sm:whitespace-nowrap">
          {options.length > 1 ? (
            <>
              ZIP prefix {zip3} covers {options.length} counties — type to narrow the list.
              {" · "}
            </>
          ) : (
            <>Only one county for ZIP prefix {zip3}.{" · "}</>
          )}
          Plans vary by county, even within the same ZIP prefix.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 80))}
        placeholder={
          zip3.length === 3
            ? "e.g. Harris County, Orleans Parish"
            : "Enter the first 3 digits of your ZIP above first"
        }
        maxLength={80}
        disabled={zip3.length !== 3}
        className="text-base md:text-sm touch-manipulation max-w-full"
        required
      />
      {zip3Unknown ? (
        <p className="text-xs text-destructive mt-1.5">
          We don&apos;t recognize ZIP prefix {zip3}. Double-check the first 3 digits of your ZIP.
        </p>
      ) : null}
    </div>
  );
}
