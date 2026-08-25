import { describe, expect, it } from "vitest";
import {
  buildAdminEntityTitleMap,
  buildAdminLinkCandidates,
} from "../admin-link-candidates";

describe("admin link candidates + titles", () => {
  it("builds title map from task description and test title", () => {
    const map = buildAdminEntityTitleMap({
      tasks: [{ id: "T-1", description: "Do the thing" }],
      tests: [{ id: "AUTH-001", title: "Login works" }],
      cfItems: [
        {
          id: "sl-demo",
          sprint: 3,
          day: "2026-08-10",
          channel: "website",
          title: "Demo CF",
          owner: "Tina",
          artifacts: [],
        },
      ],
    });
    expect(map.task?.["T-1"]).toBe("Do the thing");
    expect(map.test?.["AUTH-001"]).toBe("Login works");
    expect(map.cf?.["sl-demo"]).toBe("Demo CF");
  });

  it("includes descriptions in candidate labels", () => {
    const candidates = buildAdminLinkCandidates({
      tasks: [{ id: "T-2", description: "Write copy" }],
      tests: [{ id: "VIDEO-001", title: "Welcome video" }],
      cfItems: [],
    });
    expect(candidates.find((c) => c.id === "T-2")?.label).toContain("Write copy");
    expect(candidates.find((c) => c.id === "VIDEO-001")?.label).toContain("Welcome video");
  });
});
