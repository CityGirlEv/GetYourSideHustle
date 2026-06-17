import type { ContentDraftStatus } from "@/lib/content-factory/types";

const ALLOWED_TRANSITIONS: Record<ContentDraftStatus, ContentDraftStatus[]> = {
  draft: ["pending_review", "approved", "rejected"],
  pending_review: ["draft", "approved", "rejected"],
  approved: ["pending_review", "scheduled", "published", "rejected"],
  scheduled: ["approved", "published", "rejected"],
  published: [],
  rejected: ["draft"],
};

export function canTransitionDraftStatus(
  from: ContentDraftStatus,
  to: ContentDraftStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertDraftStatusTransition(
  from: ContentDraftStatus,
  to: ContentDraftStatus,
): void {
  if (!canTransitionDraftStatus(from, to)) {
    throw new Error(`Cannot move draft from ${from} to ${to}`);
  }
}

export function actionToStatus(action: "approve" | "reject" | "publish" | "review" | "schedule"): ContentDraftStatus {
  switch (action) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "publish":
      return "published";
    case "review":
      return "pending_review";
    case "schedule":
      return "scheduled";
  }
}

export function validateDraftEdit(status: ContentDraftStatus): void {
  if (status === "published") {
    throw new Error("Published drafts cannot be edited. Create a new draft instead.");
  }
}

export function validateDraftPublish(status: ContentDraftStatus): void {
  if (status !== "approved" && status !== "scheduled") {
    throw new Error("Only approved or scheduled drafts can be published.");
  }
}
