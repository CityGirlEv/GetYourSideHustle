import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { openPdfBlobInTab, preparePdfPreviewTab } from "@/lib/pdf-open";

describe("pdf-open", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "open",
      vi.fn(() => null),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preparePdfPreviewTab opens about:blank without noopener", () => {
    const mockTab = {
      closed: false,
      document: { title: "", body: { innerHTML: "" } },
      location: { href: "" },
      focus: vi.fn(),
    };
    vi.stubGlobal(
      "open",
      vi.fn((url: string, target: string, features?: string) => {
        expect(url).toBe("about:blank");
        expect(target).toBe("_blank");
        expect(features).toBeUndefined();
        return mockTab;
      }),
    );

    const tab = preparePdfPreviewTab();
    expect(tab).toBe(mockTab);
    expect(mockTab.document.title).toBe("Generating PDF…");
    expect(mockTab.document.body.innerHTML).toContain("Generating PDF");
  });

  it("openPdfBlobInTab navigates an existing tab to the blob URL", () => {
    const mockTab = {
      closed: false,
      location: { href: "" },
      focus: vi.fn(),
      close: vi.fn(),
    };
    const blob = new Blob(["pdf"], { type: "application/pdf" });
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    openPdfBlobInTab(mockTab as unknown as Window, blob, { fallbackFilename: "test.pdf" });

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(mockTab.location.href).toBe("blob:mock");
    expect(mockTab.focus).toHaveBeenCalled();
  });
});
