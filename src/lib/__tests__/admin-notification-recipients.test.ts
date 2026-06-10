import { describe, it, expect } from "vitest";
import { DEFAULT_ADMIN_NOTIFICATION_EMAILS } from "@/lib/registration.functions";

describe("admin notification recipients", () => {
  it("routes registration alerts to info@MyPartB.com by default", () => {
    expect(DEFAULT_ADMIN_NOTIFICATION_EMAILS).toEqual(["info@MyPartB.com"]);
  });
});