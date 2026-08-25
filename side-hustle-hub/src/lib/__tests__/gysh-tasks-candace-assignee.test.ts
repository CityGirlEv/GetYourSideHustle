import { describe, expect, it } from "vitest";
import {
  PARTNER_ASSIGNEES,
  assigneeDisplayLabel,
  formatAssigneePeople,
  parseAssigneePeople,
} from "../gysh-tasks";

describe("partner assignees include Candace", () => {
  it("lists Candace with the other partners", () => {
    expect(PARTNER_ASSIGNEES).toEqual(["Tina", "Evelyn", "Lyriq", "Candace"]);
  });

  it("parses and formats Candace assignees", () => {
    expect(parseAssigneePeople("Candace")).toEqual(["Candace"]);
    expect(parseAssigneePeople("Candace Jackson")).toEqual(["Candace"]);
    expect(parseAssigneePeople("Tina+Candace")).toEqual(["Tina", "Candace"]);
    expect(formatAssigneePeople(["Candace"])).toBe("Candace");
    expect(formatAssigneePeople(["Tina", "Candace"])).toBe("Tina+Candace");
    expect(assigneeDisplayLabel("Tina+Candace")).toBe("Tina + Candace");
  });
});
