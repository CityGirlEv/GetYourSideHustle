import "./lib/error-capture";

import { createCmsLandscapeAssetResponse } from "./lib/cms-landscape-files.server";
import { ensureCmsLandscapeLoadedServer } from "./lib/cms-landscape.server";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleTranscribeRequest } from "./lib/transcribe-handler";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function resolveWorkerEnv(env: unknown): Record<string, unknown> {
  const passed =
    env && typeof env === "object" ? (env as Record<string, unknown>) : undefined;
  const stored = (globalThis as Record<string, unknown>).__env__ as
    | Record<string, unknown>
    | undefined;
  // Nitro's SSR bridge calls fetch(request) without env — keep bindings from the worker entry.
  const envBag =
    passed && Object.keys(passed).length > 0 ? passed : (stored ?? {});
  (globalThis as Record<string, unknown>).__env__ = envBag;
  return envBag;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const envBag = resolveWorkerEnv(env);

    if (typeof process !== "undefined" && process.env) {
      for (const [key, value] of Object.entries(envBag)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
    }
    const url = new URL(request.url);
    if (url.pathname === "/api/public/transcribe") {
      return handleTranscribeRequest(request, envBag);
    }
    if (url.pathname === "/users" || url.pathname.startsWith("/users/")) {
      url.pathname = url.pathname.replace(/^\/users/, "/staff");
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname === "/admin/staff" || url.pathname.startsWith("/admin/staff/")) {
      url.pathname = "/staff";
      url.search = "";
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname === "/admin/users" || url.pathname.startsWith("/admin/users/")) {
      url.pathname = "/staff";
      url.search = "";
      return Response.redirect(url.toString(), 308);
    }
    if (
      url.pathname === "/admin" &&
      (url.searchParams.get("tab") === "users" || url.searchParams.get("tab") === "staff")
    ) {
      url.pathname = "/staff";
      url.search = "";
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname.startsWith("/lovable/email/")) {
      url.pathname = url.pathname.replace(/^\/lovable\/email/, "/api/email");
      return Response.redirect(url.toString(), 308);
    }

    const assets = envBag.ASSETS as { fetch: typeof fetch } | undefined;
    const cmsAssetResponse = await createCmsLandscapeAssetResponse(
      url.pathname,
      assets,
      request,
    );
    if (cmsAssetResponse) {
      return cmsAssetResponse;
    }

    try {
      await ensureCmsLandscapeLoadedServer({
        origin: url.origin,
        assets,
      });
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
