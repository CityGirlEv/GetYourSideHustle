/**
 * Complimentary GYSH merch (T-shirt / hat) — member save + admin size-request email.
 */
import {
  appendAudit,
  error,
  getUserById,
  json,
  publicUser,
  requireDb,
  type DbUser,
  type Env,
} from "./auth";
import {
  isMembershipSubscriber,
  merchChoicesError,
  merchItemCount,
  mergeMerchNote,
  parseMerchChoices,
  parseMerchTshirtSizes,
  type TierId,
} from "../../src/lib/membership";

export async function handleSaveMemberMerch(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  const tier = String(actor.membership_tier || "free").toLowerCase() as TierId;
  if (!isMembershipSubscriber(tier)) {
    return error("Complimentary GYSH merch is included on Starter and above.", 403);
  }

  let body: { merchChoices?: unknown; merchTshirtSizes?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const merchErr = merchChoicesError(tier, body.merchChoices, body.merchTshirtSizes ?? []);
  if (merchErr) return error(merchErr, 400);
  const merchChoices = parseMerchChoices(body.merchChoices, merchItemCount(tier)) ?? [];
  const tshirtSizes = parseMerchTshirtSizes(merchChoices, body.merchTshirtSizes ?? []);

  const before = (await getUserById(env.DB, actor.id)) ?? actor;
  const notes = mergeMerchNote(String(before.notes || ""), merchChoices, tshirtSizes);
  const now = new Date().toISOString();

  await env.DB.prepare(`UPDATE users SET notes = ?, updated_at = ? WHERE id = ?`)
    .bind(notes, now, actor.id)
    .run();

  await appendAudit(env.DB, "member_merch_choice", actor.email, notes.match(/Merch:[^·]+/i)?.[0] || "");

  const updated = await getUserById(env.DB, actor.id);
  return json({
    ok: true,
    user: publicUser(updated ?? { ...before, notes }),
    message: "Saved your complimentary GYSH gear choice.",
  });
}

export async function handleSendMerchClaimEmail(
  env: Env,
  request: Request,
  _actor: DbUser,
): Promise<Response> {
  const dbFail = requireDb(env);
  if (dbFail) return dbFail;

  let body: { userId?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const userId = String(body.userId || "").trim();
  if (!userId) return error("User id is required.");

  const member = await getUserById(env.DB, userId);
  if (!member) return error("User not found.", 404);
  if (!isMembershipSubscriber(member.membership_tier)) {
    return error("Complimentary merch is for Starter and above.", 400);
  }

  const { sendMembershipMerchReadyEmail } = await import("./email");
  const sent = await sendMembershipMerchReadyEmail(env, {
    id: member.id,
    email: member.email,
    name: member.name,
    membership_tier: member.membership_tier,
  });
  return json({
    ok: true,
    emailSent: sent,
    message: sent
      ? `Merch size request emailed to ${member.email}.`
      : "Email was not sent (check Resend configuration).",
  });
}
