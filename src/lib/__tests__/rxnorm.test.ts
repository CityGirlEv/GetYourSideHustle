import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchRxNorm, getGenericFor } from "../rxnorm";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("searchRxNorm", () => {
  it("returns [] for short terms", async () => {
    expect(await searchRxNorm("ab")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("dedupes by lowercased name and limits results", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        approximateGroup: {
          candidate: [
            { rxcui: "1", name: "Atorvastatin", score: "100" },
            { rxcui: "2", name: "atorvastatin", score: "90" },
            { rxcui: "3", name: "Lipitor", score: "80" },
          ],
        },
      }),
    });
    const r = await searchRxNorm("atorva", 2);
    expect(r).toHaveLength(2);
    expect(r[0].name).toBe("Atorvastatin");
    expect(r[1].name).toBe("Lipitor");
  });

  it("returns [] on non-ok response", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    expect(await searchRxNorm("aspirin")).toEqual([]);
  });

  it("returns [] on fetch error", async () => {
    fetchMock.mockRejectedValue(new Error("net"));
    expect(await searchRxNorm("aspirin")).toEqual([]);
  });
});

describe("getGenericFor", () => {
  it("returns generic name when IN group present", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        relatedGroup: {
          conceptGroup: [
            { tty: "IN", conceptProperties: [{ name: "atorvastatin" }] },
          ],
        },
      }),
    });
    const r = await getGenericFor("123");
    expect(r.generic).toBe("atorvastatin");
    expect(r.noGenericAvailable).toBe(false);
  });

  it("flags noGenericAvailable when IN empty", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ relatedGroup: { conceptGroup: [] } }),
    });
    expect(await getGenericFor("1")).toEqual({ noGenericAvailable: true });
  });

  it("returns safe default on error", async () => {
    fetchMock.mockRejectedValue(new Error("x"));
    expect(await getGenericFor("1")).toEqual({ noGenericAvailable: false });
  });
});