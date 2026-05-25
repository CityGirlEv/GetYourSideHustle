import { supabase } from "@/integrations/supabase/client";

export const TEST_EVIDENCE_BUCKET = "test-evidence";

export interface EvidenceFile {
  name: string;       // file name only
  path: string;       // full object path: <uid>/<testId>/<filename>
  size: number;
  updated_at: string;
}

function folder(userId: string, testId: string) {
  return `${userId}/${testId}`;
}

export async function listTestEvidence(userId: string, testId: string): Promise<EvidenceFile[]> {
  const { data, error } = await supabase.storage
    .from(TEST_EVIDENCE_BUCKET)
    .list(folder(userId, testId), { limit: 100, sortBy: { column: "updated_at", order: "desc" } });
  if (error || !data) return [];
  return data
    .filter((f) => f.name && !f.name.endsWith("/"))
    .map((f) => ({
      name: f.name,
      path: `${folder(userId, testId)}/${f.name}`,
      size: (f.metadata as { size?: number } | null)?.size ?? 0,
      updated_at: f.updated_at ?? f.created_at ?? "",
    }));
}

export async function uploadTestEvidence(userId: string, testId: string, file: File): Promise<EvidenceFile> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder(userId, testId)}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from(TEST_EVIDENCE_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" });
  if (error) throw new Error(error.message);
  return { name: safeName, path, size: file.size, updated_at: new Date().toISOString() };
}

export async function deleteTestEvidence(path: string): Promise<void> {
  const { error } = await supabase.storage.from(TEST_EVIDENCE_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

export async function getTestEvidenceUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(TEST_EVIDENCE_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}