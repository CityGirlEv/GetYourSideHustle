import { describe, expect, it } from "vitest";
import {
  ADMIN_MENU_GROUPS,
  ADMIN_TABS,
  ADMIN_USER_GUIDE_LINKS,
  adminGuideSiteMapId,
  adminTabSiteMapId,
} from "../admin-nav";
import {
  JUNIOR_CORNER_TABS,
  KIDS_CORNER_TABS,
  MATCH_WIZARD_AGES,
  SENIOR_CORNER_TABS,
} from "../audience-nav";
import { MARKETING_GUIDE_MENU } from "../marketing-guides";
import {
  GYSH_ADMIN_MAP,
  GYSH_PUBLIC_MAP,
  GYSH_SITE_MAP,
  adminTabsInMenuGroups,
  collectSiteMapIds,
  hrefForSiteMapNode,
} from "../site-map";

describe("site-map stays in sync with nav sources", () => {
  it("admin diagram groups match ADMIN_MENU_GROUPS order and labels", () => {
    const groups = GYSH_ADMIN_MAP.children ?? [];
    expect(groups.map((g) => g.label)).toEqual(ADMIN_MENU_GROUPS.map((g) => g.label));
    expect(groups.map((g) => g.id)).toEqual(ADMIN_MENU_GROUPS.map((g) => `adm-${g.id}`));

    for (const group of ADMIN_MENU_GROUPS) {
      const node = groups.find((g) => g.id === `adm-${group.id}`);
      expect(node?.children?.map((c) => c.id)).toEqual(group.tabs.map(adminTabSiteMapId));
      expect(node?.children?.map((c) => c.label)).toEqual(
        group.tabs.map((id) => ADMIN_TABS.find((t) => t.id === id)?.label),
      );
    }
  });

  it("every ADMIN_TABS entry appears in a menu group exactly once", () => {
    const inGroups = adminTabsInMenuGroups();
    expect(new Set(inGroups).size).toBe(inGroups.length);
    expect([...inGroups].sort()).toEqual([...ADMIN_TABS.map((t) => t.id)].sort());
  });

  it("User Guides leaves match ADMIN_USER_GUIDE_LINKS", () => {
    const guidesNode = (GYSH_ADMIN_MAP.children ?? [])
      .flatMap((g) => g.children ?? [])
      .find((n) => n.id === adminTabSiteMapId("user-guides"));
    expect(guidesNode?.children?.map((c) => c.id)).toEqual(
      ADMIN_USER_GUIDE_LINKS.map((g) => adminGuideSiteMapId(g.id)),
    );
    expect(guidesNode?.children?.map((c) => c.label)).toEqual(
      ADMIN_USER_GUIDE_LINKS.map((g) => g.label),
    );
  });

  it("Guides menu manuals match MARKETING_GUIDE_MENU", () => {
    const guides = (GYSH_PUBLIC_MAP.children ?? []).find((n) => n.id === "nav-guides");
    const childIds = (guides?.children ?? []).map((c) => c.id);
    expect(childIds[0]).toBe("guides-library");
    expect(childIds.slice(1)).toEqual(
      MARKETING_GUIDE_MENU.map((g) => (g.id === "master" ? "guides-complete" : `guides-${g.id}`)),
    );
    expect((guides?.children ?? []).slice(1).map((c) => c.label)).toEqual(
      MARKETING_GUIDE_MENU.map((g) => g.label),
    );
  });

  it("Kids / Teens / Seniors tabs match audience-nav", () => {
    const kidsMenu = (GYSH_PUBLIC_MAP.children ?? []).find((n) => n.id === "nav-kids");
    const kidsMode = (kidsMenu?.children ?? []).find((n) => n.id === "kids-mode");
    const teensMode = (kidsMenu?.children ?? []).find((n) => n.id === "teens-mode");
    expect(kidsMode?.children?.map((c) => c.label)).toEqual(KIDS_CORNER_TABS.map((t) => t.label));
    expect(teensMode?.children?.map((c) => c.label)).toEqual(JUNIOR_CORNER_TABS.map((t) => t.label));

    const seniors = (GYSH_PUBLIC_MAP.children ?? []).find((n) => n.id === "nav-seniors");
    expect(seniors?.children?.map((c) => c.label)).toEqual(SENIOR_CORNER_TABS.map((t) => t.label));

    const match = (GYSH_PUBLIC_MAP.children ?? []).find((n) => n.id === "nav-match");
    expect(match?.children?.map((c) => c.id)).toEqual(MATCH_WIZARD_AGES.map((a) => a.id));
  });

  it("every navigable site-map id has an href (except structural roots)", () => {
    const skip = new Set(["root"]);
    const ids = collectSiteMapIds(GYSH_SITE_MAP).filter((id) => !skip.has(id));
    const missing = ids.filter((id) => hrefForSiteMapNode(id) == null);
    expect(missing).toEqual([]);
  });

  it("admin tab hrefs point at the same AdminTab id", () => {
    for (const tab of ADMIN_TABS) {
      const href = hrefForSiteMapNode(adminTabSiteMapId(tab.id));
      expect(href).toEqual({ kind: "admin", tab: tab.id });
    }
  });
});
