import { describe, expect, it } from "vitest";
import {
  attachmentMetaHasContent,
  PLAN_ATTACHMENT_LIST_COLUMNS,
  TASK_ATTACHMENT_LIST_COLUMNS,
} from "../attachment-meta";

describe("attachmentMetaHasContent", () => {
  it("treats size or stored_id as enough without reading file bytes", () => {
    expect(attachmentMetaHasContent({ size: 2048, stored_id: "" })).toBe(true);
    expect(attachmentMetaHasContent({ size: 0, stored_id: "att-1" })).toBe(true);
    expect(attachmentMetaHasContent({ size: 0, stored_id: "" })).toBe(false);
  });

  it("still honors an in-memory content_base64 when present", () => {
    expect(attachmentMetaHasContent({ size: 0, stored_id: "", content_base64: "abc" })).toBe(true);
  });
});

describe("list column lists", () => {
  it("omits content_base64 so list queries stay metadata-only", () => {
    expect(TASK_ATTACHMENT_LIST_COLUMNS).not.toContain("content_base64");
    expect(PLAN_ATTACHMENT_LIST_COLUMNS).not.toContain("content_base64");
    expect(TASK_ATTACHMENT_LIST_COLUMNS).toContain("task_id");
    expect(PLAN_ATTACHMENT_LIST_COLUMNS).toContain("plan_item_id");
  });
});
