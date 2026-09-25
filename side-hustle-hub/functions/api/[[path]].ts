/**
 * GYSH Pages Functions API — /api/*
 * Production source of truth: Cloudflare D1 (binding DB).
 */
import {
  handleConfirmPasswordReset,
  handleForgotPassword,
  handleLogin,
  handleLogout,
  handleMe,
  handleRegister,
  handleResetPassword,
  handleUpdateMembershipPlan,
  requireAdminSession,
  requireDb,
  requireSession,
  type Env,
} from "../_lib/auth";
import {
  deleteUser,
  handleContact,
  health,
  listAudit,
  listContent,
  listAgilePlan,
  listFinancials,
  listTasks,
  listTestStatuses,
  listTestAttachments,
  listUsers,
  listWorkshops,
  createWorkshopRegistration,
  listWorkshopRegistrations,
  adminAddWorkshopRegistration,
  createJuniorSignup,
  getJuniorConsent,
  grantJuniorConsent,
  listJuniorSignups,
  listFamilyChildren,
  getMemberProgress,
  putMemberProgress,
  saveAgilePlan,
  saveContent,
  saveFinancials,
  saveTasks,
  saveWorkshops,
  setTestStatus,
  updateUserMembership,
  uploadTestAttachment,
  deleteTestAttachment,
  handleTaskAttachments,
  handlePlanAttachments,
  upsertUser,
} from "../_lib/data";
import { closeSprint, listClosedSprints, reopenSprint } from "../_lib/closed-sprints";
import { getMemberCredits, handleAdminGrantInternalCredits } from "../_lib/member-credits";
import {
  listEmailLog,
  listEmailTemplates,
  previewEmailTemplate,
  sendTestEmail,
  updateEmailTemplate,
} from "../_lib/email-admin";
import {
  handleAdminPreviewDigest,
  handleAdminSendDigests,
  handleCronDailyDigest,
  handleSendEvelynTestDigest,
} from "../_lib/daily-digest";
import {
  getCertificatePdf,
  getCertificateSvg,
  listMemberCertificates,
  regenerateOneCertificate,
  updateCertificateTemplate,
} from "../_lib/certificates";
import {
  createPartnerAgenda,
  deleteAgendaItem,
  getPartnerAgenda,
  linkAgendaItems,
  saveAgendaPreview,
  saveAgendaTimePicks,
  sendAgendaInviteEmail,
  updateAgendaMeta,
  upsertAgendaItem,
} from "../_lib/partner-agenda";
import {
  assignBlueprintMatchToChild,
  assignBlueprintToChild,
  createFamilyChild,
  getFamilySettings,
  updateFamilySettings,
} from "../_lib/family";
import {
  claimPendingBlueprint,
  createPendingBlueprint,
  getBlueprint,
  getPendingBlueprint,
  listBlueprints,
  saveBlueprint,
  saveBlueprintFavorite,
} from "../_lib/blueprints";
import { listAutomatedTestRuns, runAutomatedTests } from "../_lib/automated-runner";
import { handleAdminEntityLinks } from "../_lib/admin-entity-links";
import { handleSoftLaunchOverrides } from "../_lib/soft-launch-overrides";
import { handleSoftLaunchAttachments } from "../_lib/soft-launch-attachments";
import {
  endTimeEntry,
  listTimeEntries,
  listTimeEntryUsers,
  pauseTimeEntry,
  startTimeEntry,
} from "../_lib/time-entries";
import {
  createDailyProgressReport,
  getDailyProgressReportHtml,
  listDailyProgressReports,
} from "../_lib/daily-progress-audit";
import { error, json } from "../_lib/crypto";

function pathParts(params: { path?: string | string[] }): string[] {
  const p = params.path;
  if (!p) return [];
  if (Array.isArray(p)) return p.filter(Boolean);
  return String(p).split("/").filter(Boolean);
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") || "*";
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  };
}

