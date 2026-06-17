import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { listAllAuthUsers } from "@/lib/supabase-auth-users.server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RecipientDisplay = {
  recipient_name: string;
  recipient_email: string;
};

function nameFromAuthUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const metaName = (user.user_metadata?.full_name as string | undefined)?.trim();
  return metaName || user.email?.trim() || "";
}

/** Resolve display names for email send-log recipients (staff profiles + auth metadata). */
export async function resolveRecipientNamesByEmail(
  emails: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const normalized = [
    ...new Set(
      emails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0 && e.includes("@")),
    ),
  ];
  if (normalized.length === 0) return out;

  const authUsers = await listAllAuthUsers();
  const authByEmail = new Map<string, (typeof authUsers)[number]>();
  for (const user of authUsers) {
    const email = (user.email ?? "").trim().toLowerCase();
    if (email) authByEmail.set(email, user);
  }

  const matchedIds = normalized
    .map((email) => authByEmail.get(email)?.id)
    .filter((id): id is string => Boolean(id));

  const profileMap = new Map<string, string>();
  if (matchedIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .in("id", matchedIds);
    for (const profile of profiles ?? []) {
      const name = profile.full_name?.trim();
      if (name) profileMap.set(profile.id, name);
    }
  }

  for (const email of normalized) {
    const authUser = authByEmail.get(email);
    if (!authUser) {
      out.set(email, email);
      continue;
    }
    const profileName = profileMap.get(authUser.id)?.trim();
    const metaName = (authUser.user_metadata?.full_name as string | undefined)?.trim();
    out.set(email, profileName || metaName || email);
  }

  return out;
}

async function resolveRecipientByUserId(userId: string): Promise<RecipientDisplay | null> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const profileName = profile?.full_name?.trim();

  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
  const authUser = authData.user;
  if (!authUser && !profileName) return null;

  const email = authUser?.email?.trim() ?? "";
  const name = profileName || (authUser ? nameFromAuthUser(authUser) : "") || email || userId;
  return {
    recipient_name: name,
    recipient_email: email || userId,
  };
}

/** Resolve sent-to label for each raw log recipient value (email or legacy user id). */
export async function resolveRecipientDisplays(
  rawValues: string[],
): Promise<Map<string, RecipientDisplay>> {
  const out = new Map<string, RecipientDisplay>();
  const unique = [...new Set(rawValues.map((v) => v.trim()).filter(Boolean))];
  if (unique.length === 0) return out;

  const emails = unique.filter((v) => v.includes("@"));
  const userIds = unique.filter((v) => UUID_RE.test(v) && !v.includes("@"));

  const nameByEmail = await resolveRecipientNamesByEmail(emails);
  for (const raw of emails) {
    const key = raw.toLowerCase();
    const recipient = formatEmailLogRecipient(raw, nameByEmail);
    out.set(raw, recipient);
  }

  await Promise.all(
    userIds.map(async (userId) => {
      const resolved = await resolveRecipientByUserId(userId);
      out.set(userId, resolved ?? { recipient_name: "Unknown recipient", recipient_email: userId });
    }),
  );

  for (const raw of unique) {
    if (!out.has(raw)) {
      out.set(raw, { recipient_name: raw, recipient_email: raw });
    }
  }

  return out;
}

export function formatEmailLogRecipient(
  recipientEmail: string,
  nameByEmail: Map<string, string>,
): RecipientDisplay {
  const email = recipientEmail.trim();
  const key = email.toLowerCase();
  const resolved = nameByEmail.get(key);
  if (resolved && resolved !== key && !UUID_RE.test(resolved)) {
    return { recipient_name: resolved, recipient_email: email };
  }
  if (UUID_RE.test(email)) {
    return { recipient_name: "Unknown recipient", recipient_email: email };
  }
  return { recipient_name: resolved ?? email, recipient_email: email };
}
