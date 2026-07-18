import { useMemo, useState } from "react";
import { INTAKE_CONDITIONS } from "@/lib/intake-constants";

function splitIntakeConditionsForInit(all: string[]): { preset: string[]; other: string[] } {
  const known = new Set<string>(INTAKE_CONDITIONS);
  const preset: string[] = [];
  const other: string[] = [];
  for (const c of all) {
    if (known.has(c)) preset.push(c);
    else if (c.trim()) other.push(c);
  }
  if (other.length > 0 && !preset.includes("Other")) preset.push("Other");
  return { preset, other };
}

export function useIntakeConditions(initial?: string[]) {
  const init = useMemo(() => splitIntakeConditionsForInit(initial ?? []), [initial]);
  const [conditions, setConditions] = useState<string[]>(init.preset);
  const [otherConditions, setOtherConditions] = useState<string[]>(init.other);
  const [otherInput, setOtherInput] = useState("");

  const allConditions = useMemo(
    () => conditions.filter((c) => c !== "Other").concat(otherConditions),
    [conditions, otherConditions],
  );

  const toggleCondition = (c: string) => {
    setConditions((p) => {
      if (p.includes(c)) {
        if (c === "Other") setOtherConditions([]);
        return p.filter((x) => x !== c);
      }
      return [...p, c];
    });
  };

  const addOtherCondition = () => {
    const text = otherInput.trim();
    if (!text) return;
    setOtherConditions((p) => (p.includes(text) ? p : [...p, text]));
    setOtherInput("");
  };

  const removeOtherCondition = (c: string) => setOtherConditions((p) => p.filter((x) => x !== c));

  return {
    conditions,
    otherConditions,
    otherInput,
    setOtherInput,
    allConditions,
    toggleCondition,
    addOtherCondition,
    removeOtherCondition,
  };
}
