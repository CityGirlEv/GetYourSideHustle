import { describe, it, expect } from "vitest";
import { computeTestOwners } from "../test-owners";

describe("computeTestOwners", () => {
  it("returns just the primary QA when not failed", () => {
    expect(computeTestOwners({ primary: "Lyriq", status: "not_run" })).toEqual(["Lyriq"]);
    expect(computeTestOwners({ primary: "Lyriq", status: "pass" })).toEqual(["Lyriq"]);
    expect(computeTestOwners({ primary: "Lyriq", status: "in_progress" })).toEqual(["Lyriq"]);
  });
  it("co-owns failed tests with Eng alongside the QA", () => {
    expect(computeTestOwners({ primary: "Lyriq", status: "fail" })).toEqual(["Lyriq", "Eng"]);
    expect(computeTestOwners({ primary: "Catria", status: "failed_retest" })).toEqual(["Catria", "Eng"]);
  });
  it("does not duplicate Eng when the primary owner is already Eng", () => {
    expect(computeTestOwners({ primary: "Eng", status: "fail" })).toEqual(["Eng"]);
  });
  it("does not add Eng to Unassigned failing tests", () => {
    expect(computeTestOwners({ primary: "Unassigned", status: "fail" })).toEqual(["Unassigned"]);
  });
  it("does not add Eng to automated failing tests", () => {
    expect(computeTestOwners({ primary: "Vitest", status: "fail", isAutomated: true })).toEqual(["Vitest"]);
  });
});