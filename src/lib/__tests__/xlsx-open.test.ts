import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { openXlsxBlobInTab, prepareXlsxPreviewTab } from "@/lib/xlsx-open";

describe("xlsx-open", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "open",
      vi.fn(() => null),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prepareXlsxPreviewTab opens about:blank without noopener", () => {
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

    const tab = prepareXlsxPreviewTab();
    expect(tab).toBe(mockTab);
    expect(mockTab.document.title).toBe("Preparing Excel…");
    expect(mockTab.document.body.innerHTML).toContain("Preparing Excel");
  });

  it("openXlsxBlobInTab navigates an existing tab to the blob URL", () => {
    const mockTab = {
      closed: false,
      location: { href: "" },
      focus: vi.fn(),
      close: vi.fn(),
    };
    const blob = new Blob(["xlsx"], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    openXlsxBlobInTab(mockTab as unknown as Window, blob, { fallbackFilename: "test.xlsx" });

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(mockTab.location.href).toBe("blob:mock");
    expect(mockTab.focus).toHaveBeenCalled();
  });
});
