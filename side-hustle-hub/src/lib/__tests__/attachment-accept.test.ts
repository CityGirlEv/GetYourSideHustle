import { describe, expect, it } from "vitest";
import { ACCEPT_ATTACHMENTS, isAcceptedAttachment } from "../gysh-tasks";
import { TEST_EVIDENCE_ACCEPT } from "../gysh-test-plan";
import {
  SOFT_LAUNCH_MEDIA_ACCEPT,
  isSoftLaunchMediaFile,
  isSoftLaunchPdfAttachment,
} from "../soft-launch-attachments";

function fakeFile(name: string, type: string): File {
  return { name, type } as File;
}

describe("attachment accept lists include PDF", () => {
  it("lets tasks, tests, and Content Factory pick .pdf", () => {
    expect(ACCEPT_ATTACHMENTS).toMatch(/\.pdf/);
    expect(ACCEPT_ATTACHMENTS).toMatch(/application\/pdf/);
    expect(TEST_EVIDENCE_ACCEPT).toMatch(/\.pdf/);
    expect(TEST_EVIDENCE_ACCEPT).toMatch(/application\/pdf/);
    expect(SOFT_LAUNCH_MEDIA_ACCEPT).toMatch(/\.pdf/);
    expect(SOFT_LAUNCH_MEDIA_ACCEPT).toMatch(/application\/pdf/);
  });

  it("accepts PDF files on tasks and Content Factory", () => {
    expect(isAcceptedAttachment(fakeFile("brief.pdf", "application/pdf"))).toBe(true);
    expect(isAcceptedAttachment(fakeFile("brief.PDF", ""))).toBe(true);
    expect(isSoftLaunchMediaFile(fakeFile("brief.pdf", "application/pdf"))).toBe(true);
    expect(isSoftLaunchMediaFile(fakeFile("brief.PDF", ""))).toBe(true);
    expect(isSoftLaunchPdfAttachment("application/pdf", "brief.pdf")).toBe(true);
    expect(isSoftLaunchPdfAttachment("image/png", "art.png")).toBe(false);
  });
});
