import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adminMarkdownLink,
  adminStudioPath,
  adminStudioUrl,
  contentFactoryItemUrl,
  navigateAdminDeepLink,
  readAdminDeepLink,
} from "../admin-deep-links";

describe("admin-deep-links", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads tab, task, test, and Content Factory item from the query string", () => {
    expect(readAdminDeepLink("?tab=testing&test=VIDEO-003")).toEqual({
      tab: "testing",
      testId: "VIDEO-003",
    });
    expect(readAdminDeepLink("?task=T-SL-S3-YT-FIRST-SHORT")).toEqual({
      tab: "tasks",
      taskId: "T-SL-S3-YT-FIRST-SHORT",
    });
    expect(
      readAdminDeepLink("?tab=factory&panel=launch-plan&item=sl-s3-yt-first-short"),
    ).toEqual({
      tab: "factory",
      panel: "launch-plan",
      itemId: "sl-s3-yt-first-short",
    });
    expect(readAdminDeepLink("?item=sl-s3-yt-first-short")).toEqual({
      tab: "factory",
      panel: "launch-plan",
      itemId: "sl-s3-yt-first-short",
    });
    expect(readAdminDeepLink("?tab=email&template=welcome_free")).toEqual({
      tab: "email",
      template: "welcome_free",
    });
    expect(readAdminDeepLink("?template=registration_confirmation")).toEqual({
      tab: "email",
      template: "registration_confirmation",
    });
  });

  it("builds absolute and relative Admin Studio URLs", () => {
    expect(
      adminStudioUrl({
        tab: "tasks",
        taskId: "T-022",
        origin: "https://example.test",
      }),
    ).toBe("https://example.test/admin?tab=tasks&task=T-022");
    expect(adminStudioPath({ tab: "testing", testId: "AUTH-001" })).toBe(
      "/admin?tab=testing&test=AUTH-001",
    );
    expect(contentFactoryItemUrl("sl-s3-yt-first-short", "https://example.test")).toBe(
      "https://example.test/admin?tab=factory&panel=launch-plan&item=sl-s3-yt-first-short",
    );
    expect(adminStudioPath({ tab: "email", template: "welcome_pro" })).toBe(
      "/admin?tab=email&template=welcome_pro",
    );
  });

  it("reads Financials payments sub-tab", () => {
    expect(readAdminDeepLink("?tab=financials&sub=payments")).toEqual({
      tab: "financials",
      sub: "payments",
    });
  });

  it("navigates in-SPA and notifies AdminPortal via custom event", () => {
    const pushState = vi.fn();
    const dispatchEvent = vi.fn();
    class FakePopStateEvent {
      type: string;
      constructor(type: string) {
        this.type = type;
      }
    }
    class FakeCustomEvent {
      type: string;
      detail: unknown;
      constructor(type: string, init?: { detail?: unknown }) {
        this.type = type;
        this.detail = init?.detail;
      }
    }
    vi.stubGlobal("PopStateEvent", FakePopStateEvent);
    vi.stubGlobal("CustomEvent", FakeCustomEvent);
    vi.stubGlobal("window", {
      location: {
        pathname: "/admin",
        search: "?tab=tasks",
        hash: "",
        href: "https://example.test/admin?tab=tasks",
      },
      history: { pushState },
      dispatchEvent,
    });

    navigateAdminDeepLink({ tab: "testing", testId: "VIDEO-003" });

    expect(pushState).toHaveBeenCalledWith(
      { view: "admin", adminDeepLink: true },
      "",
      "/admin?tab=testing&test=VIDEO-003",
    );
    expect(dispatchEvent).toHaveBeenCalled();
  });
});
