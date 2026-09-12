import { describe, expect, it } from "vitest";
import {
  canManageGuideNote,
  formatPendingStatusGuideNoteBody,
  GUIDE_NOTE_ATTACHMENT_MAX_BYTES,
  guideNoteAttachmentMaxMbLabel,
  validateGuideNoteAttachment,
} from "../guide-notes";
import type { DbUser } from "../auth";

function user(partial: Partial<DbUser> & Pick<DbUser, "id" | "role">): DbUser {
  return {
    name: partial.name ?? "Test",
    email: partial.email ?? "test@example.com",
    roles: partial.roles ?? null,
    status: partial.status ?? "active",
    joined_at: partial.joined_at ?? "",
    notes: partial.notes ?? "",
    password_hash: partial.password_hash ?? "",
    password_salt: partial.password_salt ?? "",
    ...partial,
  };
}

describe("guide-notes", () => {
  it("allows a generous 25MB attachment ceiling", () => {
    expect(GUIDE_NOTE_ATTACHMENT_MAX_BYTES).toBe(25_000_000);
    expect(guideNoteAttachmentMaxMbLabel()).toBe("25");
  });

  it("rejects unsupported types", () => {
    expect(
      validateGuideNoteAttachment({
        name: "notes.exe",
        mimeType: "application/octet-stream",
        contentBase64: btoa("hi"),
      }).ok,
    ).toBe(false);
  });

  it("accepts a small pdf-like upload", () => {
    const result = validateGuideNoteAttachment({
      name: "brief.pdf",
      mimeType: "application/pdf",
      contentBase64: btoa("%PDF-1.4 hello"),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.size).toBeGreaterThan(0);
  });

  it("lets authors manage their notes and admins manage anyone’s", () => {
    const member = user({ id: "u-1", role: "adult", roles: JSON.stringify(["adult"]) });
    const other = user({ id: "u-2", role: "adult", roles: JSON.stringify(["adult"]) });
    const admin = user({ id: "u-admin", role: "admin", roles: JSON.stringify(["admin"]) });

    expect(canManageGuideNote(member, "u-1")).toBe(true);
    expect(canManageGuideNote(member, "u-2")).toBe(false);
    expect(canManageGuideNote(other, "u-1")).toBe(false);
    expect(canManageGuideNote(admin, "u-1")).toBe(true);
    expect(canManageGuideNote(admin, "u-2")).toBe(true);
  });

  it("formats Pending popup notes for the guide Notes tab", () => {
    expect(formatPendingStatusGuideNoteBody("  ")).toBe("");
    expect(formatPendingStatusGuideNoteBody("Needs clearer pricing")).toBe(
      "[Pending / Needs Further Review]\nNeeds clearer pricing",
    );
  });
});
