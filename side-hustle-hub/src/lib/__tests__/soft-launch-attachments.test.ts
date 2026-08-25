import { describe, expect, it } from "vitest";
import {
  groupSoftLaunchAttachmentsByItem,
  isSoftLaunchImageFile,
  type SoftLaunchItemAttachment,
} from "../soft-launch-attachments";

describe("soft-launch image attachments", () => {
  it("accepts image mime, extensions, and PDFs", () => {
    expect(
      isSoftLaunchImageFile({ name: "art.png", type: "image/png" } as File),
    ).toBe(true);
    expect(
      isSoftLaunchImageFile({ name: "shot.JPG", type: "" } as File),
    ).toBe(true);
    expect(
      isSoftLaunchImageFile({ name: "notes.pdf", type: "application/pdf" } as File),
    ).toBe(true);
  });

  it("groups attachments by calendar item id", () => {
    const rows: SoftLaunchItemAttachment[] = [
      {
        id: "a1",
        itemId: "sl-s2-yt-create",
        name: "banner.png",
        mimeType: "image/png",
        size: 10,
        addedAt: "08/03/26",
      },
      {
        id: "a2",
        itemId: "sl-s2-yt-create",
        name: "icon.webp",
        mimeType: "image/webp",
        size: 20,
        addedAt: "08/03/26",
      },
      {
        id: "a3",
        itemId: "sl-s3-yt-first-short",
        name: "frame.jpg",
        mimeType: "image/jpeg",
        size: 30,
        addedAt: "08/03/26",
      },
    ];
    const grouped = groupSoftLaunchAttachmentsByItem(rows);
    expect(grouped["sl-s2-yt-create"]).toHaveLength(2);
    expect(grouped["sl-s3-yt-first-short"]).toHaveLength(1);
  });
});
