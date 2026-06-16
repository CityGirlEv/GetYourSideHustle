import { describe, it, expect } from "vitest";
import { DEFAULT_ADMIN_NOTIFICATION_EMAILS } from "@/lib/registration.functions";

describe("admin notification recipients", () => {
  it("routes registration alerts to the default admin inboxes", () => {
    expect(DEFAULT_ADMIN_NOTIFICATION_EMAILS).toEqual([
      "evelyn3@cox.net",
      "sharpebanker@yahoo.com",
      "info@mypartb.com",
      "getpartb@gmail.com",
    ]);
  });
});
