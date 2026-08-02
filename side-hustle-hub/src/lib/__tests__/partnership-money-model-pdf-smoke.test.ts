import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../open-pdf", () => ({
  openPdfInBrowser: vi.fn(),
  reservePdfTab: vi.fn(() => null),
}));

import { openPdfInBrowser } from "../open-pdf";
import { downloadPartnershipMoneyModelPdf } from "../partnership-money-model-pdf";

describe("partnership money model PDF smoke", () => {
  beforeEach(() => {
    vi.mocked(openPdfInBrowser).mockClear();
  });

  it("builds partnership money model PDF without throwing", async () => {
    await downloadPartnershipMoneyModelPdf();
    expect(openPdfInBrowser).toHaveBeenCalledTimes(1);
    const doc = vi.mocked(openPdfInBrowser).mock.calls[0]![0] as { getNumberOfPages: () => number };
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(6);
  });
});
