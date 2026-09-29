import { describe, expect, it } from "vitest";
import { BETA_PROGRAM_DOC_TITLE, BETA_PROGRAM_SECTIONS } from "../beta-program-doc";
import { buildBetaProgramWordHtml } from "../beta-program-word";
import { downloadBetaProgramPdf } from "../beta-program-pdf";
import { openPdfInBrowser } from "../open-pdf";
import { vi } from "vitest";

vi.mock("../open-pdf", () => ({
  openPdfInBrowser: vi.fn(),
  reservePdfTab: vi.fn(() => null),
}));

describe("beta program document", () => {
  it("is an executive briefing with scoring and a points-board section", () => {
    expect(BETA_PROGRAM_DOC_TITLE).toBe("GYSH Beta Testing Program");
    const ids = BETA_PROGRAM_SECTIONS.map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(["purpose", "scoring", "points-board", "fair-play"]));
    const word = buildBetaProgramWordHtml();
    expect(word).toContain("mso-header");
    expect(word).toContain("mso-footer");
    expect(word).toContain("GYSH Beta Testing Program");
    expect(word).toContain("Re-test bonus");
    expect(word).toContain("/beta-points");
  });

  it("builds a PDF without throwing", async () => {
    vi.mocked(openPdfInBrowser).mockClear();
    await downloadBetaProgramPdf(null);
    expect(openPdfInBrowser).toHaveBeenCalledTimes(1);
    const doc = vi.mocked(openPdfInBrowser).mock.calls[0]![0] as { getNumberOfPages: () => number };
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
});
