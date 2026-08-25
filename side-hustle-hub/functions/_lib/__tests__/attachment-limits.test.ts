import { describe, expect, it } from "vitest";
import {
  ATTACHMENT_CHUNK_CHARS,
  ATTACHMENT_CHUNK_SENTINEL,
  ATTACHMENT_MAX_BYTES,
  VIDEO_ATTACHMENT_MAX_BYTES,
  isAttachmentChunkSentinel,
  isVideoAttachment,
  maxBytesForAttachment,
  needsAttachmentChunking,
  splitBase64ForD1,
} from "../attachment-limits";

describe("attachment limits", () => {
  it("allows 8MB for non-video and 20MB for video", () => {
    expect(ATTACHMENT_MAX_BYTES).toBe(8_000_000);
    expect(VIDEO_ATTACHMENT_MAX_BYTES).toBe(20_000_000);
    expect(maxBytesForAttachment("shot.png")).toBe(8_000_000);
    expect(maxBytesForAttachment("clip.mp4")).toBe(20_000_000);
    expect(maxBytesForAttachment("clip.webm", "video/webm")).toBe(20_000_000);
    expect(maxBytesForAttachment("doc.pdf")).toBe(8_000_000);
    expect(isVideoAttachment("a.MOV")).toBe(true);
    expect(isVideoAttachment("a.png")).toBe(false);
  });

  it("does not chunk payloads that fit in one D1 string", () => {
    const small = "a".repeat(1000);
    expect(needsAttachmentChunking(small)).toBe(false);
    expect(splitBase64ForD1(small)).toEqual([small]);
  });

  it("splits oversized base64 into D1-safe chunks", () => {
    const big = "b".repeat(ATTACHMENT_CHUNK_CHARS + 50);
    const parts = splitBase64ForD1(big);
    expect(parts.length).toBe(2);
    expect(parts[0]!.length).toBe(ATTACHMENT_CHUNK_CHARS);
    expect(parts[1]!.length).toBe(50);
    expect(parts.join("")).toBe(big);
    expect(needsAttachmentChunking(big)).toBe(true);
  });

  it("recognizes chunk sentinels", () => {
    expect(isAttachmentChunkSentinel(ATTACHMENT_CHUNK_SENTINEL)).toBe(true);
    expect(isAttachmentChunkSentinel(`${ATTACHMENT_CHUNK_SENTINEL}:3`)).toBe(true);
    expect(isAttachmentChunkSentinel("iVBORw0KGgo=")).toBe(false);
    expect(isAttachmentChunkSentinel("")).toBe(false);
  });
});
