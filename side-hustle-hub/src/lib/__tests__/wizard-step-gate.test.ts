import { describe, expect, it } from "vitest";
import { wizardStepGateError } from "../wizard-step-gate";

describe("wizardStepGateError", () => {
  it("returns null when the minimum is met", () => {
    expect(
      wizardStepGateError({
        kind: "single",
        question: "How old are you?",
        selectedCount: 1,
        minSelect: 1,
        isLastStep: false,
      }),
    ).toBeNull();
    expect(
      wizardStepGateError({
        kind: "ranked",
        question: "What are your primary goals?",
        selectedCount: 2,
        minSelect: 2,
        noun: "goal",
        isLastStep: true,
      }),
    ).toBeNull();
  });

  it("names a missing single answer and uses Next vs See matches", () => {
    expect(
      wizardStepGateError({
        kind: "single",
        question: "How old are you?",
        selectedCount: 0,
        minSelect: 1,
        isLastStep: false,
      }),
    ).toEqual({
      title: "Finish this step first",
      continueLabel: "Next",
      items: ['Choose an answer for “How old are you?”'],
    });
    expect(
      wizardStepGateError({
        kind: "single",
        question: "How much time do you have?",
        selectedCount: 0,
        minSelect: 1,
        isLastStep: true,
      })?.continueLabel,
    ).toBe("See matches");
  });

  it("names ranked minimums and remaining picks", () => {
    expect(
      wizardStepGateError({
        kind: "ranked",
        question: "Where do your strengths lie?",
        selectedCount: 0,
        minSelect: 1,
        noun: "strength",
        isLastStep: false,
      })?.items[0],
    ).toBe('Choose an answer for “Where do your strengths lie?”');

    expect(
      wizardStepGateError({
        kind: "ranked",
        question: "What are your primary goals?",
        selectedCount: 0,
        minSelect: 2,
        noun: "goal",
        isLastStep: true,
      })?.items[0],
    ).toBe('Select at least 2 goals for “What are your primary goals?”');

    expect(
      wizardStepGateError({
        kind: "ranked",
        question: "What are your primary goals?",
        selectedCount: 1,
        minSelect: 2,
        noun: "goal",
        isLastStep: true,
      })?.items[0],
    ).toBe('Select 1 more goal for “What are your primary goals?” (need 2).');
  });
});
