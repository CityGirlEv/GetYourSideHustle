const PNG_HEAD = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0,
]);
function pngFile(name: string) {
  return new File([PNG_HEAD], name, { type: "image/png" });
}
import { describe, it, expect, vi, beforeEach } from "vitest";

const storage = {
  list: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  createSignedUrl: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { storage: { from: () => storage } },
}));

import {
  listTestEvidence,
  uploadTestEvidence,
  deleteTestEvidence,
  getTestEvidenceUrl,
  TEST_EVIDENCE_BUCKET,
  validateEvidenceFile,
  prepareEvidenceFile,
  EVIDENCE_MAX_BYTES,
} from "../test-evidence";

beforeEach(() => {
  Object.values(storage).forEach((fn) => fn.mockReset());
});

describe("test-evidence", () => {
  it("exposes bucket name", () => {
    expect(TEST_EVIDENCE_BUCKET).toBe("test-evidence");
  });

  it("lists and maps files", async () => {
    storage.list.mockResolvedValue({
      data: [
        {
          name: "a.png",
          metadata: { size: 100 },
          updated_at: "2026-01-01",
          created_at: "2026-01-01",
        },
        { name: "sub/", metadata: null, updated_at: "", created_at: "" },
      ],
      error: null,
    });
    const r = await listTestEvidence("user1", "T1");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ name: "a.png", path: "user1/T1/a.png", size: 100 });
  });

  it("returns [] on list error", async () => {
    storage.list.mockResolvedValue({ data: null, error: { message: "x" } });
    expect(await listTestEvidence("u", "t")).toEqual([]);
  });

  it("uploads with sanitized name", async () => {
    storage.upload.mockResolvedValue({ error: null });
    const file = pngFile("weird name!.png");
    const r = await uploadTestEvidence("u", "t", file);
    expect(storage.upload).toHaveBeenCalled();
    expect(r.name).toBe("weird_name_.png");
    expect(r.path).toMatch(/u\/t\/\d+-weird_name_\.png/);
  });

  it("throws on upload error", async () => {
    storage.upload.mockResolvedValue({ error: { message: "bad" } });
    await expect(uploadTestEvidence("u", "t", pngFile("x.png"))).rejects.toThrow("bad");
  });

  it("deletes a file", async () => {
    storage.remove.mockResolvedValue({ error: null });
    await deleteTestEvidence("u/t/x.png");
    expect(storage.remove).toHaveBeenCalledWith(["u/t/x.png"]);
  });

  it("throws on delete error", async () => {
    storage.remove.mockResolvedValue({ error: { message: "no" } });
    await expect(deleteTestEvidence("p")).rejects.toThrow("no");
  });

  it("returns signed url", async () => {
    storage.createSignedUrl.mockResolvedValue({ data: { signedUrl: "https://x" }, error: null });
    expect(await getTestEvidenceUrl("p")).toBe("https://x");
  });

  it("returns null when signed url fails", async () => {
    storage.createSignedUrl.mockResolvedValue({ data: null, error: { message: "x" } });
    expect(await getTestEvidenceUrl("p")).toBeNull();
  });
});

describe("validateEvidenceFile (security gate)", () => {
  const make = (bytes: number[], name: string, type = "") =>
    new File([new Uint8Array(bytes)], name, { type });

  it("accepts a real PNG", async () => {
    await expect(validateEvidenceFile(pngFile("ok.png"))).resolves.toBeUndefined();
  });

  it("rejects empty files", async () => {
    await expect(
      validateEvidenceFile(new File([], "x.png", { type: "image/png" })),
    ).rejects.toThrow(/empty/i);
  });

  it("rejects files over 20 MB", async () => {
    const big = new File([new Uint8Array(EVIDENCE_MAX_BYTES + 1)], "big.png", {
      type: "image/png",
    });
    await expect(validateEvidenceFile(big)).rejects.toThrow(/20 MB/);
  });

  it("rejects disallowed extensions (.exe, .html, .svg, .zip, .js)", async () => {
    for (const ext of ["exe", "html", "svg", "zip", "js"]) {
      await expect(
        validateEvidenceFile(make([0x89, 0x50, 0x4e, 0x47], `bad.${ext}`)),
      ).rejects.toThrow();
    }
  });

  it("rejects PNG extension with non-PNG magic bytes (spoofed)", async () => {
    // ".png" extension but payload is HTML — magic-byte sniff must catch it.
    const html = make([0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e], "fake.png", "image/png");
    await expect(validateEvidenceFile(html)).rejects.toThrow(/do not match/i);
  });

  it("rejects disallowed MIME even with allowed extension", async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "x.png", {
      type: "application/x-msdownload",
    });
    await expect(validateEvidenceFile(file)).rejects.toThrow(/MIME/);
  });

  it("accepts a PDF by magic bytes", async () => {
    const pdf = make([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34], "r.pdf", "application/pdf");
    await expect(validateEvidenceFile(pdf)).resolves.toBeUndefined();
  });

  it("accepts a plain-text log", async () => {
    const log = new File(["hello log\n"], "out.log", { type: "text/plain" });
    await expect(validateEvidenceFile(log)).resolves.toBeUndefined();
  });

  it("accepts a DOCX by ZIP magic bytes", async () => {
    const docx = make([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0], "brief.docx", "application/zip");
    await expect(validateEvidenceFile(docx)).resolves.toBeUndefined();
  });

  it("accepts an XLSX by ZIP magic bytes", async () => {
    const xlsx = make(
      [0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0],
      "sheet.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    await expect(validateEvidenceFile(xlsx)).resolves.toBeUndefined();
  });

  it("accepts legacy XLS by OLE magic bytes", async () => {
    const xls = make(
      [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0],
      "legacy.xls",
      "application/vnd.ms-excel",
    );
    await expect(validateEvidenceFile(xls)).resolves.toBeUndefined();
  });

  it("rejects ZIP files without an allowed Office extension", async () => {
    const zip = make([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0], "payload.zip", "application/zip");
    await expect(validateEvidenceFile(zip)).rejects.toThrow();
  });

  it("accepts PNG when the browser sends application/octet-stream", async () => {
    const file = new File([PNG_HEAD], "Screenshot.png", { type: "application/octet-stream" });
    await expect(validateEvidenceFile(file)).resolves.toBeUndefined();
  });

  it("accepts JPEG with image/jpg MIME", async () => {
    const jpeg = make([0xff, 0xd8, 0xff, 0xe0, 0, 0x10], "photo.jpg", "image/jpg");
    await expect(validateEvidenceFile(jpeg)).resolves.toBeUndefined();
  });

  it("accepts screenshots without a file extension when bytes are PNG", async () => {
    const file = new File([PNG_HEAD], "Screenshot", { type: "" });
    const prepared = await prepareEvidenceFile(file);
    expect(prepared.ext).toBe("png");
    expect(prepared.safeName).toBe("Screenshot.png");
  });
});
