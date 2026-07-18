import { useState } from "react";
import type { ReferralSource } from "@/lib/referral-sources";

export function useIntakeReferral() {
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([]);
  const [referralAgentName, setReferralAgentName] = useState("");
  const [referralFriendFamily, setReferralFriendFamily] = useState("");
  const [referralMedicareEvent, setReferralMedicareEvent] = useState("");
  const [referralOther, setReferralOther] = useState("");

  const referralDetailValues = {
    agent_referral: referralAgentName,
    friend_family: referralFriendFamily,
    medicare_event: referralMedicareEvent,
    other: referralOther,
  } as const;

  const setReferralDetailValue = (source: keyof typeof referralDetailValues, value: string) => {
    switch (source) {
      case "agent_referral":
        setReferralAgentName(value);
        break;
      case "friend_family":
        setReferralFriendFamily(value);
        break;
      case "medicare_event":
        setReferralMedicareEvent(value);
        break;
      case "other":
        setReferralOther(value);
        break;
    }
  };

  const clearReferralDetail = (source: ReferralSource) => {
    if (source === "agent_referral") setReferralAgentName("");
    if (source === "friend_family") setReferralFriendFamily("");
    if (source === "medicare_event") setReferralMedicareEvent("");
    if (source === "other") setReferralOther("");
  };

  const toggleReferralSource = (value: ReferralSource) => {
    setReferralSources((prev) => {
      if (value === "prefer_not_to_say") {
        return prev.includes(value) ? [] : [value];
      }
      const withoutPrefer = prev.filter((s) => s !== "prefer_not_to_say");
      return withoutPrefer.includes(value)
        ? withoutPrefer.filter((s) => s !== value)
        : [...withoutPrefer, value];
    });
  };

  const handleReferralSourceChange = (value: ReferralSource) => {
    const isSelected = referralSources.includes(value);
    if (isSelected) {
      clearReferralDetail(value);
    } else if (value === "prefer_not_to_say") {
      for (const source of referralSources) clearReferralDetail(source);
    }
    toggleReferralSource(value);
  };

  return {
    referralSources,
    referralAgentName,
    referralFriendFamily,
    referralMedicareEvent,
    referralOther,
    setReferralOther,
    referralDetailValues,
    setReferralDetailValue,
    handleReferralSourceChange,
  };
}
