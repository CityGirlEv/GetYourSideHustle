import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  maxTagLength?: number;
};

export function TagChipInput({
  id,
  value,
  onChange,
  placeholder = "Type a medication and press Enter",
  className,
  maxTags = 40,
  maxTagLength = 120,
}: Props) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, maxTagLength);
    if (!tag) return;
    const exists = value.some((v) => v.toLowerCase() === tag.toLowerCase());
    if (exists || value.length >= maxTags) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] rounded-md border border-input bg-background px-2 py-2 focus-within:ring-2 focus-within:ring-primary/30">
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="rounded-full hover:bg-primary/20 p-0.5"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={value.length === 0 ? placeholder : "Add another…"}
          className="flex-1 min-w-[8rem] border-0 shadow-none focus-visible:ring-0 px-1 h-8 text-base md:text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter after each medication. Add as many as you take regularly.
      </p>
    </div>
  );
}
