import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// ---------------------------------------------------------------------------
// Global test mocks — most components/hooks/server-fns transitively pull in
// Supabase, TanStack Start, and our shared toast helper. We stub them with
// inert defaults so smoke renders and unit tests don't need to repeat the
// boilerplate. Individual tests can vi.mock(...) to override per-suite.
// ---------------------------------------------------------------------------

const supabaseQueryStub: Record<string, unknown> = {};
supabaseQueryStub.select = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.insert = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.update = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.upsert = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.delete = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.eq = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.in = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.order = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.limit = vi.fn(() => supabaseQueryStub);
supabaseQueryStub.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
supabaseQueryStub.single = vi.fn(async () => ({ data: null, error: null }));
supabaseQueryStub.then = (resolve: (value: { data: unknown; error: null }) => unknown) =>
  Promise.resolve({ data: [], error: null }).then(resolve);

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
      onAuthStateChange: vi.fn((_cb) => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn(async () => ({ error: null })),
      signInWithPassword: vi.fn(async () => ({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(async () => ({ data: { user: null, session: null }, error: null })),
      resetPasswordForEmail: vi.fn(async () => ({ data: null, error: null })),
      updateUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => supabaseQueryStub),
    rpc: vi.fn(async () => ({ data: null, error: null })),
    storage: {
      from: vi.fn(() => ({
        list: vi.fn(async () => ({ data: [], error: null })),
        upload: vi.fn(async () => ({ data: { path: "x" }, error: null })),
        remove: vi.fn(async () => ({ data: null, error: null })),
        createSignedUrl: vi.fn(async () => ({ data: { signedUrl: "https://x" }, error: null })),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  },
}));

vi.mock("@tanstack/react-start", async () => ({
  createServerFn: () => ({
    middleware: () => ({
      handler: (fn: unknown) => fn,
      inputValidator: () => ({ handler: (fn: unknown) => fn }),
    }),
    inputValidator: () => ({ handler: (fn: unknown) => fn }),
    handler: (fn: unknown) => fn,
  }),
  useServerFn: (fn: unknown) => fn,
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  }),
  Toaster: () => null,
}));

// crypto.randomUUID polyfill for environments that don't ship it
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis.crypto ?? (globalThis as { crypto?: Crypto }).crypto ?? {}, "randomUUID", {
    value: () => "00000000-0000-0000-0000-000000000000",
    configurable: true,
  });
}

// Stub matchMedia + ResizeObserver for components using shadcn ui primitives
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  if (!("ResizeObserver" in window)) {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}