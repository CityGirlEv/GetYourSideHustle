import { describe, it, expect } from "vitest";
import { z as zNamed } from "zod";
import * as zodNamespace from "zod";
const z = zNamed || (zodNamespace as any).z || (zodNamespace as any).default;
import { roleDestination, type UserRole } from "@/lib/role-destination";

/**
 * The Zod input shapes below MIRROR the validators on the server
 * functions in src/lib/admin.functions.ts and src/lib/registration.functions.ts.
 * Testing the shapes here gives us deterministic, fast coverage of every
 * "what can callers send?" rule without spinning up a real server.
 */
const ROLE_VALUES = ["admin", "qa", "agent", "editor", "client", "viewer", "advisor"] as const;
const roleSchema = z.enum(ROLE_VALUES);

const setUserDisabledSchema = z.object({
  user_id: z.string().uuid(),
  disabled: z.boolean(),
});

const createAdvisorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(128),
  full_name: z.string().min(1).max(255).optional(),
  role: roleSchema.optional(),
});

const updateUserSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().max(255).optional(),
  npn_number: z.string().max(64).optional().nullable(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(128).optional(),
});

const registerSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  signature_name: z.string().trim().min(3).max(255),
  accept_nda: z.literal(true),
  requested_role: z.enum(["qa", "agent"]),
  user_agent: z.string().max(1024).optional().nullable(),
  password: z.string().min(12).max(128),
  password_confirm: z.string().min(12).max(128),
});

const UUID = "11111111-1111-1111-1111-111111111111";

describe("post-login routing (roleDestination)", () => {
  it.each([
    ["admin", "/admin"],
    ["agent", "/agent"],
    ["qa", "/testing"],
    ["client", "/"],
    ["advisor", "/agent"],
    ["editor", "/agent"],
    ["viewer", "/agent"],
  ] as const)("%s → %s", (role, dest) => {
    expect(roleDestination(role as UserRole)).toBe(dest);
  });

  it("unknown / null / undefined fall back to /agent", () => {
    expect(roleDestination(null)).toBe("/agent");
    expect(roleDestination(undefined)).toBe("/agent");
    expect(roleDestination("nobody")).toBe("/agent");
  });
});

describe("admin: setUserDisabled validation (enable/disable account)", () => {
  it("accepts a valid enable payload", () => {
    expect(setUserDisabledSchema.parse({ user_id: UUID, disabled: false })).toEqual({
      user_id: UUID,
      disabled: false,
    });
  });
  it("accepts a valid disable payload", () => {
    expect(setUserDisabledSchema.parse({ user_id: UUID, disabled: true })).toBeTruthy();
  });
  it("rejects a non-uuid user_id", () => {
    expect(() => setUserDisabledSchema.parse({ user_id: "abc", disabled: true })).toThrow();
  });
  it("rejects a non-boolean disabled flag", () => {
    expect(() => setUserDisabledSchema.parse({ user_id: UUID, disabled: "yes" })).toThrow();
  });
});

describe("admin: createAdvisor validation", () => {
  it("accepts a minimal valid payload", () => {
    expect(createAdvisorSchema.parse({ email: "a@b.com", password: "abcdefghijkl" })).toBeTruthy();
  });
  it.each(ROLE_VALUES)("accepts role=%s", (role) => {
    expect(
      createAdvisorSchema.parse({ email: "a@b.com", password: "abcdefghijkl", role }),
    ).toBeTruthy();
  });
  it("rejects passwords shorter than 12 characters", () => {
    expect(() => createAdvisorSchema.parse({ email: "a@b.com", password: "short" })).toThrow();
  });
  it("rejects an invalid email", () => {
    expect(() =>
      createAdvisorSchema.parse({ email: "not-an-email", password: "abcdefghijkl" }),
    ).toThrow();
  });
  it("rejects an unknown role", () => {
    expect(() =>
      createAdvisorSchema.parse({
        email: "a@b.com",
        password: "abcdefghijkl",
        role: "superuser",
      }),
    ).toThrow();
  });
});

describe("admin: updateUser validation", () => {
  it("accepts an email-only patch", () => {
    expect(updateUserSchema.parse({ user_id: UUID, email: "x@y.com" })).toBeTruthy();
  });
  it("rejects passwords shorter than 8", () => {
    expect(() => updateUserSchema.parse({ user_id: UUID, password: "abc" })).toThrow();
  });
  it("allows clearing npn_number with null", () => {
    expect(updateUserSchema.parse({ user_id: UUID, npn_number: null }).npn_number).toBeNull();
  });
});

describe("registration: NDA-signed beta sign-up validation", () => {
  const valid = {
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    phone: "5551234567",
    signature_name: "Test User",
    accept_nda: true as const,
    requested_role: "qa" as const,
    user_agent: "vitest",
    password: "validpassword12",
    password_confirm: "validpassword12",
  };

  it("accepts a valid registration", () => {
    expect(registerSchema.parse(valid)).toBeTruthy();
  });
  it("rejects unchecked NDA (accept_nda must be literal true)", () => {
    expect(() => registerSchema.parse({ ...valid, accept_nda: false })).toThrow();
  });
  it("rejects an invalid email", () => {
    expect(() => registerSchema.parse({ ...valid, email: "nope" })).toThrow();
  });
  it("rejects a too-short phone number", () => {
    expect(() => registerSchema.parse({ ...valid, phone: "123" })).toThrow();
  });
  it("rejects a signature shorter than 3 chars", () => {
    expect(() => registerSchema.parse({ ...valid, signature_name: "AB" })).toThrow();
  });
  it("only permits 'qa' or 'agent' as requested role (not 'admin')", () => {
    expect(() => registerSchema.parse({ ...valid, requested_role: "admin" })).toThrow();
    expect(registerSchema.parse({ ...valid, requested_role: "agent" })).toBeTruthy();
  });
  it("trims whitespace on names + email", () => {
    const parsed = registerSchema.parse({ ...valid, first_name: "  Jamie  ", email: "  j@x.com " });
    expect(parsed.first_name).toBe("Jamie");
    expect(parsed.email).toBe("j@x.com");
  });
  it("accepts registration with matching password fields", () => {
    expect(
      registerSchema.parse({
        ...valid,
        password: "validpassword12",
        password_confirm: "validpassword12",
      }),
    ).toBeTruthy();
  });
  it("rejects passwords shorter than 12 characters", () => {
    expect(() =>
      registerSchema.parse({ ...valid, password: "short", password_confirm: "short" }),
    ).toThrow();
  });
  it("rejects registration without password", () => {
    const { password, ...withoutPassword } = valid;
    expect(() => registerSchema.parse(withoutPassword)).toThrow();
  });
  it("rejects registration without password_confirm", () => {
    const { password_confirm, ...withoutConfirm } = valid;
    expect(() => registerSchema.parse(withoutConfirm)).toThrow();
  });
});