function withCors(request: Request, res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

export async function onRequest(context: {
  request: Request;
  env: Env;
  params: { path?: string | string[] };
}) {
  const { request, env, params } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  const parts = pathParts(params);
  const method = request.method.toUpperCase();
  const route = parts.join("/");

  try {
    // ——— Public ———
    if (route === "health" && method === "GET") {
      return withCors(request, await health(env));
    }
    if (route === "workshops" && method === "GET") {
      return withCors(request, await listWorkshops(env));
    }
    if (route === "auth/login" && method === "POST") {
      return withCors(request, await handleLogin(env, request));
    }
    if (route === "auth/register" && method === "POST") {
      return withCors(request, await handleRegister(env, request));
    }
    if (route === "auth/logout" && method === "POST") {
      return withCors(request, await handleLogout(env, request));
    }
    if (route === "auth/forgot-password" && method === "POST") {
      return withCors(request, await handleForgotPassword(env, request));
    }
    if (route === "auth/confirm-password-reset" && method === "POST") {
      return withCors(request, await handleConfirmPasswordReset(env, request));
    }
    if (route === "auth/reset-password" && method === "POST") {
      return withCors(request, await handleResetPassword(env, request));
    }
    if (route === "contact" && method === "POST") {
      return withCors(request, await handleContact(env, request));
    }
    if (route === "stripe/checkout" && method === "POST") {
      const { handleStripeCheckoutCreate } = await import("../_lib/stripe-checkout");
      return withCors(request, await handleStripeCheckoutCreate(env, request));
    }
    if (route === "stripe/confirm" && method === "POST") {
      const { handleStripeCheckoutConfirm } = await import("../_lib/stripe-checkout");
      return withCors(request, await handleStripeCheckoutConfirm(env, request));
    }
    // Cron Worker → daily digests (auth via CRON_SECRET; no session).
    if (route === "cron/daily-digest" && (method === "GET" || method === "POST")) {
      return withCors(request, await handleCronDailyDigest(env, request));
    }
    if (route === "workshop-registrations" && method === "POST") {
      return withCors(request, await createWorkshopRegistration(env, request));
    }
    if (route === "junior-signups" && method === "POST") {
      return withCors(request, await createJuniorSignup(env, request));
    }
    if (parts[0] === "junior-signups" && parts[1] === "consent" && parts[2] && method === "GET") {
      return withCors(request, await getJuniorConsent(env, parts[2]));
    }
    if (parts[0] === "junior-signups" && parts[1] === "consent" && parts[2] && method === "POST") {
      return withCors(request, await grantJuniorConsent(env, parts[2], request));
    }
    if (route === "blueprints/pending" && method === "POST") {
      return withCors(request, await createPendingBlueprint(env, request));
    }
    if (parts[0] === "blueprints" && parts[1] === "pending" && parts[2] && method === "GET") {
      return withCors(request, await getPendingBlueprint(env, parts[2]));
    }
    if (route === "beta-nda" && method === "GET") {
      const { currentBetaNdaVersionResponse } = await import("../_lib/beta-nda-store");
      return withCors(request, currentBetaNdaVersionResponse());
    }

    // ——— Any logged-in member (free or admin) ———
    const memberAuth = await requireSession(env, request);
    if (memberAuth instanceof Response) {
      // Fall through only if route doesn't need auth? No — remaining routes need auth.
      return withCors(request, memberAuth);
    }
    const { user } = memberAuth;

    if (route === "auth/me" && method === "GET") {
      return withCors(request, await handleMe(env, request));
    }
    if (route === "beta-nda" && method === "POST") {
      const { handleAcceptBetaNda } = await import("../_lib/beta-nda-store");
      return withCors(request, await handleAcceptBetaNda(env.DB, request, user));
    }
    if (route === "beta-testing/dashboard" && method === "GET") {
      const { handleBetaTestingDashboard } = await import("../_lib/beta-nda-store");
      return withCors(request, await handleBetaTestingDashboard(env.DB, user));
    }
    if (route === "auth/membership-plan" && method === "POST") {
      return withCors(request, await handleUpdateMembershipPlan(env, request, user));
    }
    if (parts[0] === "member-progress" && parts[1] && method === "GET") {
      return withCors(request, await getMemberProgress(env, user, parts[1]));
    }
    if (route === "member-progress" && method === "PUT") {
      return withCors(request, await putMemberProgress(env, request, user));
    }
    if (route === "member-credits" && method === "GET") {
      return withCors(request, await getMemberCredits(env, user));
    }
    if (route === "newsletters" && method === "GET") {
      const { listMemberNewsletters } = await import("../_lib/newsletters");
      return withCors(request, await listMemberNewsletters(env, user));
    }
    if (route === "member-purchases" && method === "GET") {
      const { handleMyPurchases } = await import("../_lib/stripe-payments");
      return withCors(request, await handleMyPurchases(env, user));
    }
    if (route === "family/children" && method === "GET") {
      return withCors(request, await listFamilyChildren(env, user));
    }
    if (route === "family/children" && method === "POST") {
      return withCors(request, await createFamilyChild(env, user, request));
    }
    if (route === "family/settings" && method === "GET") {
      return withCors(request, await getFamilySettings(env, user));
    }
    if (route === "family/settings" && method === "PUT") {
      return withCors(request, await updateFamilySettings(env, user, request));
    }
    if (route === "blueprints" && method === "GET") {
      return withCors(request, await listBlueprints(env, user));
    }
    if (route === "blueprints" && method === "POST") {
      return withCors(request, await saveBlueprint(env, request, user));
    }
    if (route === "blueprints/assign" && method === "POST") {
      return withCors(request, await assignBlueprintToChild(env, user, request));
    }
    if (route === "blueprints/assign-match" && method === "POST") {
      return withCors(request, await assignBlueprintMatchToChild(env, user, request));
    }
    if (route === "blueprints/claim" && method === "POST") {
      return withCors(request, await claimPendingBlueprint(env, request, user));
    }
    if (route === "blueprints/favorites" && method === "POST") {
      return withCors(request, await saveBlueprintFavorite(env, request, user));
    }
    if (parts[0] === "blueprints" && parts[1] && parts[1] !== "pending" && parts[1] !== "claim" && parts[1] !== "favorites" && method === "GET") {
      return withCors(request, await getBlueprint(env, user, parts[1]));
    }

    // ——— Admin / QA only ———
    const adminAuth = await requireAdminSession(env, request);
    if (adminAuth instanceof Response) return withCors(request, adminAuth);

    if (route === "audit" && method === "GET") {
      return withCors(request, await listAudit(env, request));
    }
    if (route === "users" && method === "GET") {
      return withCors(request, await listUsers(env, request));
    }
    if (route === "admin/hustle-schedules" && method === "GET") {
      const { listAllHustleSchedules } = await import("../_lib/schedule-reminders");
      return withCors(request, await listAllHustleSchedules(env));
    }
    if (route === "users" && (method === "POST" || method === "PUT")) {
      return withCors(request, await upsertUser(env, request, user));
    }
    if (parts[0] === "users" && parts[1] && method === "DELETE") {
      return withCors(request, await deleteUser(env, parts[1], user));
    }
    if (parts[0] === "users" && parts[1] && parts[2] === "membership" && method === "PUT") {
      return withCors(request, await updateUserMembership(env, request, parts[1], user));
    }
    if (route === "admin/internal-credits" && method === "POST") {
      return withCors(request, await handleAdminGrantInternalCredits(env, request, user));
    }
    if (route === "tasks" && method === "GET") {
      return withCors(request, await listTasks(env));
    }
    if (route === "tasks" && method === "PUT") {
      return withCors(request, await saveTasks(env, request, user));
    }
    if (route === "task-attachments") {
      return withCors(request, await handleTaskAttachments(env, request, user));
    }
    if (route === "plan-attachments") {
      return withCors(request, await handlePlanAttachments(env, request, user));
    }
    if (route === "test-statuses" && method === "GET") {
      return withCors(request, await listTestStatuses(env));
    }
    if (route === "test-statuses" && method === "PUT") {
      return withCors(request, await setTestStatus(env, request, user));
    }
    if (route === "test-statuses" && method === "DELETE") {
      return withCors(
        request,
        error("Test results cannot be bulk-deleted. Update individual case statuses instead.", 405),
      );
    }
    if (route === "test-attachments" && method === "GET") {
      return withCors(request, await listTestAttachments(env, request));
    }
    if (route === "test-attachments" && method === "POST") {
      return withCors(request, await uploadTestAttachment(env, request, user));
    }
    if (route === "test-attachments" && method === "DELETE") {
      return withCors(request, await deleteTestAttachment(env, request, user));
    }
    if (route === "automated-tests/run" && method === "POST") {
      return withCors(request, await runAutomatedTests(env, request, user));
    }
    if (route === "automated-tests/runs" && method === "GET") {
      return withCors(request, await listAutomatedTestRuns(env));
    }
    if (route === "content" && method === "GET") {
      return withCors(request, await listContent(env, user));
    }
    if (route === "content" && method === "PUT") {
      return withCors(request, await saveContent(env, request, user));
    }
    if (route === "admin-entity-links") {
      return withCors(request, await handleAdminEntityLinks(env, request, user));
    }
    if (route === "soft-launch-overrides") {
      return withCors(request, await handleSoftLaunchOverrides(env, request, user));
    }
    if (route === "soft-launch-attachments") {
      return withCors(request, await handleSoftLaunchAttachments(env, request, user));
    }
    if (route === "workshops" && method === "PUT") {
      return withCors(request, await saveWorkshops(env, request));
    }
    if (route === "workshop-registrations" && method === "GET") {
      return withCors(request, await listWorkshopRegistrations(env, request));
    }
    if (parts[0] === "workshop-registrations" && parts[1] === "admin" && method === "POST") {
      return withCors(request, await adminAddWorkshopRegistration(env, request));
    }
    if (route === "junior-signups" && method === "GET") {
      return withCors(request, await listJuniorSignups(env));
    }
    if (route === "financials" && method === "GET") {
      return withCors(request, await listFinancials(env, user));
    }
    if (route === "financials" && method === "PUT") {
      return withCors(request, await saveFinancials(env, request, user));
    }
    if (route === "financials/payments" && method === "GET") {
      const { handleListPayments } = await import("../_lib/stripe-payments");
      return withCors(request, await handleListPayments(env, request));
    }
    if (route === "agile-plan" && method === "GET") {
      return withCors(request, await listAgilePlan(env));
    }
    if (route === "agile-plan" && method === "PUT") {
      return withCors(request, await saveAgilePlan(env, request, user));
    }
    if (route === "closed-sprints" && method === "GET") {
      return withCors(request, await listClosedSprints(env));
    }
    if (route === "closed-sprints" && method === "POST") {
      return withCors(request, await closeSprint(env, request, user));
    }
    if (route === "closed-sprints" && method === "DELETE") {
      return withCors(request, await reopenSprint(env, request, user));
    }
    if (route === "daily-progress-reports" && method === "GET") {
      return withCors(request, await listDailyProgressReports(env));
    }
    if (route === "daily-progress-reports" && method === "POST") {
      return withCors(request, await createDailyProgressReport(env, request, user));
    }
    if (parts[0] === "daily-progress-reports" && parts[1] && method === "GET") {
      return withCors(request, await getDailyProgressReportHtml(env, parts[1]));
    }
    if (route === "time-entries" && method === "GET") {
      return withCors(request, await listTimeEntries(env, request, user));
    }
    if (route === "time-entries/users" && method === "GET") {
      return withCors(request, await listTimeEntryUsers(env, user));
    }
    if (route === "time-entries/start" && method === "POST") {
      return withCors(request, await startTimeEntry(env, request, user));
    }
    if (route === "time-entries/pause" && method === "POST") {
      return withCors(request, await pauseTimeEntry(env, request, user));
    }
    if (route === "time-entries/end" && method === "POST") {
      return withCors(request, await endTimeEntry(env, request, user));
    }
    if (route === "email/templates" && method === "GET") {
      return withCors(request, await listEmailTemplates(env));
    }
    if (route === "email/templates" && method === "PUT") {
      return withCors(request, await updateEmailTemplate(env, request, user));
    }
    if (route === "email/log" && method === "GET") {
      return withCors(request, await listEmailLog(env, request));
    }
    if (route === "email/preview" && method === "POST") {
      return withCors(request, await previewEmailTemplate(env, request));
    }
    if (route === "email/test-send" && method === "POST") {
      return withCors(request, await sendTestEmail(env, request, user));
    }
    if (route === "email/digest/preview" && method === "GET") {
      return withCors(request, await handleAdminPreviewDigest(env, request, user));
    }
    if (route === "email/digest/send" && method === "POST") {
      return withCors(request, await handleAdminSendDigests(env, request, user));
    }
    if (route === "email/digest/send-evelyn-test" && method === "POST") {
      return withCors(request, await handleSendEvelynTestDigest(env));
    }
    if (route === "certificates" && method === "GET") {
      return withCors(request, await listMemberCertificates(env));
    }
    if (route === "certificates/template" && method === "PUT") {
      return withCors(request, await updateCertificateTemplate(env, request, user));
    }
    if (parts[0] === "certificates" && parts[1] && parts[2] === "svg" && method === "GET") {
      return withCors(request, await getCertificateSvg(env, parts[1]));
    }
    if (parts[0] === "certificates" && parts[1] && parts[2] === "pdf" && method === "GET") {
      return withCors(request, await getCertificatePdf(env, parts[1]));
    }
    if (parts[0] === "certificates" && parts[1] && parts[2] === "regenerate" && method === "POST") {
      return withCors(request, await regenerateOneCertificate(env, parts[1]));
    }
    if (route === "partner-agenda" && method === "GET") {
      return withCors(request, await getPartnerAgenda(env, user));
    }
    if (route === "partner-agenda" && method === "POST") {
      return withCors(request, await createPartnerAgenda(env, user));
    }
    if (route === "partner-agenda/meta" && method === "PUT") {
      return withCors(request, await updateAgendaMeta(env, request, user));
    }
    if (route === "partner-agenda/preview" && method === "PUT") {
      return withCors(request, await saveAgendaPreview(env, request, user));
    }
    if (route === "partner-agenda/items" && method === "PUT") {
      return withCors(request, await upsertAgendaItem(env, request, user));
    }
    if (route === "partner-agenda/items/link" && method === "POST") {
      return withCors(request, await linkAgendaItems(env, request, user));
    }
    if (parts[0] === "partner-agenda" && parts[1] === "items" && parts[2] && method === "DELETE") {
      return withCors(request, await deleteAgendaItem(env, user, parts[2]));
    }
    if (route === "partner-agenda/time-picks" && method === "PUT") {
      return withCors(request, await saveAgendaTimePicks(env, request, user));
    }
    if (route === "partner-agenda/invite" && method === "POST") {
      return withCors(request, await sendAgendaInviteEmail(env, request, user));
    }

    const dbFail = requireDb(env);
    if (dbFail) return withCors(request, dbFail);
    return withCors(request, error(`Not found: /api/${route}`, 404));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return withCors(request, json({ error: `Server error: ${message}` }, 500));
  }
}
