import { describe, expect, it } from "vitest";
import { mergeSpeechResults, transcriptFromResults } from "../speech-recognition";

function mockResults(
  items: Array<{ transcript: string; isFinal?: boolean }>,
): Array<Array<{ transcript: string; isFinal?: boolean }>> {
  return items.map((item) => {
    const row = [{ transcript: item.transcript }] as Array<{
      transcript: string;
      isFinal?: boolean;
    }> & { isFinal?: boolean };
    row.isFinal = item.isFinal;
    return row;
  });
}

describe("mergeSpeechResults", () => {
  it("combines interim results into display text", () => {
    const results = mockResults([{ transcript: "nineteen ", isFinal: false }]);
    const merged = mergeSpeechResults(results, 0, "");
    expect(merged.display).toBe("nineteen");
    expect(merged.final).toBe("");
  });

  it("commits final segments and keeps newer interim text", () => {
    const results = mockResults([
      { transcript: "nineteen fifty", isFinal: true },
      { transcript: " eight", isFinal: false },
    ]);
    const merged = mergeSpeechResults(results, 0, "");
    expect(merged.final).toBe("nineteen fifty");
    expect(merged.display).toBe("nineteen fifty eight");
  });

  it("appends to prior final text from earlier events", () => {
    const results = mockResults([{ transcript: "seven", isFinal: true }]);
    const merged = mergeSpeechResults(results, 0, "nineteen fifty");
    expect(merged.final).toBe("nineteen fifty seven");
    expect(merged.display).toBe("nineteen fifty seven");
  });
});

describe("transcriptFromResults", () => {
  it("concatenates all result rows", () => {
    const results = mockResults([
      { transcript: "hello ", isFinal: true },
      { transcript: "world", isFinal: true },
    ]);
    expect(transcriptFromResults(results)).toBe("hello world");
  });
});
