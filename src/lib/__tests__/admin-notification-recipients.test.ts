import { describe, it, expect } from "vitest";
import { DEFAULT_ADMIN_NOTIFICATION_EMAILS } from "@/lib/registration.functions";

describe("admin notification recipients", () => {
  it("routes registration alerts to getpartb@gmail.com by default", () => {
    expect(DEFAULT_ADMIN_NOTIFICATION_EMAILS).toEqual(["getpartb@gmail.com"]);
  });
});