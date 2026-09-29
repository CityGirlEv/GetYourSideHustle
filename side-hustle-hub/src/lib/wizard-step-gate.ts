/** Shared Match Wizard “Next / See matches” gate — incomplete required fields. */

export type WizardStepGateInput = {
  kind: "single" | "ranked";
  /** Question title shown in the popup. */
  question: string;
  selectedCount: number;
  minSelect: number;
  /** Counted noun: answer, strength, goal. */
  noun?: string;
  isLastStep: boolean;
};

export type WizardStepGateError = {
  title: string;
  continueLabel: string;
  items: string[];
};

function pluralNoun(count: number, noun: string): string {
  if (count === 1) return noun;
  if (noun.endsWith("y") && !/[aeiou]y$/i.test(noun)) return `${noun.slice(0, -1)}ies`;
  if (/(?:s|x|z|ch|sh)$/i.test(noun)) return `${noun}es`;
  return `${noun}s`;
}

/** Returns null when the current step is complete. */
export function wizardStepGateError(input: WizardStepGateInput): WizardStepGateError | null {
  const noun = input.noun || "answer";
  const { selectedCount, minSelect, question, kind, isLastStep } = input;
  if (selectedCount >= minSelect) return null;

  const continueLabel = isLastStep ? "See matches" : "Next";
  const need = minSelect - selectedCount;
  let item: string;

  if (kind === "single" || minSelect <= 1) {
    item = `Choose an answer for “${question}”`;
  } else if (selectedCount === 0) {
    item = `Select at least ${minSelect} ${pluralNoun(minSelect, noun)} for “${question}”`;
  } else {
    item = `Select ${need} more ${pluralNoun(need, noun)} for “${question}” (need ${minSelect}).`;
  }

  return {
    title: "Finish this step first",
    continueLabel,
    items: [item],
  };
}
