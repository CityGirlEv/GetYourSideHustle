import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../open-pdf", () => ({
  openPdfInBrowser: vi.fn(),
  reservePdfTab: vi.fn(() => null),
}));

import { openPdfInBrowser } from "../open-pdf";
import { downloadMarketingGuidePdf } from "../user-guide-pdf";

describe("marketing PDF smoke", () => {
  beforeEach(() => {
    vi.mocked(openPdfInBrowser).mockClear();
  });

  it("builds adult marketing PDF without throwing", async () => {
    await downloadMarketingGuidePdf("adult", {});
    expect(openPdfInBrowser).toHaveBeenCalledTimes(1);
    const doc = vi.mocked(openPdfInBrowser).mock.calls[0]![0] as { getNumberOfPages: () => number };
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
  });
});
