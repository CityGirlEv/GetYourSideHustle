export type EmailTemplateListFields = {
  slug: string;
  name: string;
  description: string;
  subject?: string;
};

/** Admin list filter: match name, description, slug, or subject. */
export function emailTemplateMatchesQuery(
  t: EmailTemplateListFields,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${t.slug} ${t.name} ${t.description} ${t.subject ?? ""}`.toLowerCase();
  return hay.includes(q);
}

/** Save writes the current draft; it stays available while a template is selected and idle. */
export function emailTemplateSaveEnabled(busy: boolean, hasSelection: boolean): boolean {
  return hasSelection && !busy;
}

/** Re-apply list content only when switching templates — not after Save refreshes the list. */
export function shouldHydrateEmailTemplateDraft(
  lastHydratedSlug: string,
  selectedSlug: string,
): boolean {
  return Boolean(selectedSlug) && lastHydratedSlug !== selectedSlug;
}

/** Email log slug → catalog name (test_ prefix kept as a TEST label). */
export function emailTemplateLogLabel(
  slug: string,
  catalog: Array<{ slug: string; name: string }>,
): string {
  const raw = String(slug || "").trim();
  if (!raw) return "Unknown template";
  const isTest = raw.startsWith("test_");
  const clean = isTest ? raw.slice(5) : raw;
  const name = catalog.find((t) => t.slug === clean)?.name || clean;
  return isTest ? `[TEST] ${name}` : name;
}
