import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isBenchmarkEstimateId } from "@/lib/benchmark-id";
import {
  BENCHMARK_CODE_PLACEHOLDER,
  BENCHMARK_TOOL_ID_LABEL,
} from "@/lib/plan-comparison-copy";
import { cn } from "@/lib/utils";

export function BenchmarkIdLookupForm({ className }: { className?: string }) {
  const router = useRouter();
  const [lookupCode, setLookupCode] = useState("");

  const goToReport = (e: React.FormEvent) => {
    e.preventDefault();
    const code = lookupCode.trim();
    if (!code) return;
    if (isBenchmarkEstimateId(code)) {
      router.navigate({ to: "/scenario/estimate/$code", params: { code } });
      return;
    }
    router.navigate({ to: "/scenario/$code", params: { code } });
  };

  return (
    <form
      onSubmit={goToReport}
      className={cn(
        "mx-auto w-full max-w-md space-y-2 rounded-lg border border-border/60 bg-white/60 px-4 py-3 text-center sm:space-y-2.5",
        className,
      )}
    >
      <div className="text-xs font-medium text-muted-foreground sm:text-sm">
        Already have a {BENCHMARK_TOOL_ID_LABEL}?
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={BENCHMARK_CODE_PLACEHOLDER}
          value={lookupCode}
          onChange={(e) => setLookupCode(e.target.value)}
          className="h-9 min-w-0 flex-1 text-sm font-mono"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!lookupCode.trim()}
          className="shrink-0"
        >
          <Search className="mr-1 h-4 w-4" /> Find
        </Button>
      </div>
    </form>
  );
}
