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
        { name: "a.png", metadata: { size: 100 }, updated_at: "2026-01-01", created_at: "2026-01-01" },
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
    const file = new File(["hi"], "weird name!.png", { type: "image/png" });
    const r = await uploadTestEvidence("u", "t", file);
    expect(storage.upload).toHaveBeenCalled();
    expect(r.name).toBe("weird_name_.png");
    expect(r.path).toMatch(/u\/t\/\d+-weird_name_\.png/);
  });

  it("throws on upload error", async () => {
    storage.upload.mockResolvedValue({ error: { message: "bad" } });
    await expect(uploadTestEvidence("u", "t", new File(["x"], "x.png"))).rejects.toThrow("bad");
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