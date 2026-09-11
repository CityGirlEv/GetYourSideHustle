import { describe, expect, it } from "vitest";
import {
  parseAppRoute,
  pathForView,
  viewRequiresMemberLogin,
} from "../app-routes";

describe("viewRequiresMemberLogin", () => {
  it("gates My Dashboard and its aliases", () => {
    expect(viewRequiresMemberLogin("user_portal")).toBe(true);
    expect(parseAppRoute("/my-dashboard").view).toBe("user_portal");
    expect(parseAppRoute("/portal").view).toBe("user_portal");
    expect(parseAppRoute("/dashboard").view).toBe("user_portal");
    expect(pathForView("user_portal")).toBe("/my-dashboard");
    expect(parseAppRoute("/shop").view).toBe("shop");
    expect(pathForView("shop")).toBe("/shop");
  });

  it("leaves public pages and Sign in open to guests", () => {
    expect(viewRequiresMemberLogin("login")).toBe(false);
    expect(viewRequiresMemberLogin("dashboard")).toBe(false);
    expect(viewRequiresMemberLogin("join")).toBe(false);
    expect(viewRequiresMemberLogin("admin")).toBe(false);
    expect(viewRequiresMemberLogin("guides")).toBe(false);
  });

  it("lands the site root on Home (dashboard view)", () => {
    expect(parseAppRoute("/").view).toBe("dashboard");
    expect(parseAppRoute("").view).toBe("dashboard");
    expect(parseAppRoute("/unknown-path").view).toBe("dashboard");
    expect(pathForView("dashboard")).toBe("/");
  });

  it("does not gate Guides library — browse is public; unlock still needs Free+ registration", () => {
    expect(viewRequiresMemberLogin("guides")).toBe(false);
  });
});
