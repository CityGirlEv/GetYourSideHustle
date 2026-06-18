import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ContentDispatchChannel =
  | "newsletter"
  | "facebook_post"
  | "article"
  | "lead_magnet"
  | "broadcast";

export type ContentDispatchKind = "test" | "scheduled" | "publish" | "broadcast";

export type ContentDispatchStatus = "pending" | "queued" | "sent" | "failed" | "cancelled";

export interface ContentDispatchLogEntry {
  id: string;
  channel: ContentDispatchChannel;
  dispatchKind: ContentDispatchKind;
  draftId: string | null;
  batchId: string | null;
  recipient: string | null;
  subject: string;
  templateLabel: string;
  bodyPreview: string | null;
  bodyHash: string | null;
  messageId: string | null;
  status: ContentDispatchStatus;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  sentBy: string | null;
  createdAt: string;
}

export interface ContentDraftVersionEntry {
  id: string;
  draftId: string;
  snapshot: {
    title?: string;
    excerpt?: string;
    body?: string;
    status?: string;
  };
  createdBy: string | null;
  createdAt: string;
}

type DispatchRow = {
  id: string;
  channel: string;
  dispatch_kind: string;
  draft_id: string | null;
  batch_id: string | null;
  recipient: string | null;
  subject: string;
  template_label: string;
  body_preview: string | null;
  body_hash: string | null;
  message_id: string | null;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  sent_by: string | null;
  created_at: string;
};

type VersionRow = {
  id: string;
  draft_id: string;
  snapshot: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

function mapDispatchRow(row: DispatchRow): ContentDispatchLogEntry {
  return {
    id: row.id,
    channel: row.channel as ContentDispatchChannel,
    dispatchKind: row.dispatch_kind as ContentDispatchKind,
    draftId: row.draft_id,
    batchId: row.batch_id,
    recipient: row.recipient,
    subject: row.subject,
    templateLabel: row.template_label,
    bodyPreview: row.body_preview,
    bodyHash: row.body_hash,
    messageId: row.message_id,
    status: row.status as ContentDispatchStatus,
    errorMessage: row.error_message,
    metadata: row.metadata ?? {},
    sentBy: row.sent_by,
    createdAt: row.created_at,
  };
}

export async function insertContentDispatchLog(input: {
  channel: ContentDispatchChannel;
  dispatchKind: ContentDispatchKind;
  draftId?: string | null;
  batchId?: string | null;
  recipient?: string | null;
  subject: string;
  templateLabel: string;
  bodyPreview?: string | null;
  bodyHash?: string | null;
  messageId?: string | null;
  status: ContentDispatchStatus;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
  sentBy?: string | null;
}): Promise<ContentDispatchLogEntry> {
  const { data, error } = await supabaseAdmin
    .from("content_dispatch_log")
    .insert({
      channel: input.channel,
      dispatch_kind: input.dispatchKind,
      draft_id: input.draftId ?? null,
      batch_id: input.batchId ?? null,
      recipient: input.recipient ?? null,
      subject: input.subject,
      template_label: input.templateLabel,
      body_preview: input.bodyPreview ?? null,
      body_hash: input.bodyHash ?? null,
      message_id: input.messageId ?? null,
      status: input.status,
      error_message: input.errorMessage ?? null,
      metadata: input.metadata ?? {},
      sent_by: input.sentBy ?? null,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not write dispatch log");
  return mapDispatchRow(data as DispatchRow);
}

export async function updateContentDispatchLog(
  id: string,
  patch: { status?: ContentDispatchStatus; errorMessage?: string | null },
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("content_dispatch_log")
    .update({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.errorMessage !== undefined ? { error_message: patch.errorMessage } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listContentDispatchLog(options: {
  limit?: number;
  channel?: ContentDispatchChannel;
  draftId?: string;
  batchId?: string;
}): Promise<ContentDispatchLogEntry[]> {
  let query = supabaseAdmin
    .from("content_dispatch_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 50);

  if (options.channel) query = query.eq("channel", options.channel);
  if (options.draftId) query = query.eq("draft_id", options.draftId);
  if (options.batchId) query = query.eq("batch_id", options.batchId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as DispatchRow[]).map(mapDispatchRow);
}

export async function listContentDraftVersions(
  draftId: string,
  limit = 20,
): Promise<ContentDraftVersionEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("content_draft_versions")
    .select("*")
    .eq("draft_id", draftId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as VersionRow[]).map((row) => ({
    id: row.id,
    draftId: row.draft_id,
    snapshot: row.snapshot as ContentDraftVersionEntry["snapshot"],
    createdBy: row.created_by,
    createdAt: row.created_at,
  }));
}

/** Record non-email outbound actions (Facebook schedule, article publish, etc.). */
export async function logContentDispatchEvent(input: {
  channel: ContentDispatchChannel;
  dispatchKind: ContentDispatchKind;
  draftId?: string | null;
  batchId?: string | null;
  subject: string;
  templateLabel: string;
  bodyPreview?: string | null;
  bodyHash?: string | null;
  status?: ContentDispatchStatus;
  sentBy?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<ContentDispatchLogEntry> {
  return insertContentDispatchLog({
    ...input,
    status: input.status ?? "sent",
  });
}
