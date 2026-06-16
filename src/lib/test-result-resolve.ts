import type { FailSeverity, TestStatus } from "@/lib/test-plan";
import { parsePlatformVariantId } from "@/lib/platform-variants";

/** Read a per-test field from variant id, falling back to the unsuffixed source id. */
export function resolveTestField<T>(
  store: Record<string, T>,
  id: string,
  opts?: { treatAsEmpty?: (value: T) => boolean },
): T | undefined {
  const direct = store[id];
  const directUsable = direct !== undefined && !(opts?.treatAsEmpty?.(direct) ?? false);
  if (directUsable) return direct;

  const { sourceId } = parsePlatformVariantId(id);
  if (sourceId === id) return direct;

  const inherited = store[sourceId];
  if (inherited !== undefined && !(opts?.treatAsEmpty?.(inherited) ?? false)) {
    return inherited;
  }
  return direct;
}

export function resolveTestStatus(store: Record<string, TestStatus>, id: string): TestStatus {
  return (
    resolveTestField(store, id, {
      treatAsEmpty: (value) => value === "not_run",
    }) ?? "not_run"
  );
}

export function resolveTestString(store: Record<string, string>, id: string): string {
  return resolveTestField(store, id, { treatAsEmpty: (value) => !value }) ?? "";
}

export function resolveTestSeverity(
  store: Record<string, FailSeverity | "">,
  id: string,
): FailSeverity | "" {
  return resolveTestField(store, id, { treatAsEmpty: (value) => !value }) ?? "";
}
