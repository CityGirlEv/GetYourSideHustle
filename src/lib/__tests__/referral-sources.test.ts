import { describe, it, expect } from "vitest";
import {
  buildReferralPreferences,
  referralTextLooksLikePii,
  validateReferralDetails,
  isReferralSource,
} from "../referral-sources";

describe("referral-sources", () => {
  it("detects email and phone in referral free text", () => {
    expect(referralTextLooksLikePii("agent@example.com")).toBe(true);
    expect(referralTextLooksLikePii("555-123-4567")).toBe(true);
    expect(referralTextLooksLikePii("Smith Insurance Group")).toBe(false);
  });

  it("builds preferences for agent referral with agency name", () => {
    expect(
      buildReferralPreferences(["agent_referral"], {
        agent_referral: "Smith Insurance Group",
      }),
    ).toEqual({
      referralSources: ["agent_referral"],
      referralSource: "agent_referral",
      referralAgentName: "Smith Insurance Group",
    });
  });

  it("supports multiple referral sources with detail fields", () => {
    expect(
      buildReferralPreferences(["google", "friend_family", "medicare_event"], {
        friend_family: "Word of mouth",
        medicare_event: "Springfield Senior Center Medicare 101",
      }),
    ).toEqual({
      referralSources: ["google", "friend_family", "medicare_event"],
      referralSource: "google",
      referralFriendFamily: "Word of mouth",
      referralMedicareEvent: "Springfield Senior Center Medicare 101",
    });
  });

  it("omits detail fields when source is not selected", () => {
    expect(buildReferralPreferences(["google"], { agent_referral: "ignored" })).toEqual({
      referralSources: ["google"],
      referralSource: "google",
    });
  });

  it("validates referral source values", () => {
    expect(isReferralSource("facebook")).toBe(true);
    expect(isReferralSource("not-a-source")).toBe(false);
  });

  it("requires agent name when agent referral is selected", () => {
    expect(
      validateReferralDetails(["agent_referral"], { agent_referral: "  " }),
    ).toMatch(/agent or agency name/i);
    expect(validateReferralDetails(["agent_referral"], { agent_referral: "Smith Insurance" })).toBe(
      null,
    );
  });

  it("requires description when other is selected", () => {
    expect(validateReferralDetails(["other"], { other: "" })).toMatch(/briefly describe/i);
    expect(validateReferralDetails(["other"], { other: "Community bulletin board" })).toBe(null);
  });
});
