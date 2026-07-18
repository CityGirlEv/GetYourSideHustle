/**
 * GYSH Pages Functions API — /api/*
 * Production source of truth: Cloudflare D1 (binding DB).
 */
import {
  handleLogin,
  handleLogout,
  handleMe,
  handleRegister,
  handleResetPassword,
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
  listUsers,
  listWorkshops,
  createWorkshopRegistration,
  createJuniorSignup,
  getJuniorConsent,
  grantJuniorConsent,
  listJuniorSignups,
  getMemberProgress,
  putMemberProgress,
  resetTestStatuses,
  saveAgilePlan,
  saveContent,
  saveFinancials,
  saveTasks,
  saveWorkshops,
  setTestStatus,
  upsertUser,
} from "../_lib/data";
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
    if (route === "auth/reset-password" && method === "POST") {
      return withCors(request, await handleResetPassword(env, request));
    }
    if (route === "contact" && method === "POST") {
      return withCors(request, await handleContact(env, request));
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
    if (parts[0] === "member-progress" && parts[1] && method === "GET") {
      return withCors(request, await getMemberProgress(env, user, parts[1]));
    }
    if (route === "member-progress" && method === "PUT") {
      return withCors(request, await putMemberProgress(env, request, user));
    }
    if (route === "blueprints" && method === "GET") {
      return withCors(request, await listBlueprints(env, user));
    }
    if (route === "blueprints" && method === "POST") {
      return withCors(request, await saveBlueprint(env, request, user));
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
      return withCors(request, await listAudit(env));
    }
    if (route === "users" && method === "GET") {
      return withCors(request, await listUsers(env));
    }
    if (route === "users" && (method === "POST" || method === "PUT")) {
      return withCors(request, await upsertUser(env, request, user));
    }
    if (parts[0] === "users" && parts[1] && method === "DELETE") {
      return withCors(request, await deleteUser(env, parts[1]));
    }
    if (route === "tasks" && method === "GET") {
      return withCors(request, await listTasks(env));
    }
    if (route === "tasks" && method === "PUT") {
      return withCors(request, await saveTasks(env, request));
    }
    if (route === "test-statuses" && method === "GET") {
      return withCors(request, await listTestStatuses(env));
    }
    if (route === "test-statuses" && method === "PUT") {
      return withCors(request, await setTestStatus(env, request, user));
    }
    if (route === "test-statuses" && method === "DELETE") {
      return withCors(request, await resetTestStatuses(env));
    }
    if (route === "automated-tests/run" && method === "POST") {
      return withCors(request, await runAutomatedTests(env, request, user));
    }
    if (route === "automated-tests/runs" && method === "GET") {
      return withCors(request, await listAutomatedTestRuns(env));
    }
    if (route === "content" && method === "GET") {
      return withCors(request, await listContent(env));
    }
    if (route === "content" && method === "PUT") {
      return withCors(request, await saveContent(env, request));
    }
    if (route === "workshops" && method === "PUT") {
      return withCors(request, await saveWorkshops(env, request));
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
    if (route === "agile-plan" && method === "GET") {
      return withCors(request, await listAgilePlan(env));
    }
    if (route === "agile-plan" && method === "PUT") {
      return withCors(request, await saveAgilePlan(env, request));
    }

    const dbFail = requireDb(env);
    if (dbFail) return withCors(request, dbFail);
    return withCors(request, error(`Not found: /api/${route}`, 404));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return withCors(request, json({ error: `Server error: ${message}` }, 500));
  }
}
