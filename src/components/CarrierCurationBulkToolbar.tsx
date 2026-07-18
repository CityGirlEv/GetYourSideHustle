import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type CarrierCurationBulkToolbarProps = {
  selectedCount: number;
  onKeep: () => void;
  onDiscard: () => void;
  onClearSelection: () => void;
};

export function CarrierCurationBulkToolbar({
  selectedCount,
  onKeep,
  onDiscard,
  onClearSelection,
}: CarrierCurationBulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-background/95 p-2 shadow-sm"
      data-testid="carrier-curation-bulk-toolbar"
    >
      <span className="text-xs font-medium tabular-nums shrink-0">
        {selectedCount} selected
      </span>

      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onKeep}>
        <Check className="h-3 w-3 mr-1" />
        Keep
      </Button>

      <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={onDiscard}>
        <X className="h-3 w-3 mr-1" />
        Discard
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs ml-auto"
        onClick={onClearSelection}
      >
        Clear
      </Button>
    </div>
  );
}
