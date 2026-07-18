import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIntakeReferral } from "@/hooks/use-intake-referral";

describe("useIntakeReferral", () => {
  it("toggles referral sources and clears prefer-not-to-say exclusivity", () => {
    const { result } = renderHook(() => useIntakeReferral());

    act(() => {
      result.current.handleReferralSourceChange("google");
    });
    expect(result.current.referralSources).toEqual(["google"]);

    act(() => {
      result.current.handleReferralSourceChange("prefer_not_to_say");
    });
    expect(result.current.referralSources).toEqual(["prefer_not_to_say"]);

    act(() => {
      result.current.handleReferralSourceChange("facebook");
    });
    expect(result.current.referralSources).toEqual(["facebook"]);
  });

  it("clears agent detail when agent referral is unchecked", () => {
    const { result } = renderHook(() => useIntakeReferral());

    act(() => {
      result.current.handleReferralSourceChange("agent_referral");
      result.current.setReferralDetailValue("agent_referral", "Smith Insurance");
    });
    expect(result.current.referralAgentName).toBe("Smith Insurance");

    act(() => {
      result.current.handleReferralSourceChange("agent_referral");
    });
    expect(result.current.referralAgentName).toBe("");
  });
});
