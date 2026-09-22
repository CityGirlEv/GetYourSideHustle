/**
 * User-facing copy should say “side hustle” / “side-hustle”, never standalone
 * “hustle” when “side hustle” fits. Identifiers and already-prefixed phrases stay put.
 *
 * Official catalog titles (Grow Your Hustle, Craft Hustle, Find My Hustle) are
 * left unchanged so guide names stay stable.
 */

const HOLD_PHRASES = [
  "Get Your Side Hustle",
  "Grow Your Hustle",
  "Craft Hustle",
  "Find My Hustle",
  "side-hustle",
  "Side-Hustle",
  "Side-Hustler",
  "side-hustler",
  "side hustle",
  "Side Hustle",
  "SIDE HUSTLE",
];

const PHRASE_REPLACEMENTS: [RegExp, string][] = [
  [/\bWhat this hustle is\b/g, "What this side-hustle is"],
  [/\bthis hustle\b/g, "this side-hustle"],
  [/\bThis hustle\b/g, "This side-hustle"],
  [/\bthat hustle\b/g, "that side-hustle"],
  [/\bThat hustle\b/g, "That side-hustle"],
  [/\byour hustle\b/g, "your side hustle"],
  [/\bYour hustle\b/g, "Your side hustle"],
  [/\bmy hustle\b/g, "my side hustle"],
  [/\bMy hustle\b/g, "My side hustle"],
  [/\bour hustle\b/g, "our side hustle"],
  [/\bOur hustle\b/g, "Our side hustle"],
  [/\btheir hustle\b/g, "their side hustle"],
  [/\bthe hustle\b/g, "the side hustle"],
  [/\bThe hustle\b/g, "The side hustle"],
  [/\ba hustle\b/g, "a side hustle"],
  [/\bA hustle\b/g, "A side hustle"],
  [/\beach hustle\b/g, "each side hustle"],
  [/\bevery hustle\b/g, "every side hustle"],
  [/\bany hustle\b/g, "any side hustle"],
  [/\bone hustle\b/g, "one side hustle"],
  [/\bhustle earnings\b/g, "side hustle earnings"],
  [/\bhustle dollar\b/g, "side hustle dollar"],
  [/\bhustle plan\b/g, "side hustle plan"],
  [/\bhustle card\b/g, "side hustle card"],
  [/\bhustle calculator\b/g, "side hustle calculator"],
  [/\bhustle schedules\b/g, "side hustle schedules"],
  [/\bhustle-launch\b/g, "side-hustle-launch"],
  [/\bHustle matches\b/g, "Side Hustle matches"],
  [/\bbest hustle\b/g, "best side hustle"],
  [/\bsome hustle\b/g, "some side hustle"],
];

export function expandStandaloneHustleCopy(input: string): string {
  if (!input) return input;
  const held: string[] = [];
  let text = input;
  for (const phrase of HOLD_PHRASES) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    text = text.replace(re, (match) => {
      held.push(match);
      return `\u0000${held.length - 1}\u0000`;
    });
  }
  for (const [from, to] of PHRASE_REPLACEMENTS) {
    text = text.replace(from, to);
  }
  text = text
    .replace(/\bside side hustle\b/g, "side hustle")
    .replace(/\bSide side hustle\b/g, "Side hustle")
    .replace(/\bside side-hustle\b/g, "side-hustle")
    .replace(/\bSide side-hustle\b/g, "Side-hustle");
  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => held[Number(index)] ?? "");
}

export function displayPrerequisiteLabel(label: string): string {
  return expandStandaloneHustleCopy(label);
}
