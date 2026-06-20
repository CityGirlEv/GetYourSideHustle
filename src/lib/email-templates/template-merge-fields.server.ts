import {
  emailFooterLogoUrl,
  emailLogoUrl,
  resolveEmailAssetUrl,
} from "@/lib/email-templates/email-header";
import { SITE_BRAND_NAME, SITE_BRAND_THE, normalizeLegacyBrandText } from "@/lib/site-brand";
import {
  AUTH_LEGACY_PLACEHOLDERS,
  AUTH_MERGE_FIELDS_BY_TEMPLATE,
  AUTH_TEMPLATE_NAMES,
  getTemplateSampleProps,
  SHARED_MERGE_LITERALS,
  TEMPLATE_SUBJECT_MERGE_PATTERNS,
} from "@/lib/email-templates/template-sample-props.server";

const AUTH_SINGLE_BRACE_FIELDS = [
  "confirmationUrl",
  "token",
  "email",
  "recipient",
  "siteName",
  "siteUrl",
  "oldEmail",
  "newEmail",
] as const;

const MERGE_FIELD_PATTERN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

/** Friendly display name from an email local-part (e.g. john.doe@x.com → John Doe). */
export function deriveRecipientNameFromEmail(email: string): string {
  const local = email.trim().split("@")[0]?.trim() ?? "";
  if (!local) return "there";
  const parts = local.split(/[._+-]+/).filter(Boolean);
  if (!parts.length) return "there";
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

export function hasTemplateMergeFields(content: string): boolean {
  return /\{\{\s*[a-zA-Z0-9_.]+\s*\}\}/.test(content);
}

export function hasUnresolvedMergeFields(content: string): boolean {
  return hasTemplateMergeFields(content);
}

/** Normalize editor HTML so merge tokens match even when wrapped in tags/entities. */
export function normalizeMergeFieldMarkup(content: string): string {
  return content.replace(/&nbsp;|\u00a0/gi, " ").replace(/\s+/g, " ");
}

/** Flatten templateData into string merge keys (includes computed helpers). */
export function buildMergeContext(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value == null) {
      out[key] = "";
    } else if (Array.isArray(value)) {
      out[key] = value.map(String).join(", ");
    } else {
      out[key] = String(value);
    }
  }

  const firstName = out.firstName ?? "";
  const lastName = out.lastName ?? "";
  if (!out.fullName) {
    out.fullName = `${firstName} ${lastName}`.trim();
  }
  if (!out.recipientName && out.fullName) {
    out.recipientName = out.fullName;
  }
  if (!out.recipientName && out.firstName) {
    out.recipientName = out.firstName;
  }
  if (!out.recipientName && out.email) {
    out.recipientName = deriveRecipientNameFromEmail(out.email);
  }
  if (!out.firstName) {
    if (out.recipientName && out.recipientName !== "there") {
      out.firstName = out.recipientName.split(/\s+/)[0] ?? "there";
    } else if (out.email) {
      const derived = deriveRecipientNameFromEmail(out.email);
      out.firstName = derived === "there" ? "there" : (derived.split(/\s+/)[0] ?? "there");
    }
  }
  if (data.qaDevices && Array.isArray(data.qaDevices)) {
    out.qaDevicesLabel = data.qaDevices.length
      ? data.qaDevices.map(String).join(", ")
      : "None specified";
  }

  if (!out.email && out.recipient) out.email = out.recipient;
  if (!out.recipient && out.email) out.recipient = out.email;

  if (!out.siteName) out.siteName = SITE_BRAND_THE;
  if (!out.siteUrl) out.siteUrl = "https://mypartb.com";
  if (!out.emailLogoUrl) out.emailLogoUrl = emailLogoUrl();
  if (!out.emailFooterLogoUrl) out.emailFooterLogoUrl = emailFooterLogoUrl();

  return out;
}

/** Convert single-brace auth placeholders ({email}) to {{email}}. */
export function normalizeAuthBracePlaceholders(content: string, templateName: string): string {
  if (!AUTH_TEMPLATE_NAMES.has(templateName)) return content;
  let result = content;
  for (const field of AUTH_SINGLE_BRACE_FIELDS) {
    if (result.includes(`{{${field}}}`)) continue;
    result = result.replace(new RegExp(`\\{${field}\\}`, "g"), `{{${field}}}`);
  }
  return result;
}

export function applyTemplateMergeFields(content: string, data: Record<string, unknown>): string {
  const ctx = buildMergeContext(data);
  const normalized = normalizeMergeFieldMarkup(content);
  const merged = normalized.replace(MERGE_FIELD_PATTERN, (_, key: string) => ctx[key] ?? "");
  return normalizeLegacyBrandText(merged);
}

function previewLiteralsForTemplate(templateName: string): Array<{ sample: string; key: string }> {
  const preview = getTemplateSampleProps(templateName);
  const literals: Array<{ sample: string; key: string }> = [
    ...SHARED_MERGE_LITERALS,
    ...(AUTH_TEMPLATE_NAMES.has(templateName) ? AUTH_LEGACY_PLACEHOLDERS : []),
  ];

  if (preview.firstName && preview.lastName) {
    literals.push({
      sample: `${preview.firstName} ${preview.lastName}`.trim(),
      key: "fullName",
    });
  }
  if (preview.fullName) {
    literals.push({ sample: String(preview.fullName), key: "fullName" });
  }
  if (preview.recipientName) {
    if (!AUTH_TEMPLATE_NAMES.has(templateName)) {
      literals.push({ sample: String(preview.recipientName), key: "recipientName" });
    }
  }
  if (Array.isArray(preview.qaDevices) && preview.qaDevices.length) {
    literals.push({
      sample: preview.qaDevices.map(String).join(", "),
      key: "qaDevicesLabel",
    });
  }

  for (const [key, value] of Object.entries(preview)) {
    if (typeof value === "string" && value.length >= 4) {
      if (
        AUTH_TEMPLATE_NAMES.has(templateName) &&
        (key === "recipientName" || key === "firstName")
      ) {
        continue;
      }
      literals.push({ sample: value, key });
    }
  }

  const seen = new Set<string>();
  return literals
    .filter(({ sample }) => {
      if (!sample || seen.has(sample)) return false;
      seen.add(sample);
      return true;
    })
    .sort((a, b) => b.sample.length - a.sample.length);
}

/** Replace baked-in preview/sample literals with {{merge}} tokens. */
export function upgradeOverrideLiteralsToMergeFields(
  content: string,
  templateName: string,
): string {
  let result = normalizeAuthBracePlaceholders(content, templateName);
  const blockedSamples = AUTH_TEMPLATE_NAMES.has(templateName)
    ? new Set(["Jane", "Jane Doe", "Hi Jane,", "Hi Jane"])
    : null;
  for (const { sample, key } of previewLiteralsForTemplate(templateName)) {
    if (sample.length < 4) continue;
    if (blockedSamples?.has(sample)) continue;
    if (result.includes(`{{${key}}}`)) continue;
    result = result.split(sample).join(`{{${key}}}`);
  }
  return normalizeLegacyBrandText(result);
}

export function getDefaultSubjectWithMergeFields(
  templateName: string,
  fallbackSubject: string,
): string {
  const pattern = TEMPLATE_SUBJECT_MERGE_PATTERNS[templateName];
  if (pattern) return pattern;
  return upgradeOverrideLiteralsToMergeFields(fallbackSubject, templateName);
}

/** Auth emails use action headings (Confirm your email), not transactional Hi Jane greetings. */
export function stripAuthTransactionalGreetings(content: string): string {
  return content
    .replace(/<h1[^>]*>\s*Hi\s+(?:Jane|\{\{(?:recipientName|firstName)\}\})\s*,?\s*<\/h1>\s*/gi, "")
    .replace(/<p[^>]*>\s*Hi\s+(?:Jane|\{\{(?:recipientName|firstName)\}\})\s*,?\s*<\/p>\s*/gi, "")
    .replace(/\bHi\s+Jane\s*,?\s*/gi, "")
    .replace(/\bHi\s+\{\{(?:recipientName|firstName)\}\}\s*,?\s*/gi, "")
    .replace(/\bWelcome,\s*Jane\s*!/gi, "Welcome!");
}

export function normalizeTemplateOverrideContent(
  templateName: string,
  content: { subject: string; html: string },
): { subject: string; html: string; text: string } {
  let subject = upgradeOverrideLiteralsToMergeFields(content.subject, templateName);
  let html = upgradeOverrideLiteralsToMergeFields(content.html, templateName);
  let text = upgradeOverrideLiteralsToMergeFields(
    content.html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    templateName,
  );

  if (AUTH_TEMPLATE_NAMES.has(templateName)) {
    subject = stripAuthTransactionalGreetings(subject);
    html = stripAuthTransactionalGreetings(html);
    text = stripAuthTransactionalGreetings(text);
  }

  return {
    subject: normalizeLegacyBrandText(subject),
    html: normalizeLegacyBrandText(html),
    text: normalizeLegacyBrandText(text),
  };
}

function pickMergedOrRendered(merged: string, rendered: string): string {
  return hasUnresolvedMergeFields(merged) ? rendered : merged;
}

export function resolveTemplateContent(opts: {
  templateName: string;
  templateData: Record<string, unknown>;
  renderedHtml: string;
  renderedText: string;
  renderedSubject: string;
  override: { subject: string; html: string; text: string } | null;
}): { html: string; text: string; subject: string } {
  const { templateName, templateData, renderedHtml, renderedText, renderedSubject, override } =
    opts;

  if (!override) {
    return { html: renderedHtml, text: renderedText, subject: renderedSubject };
  }

  let html = upgradeOverrideLiteralsToMergeFields(override.html, templateName);
  let text = upgradeOverrideLiteralsToMergeFields(override.text, templateName);
  let subject = upgradeOverrideLiteralsToMergeFields(override.subject, templateName);

  const canMerge =
    hasTemplateMergeFields(html) || hasTemplateMergeFields(text) || hasTemplateMergeFields(subject);

  if (!canMerge) {
    const html = AUTH_TEMPLATE_NAMES.has(templateName)
      ? stripAuthTransactionalGreetings(renderedHtml)
      : renderedHtml;
    return { html, text: renderedText, subject: renderedSubject };
  }

  const mergedHtml = pickMergedOrRendered(
    applyTemplateMergeFields(html, templateData),
    renderedHtml,
  );
  const mergedText = pickMergedOrRendered(
    applyTemplateMergeFields(text, templateData),
    renderedText,
  );
  const mergedSubject = pickMergedOrRendered(
    applyTemplateMergeFields(subject, templateData),
    renderedSubject,
  );

  if (AUTH_TEMPLATE_NAMES.has(templateName)) {
    return {
      html: stripAuthTransactionalGreetings(mergedHtml),
      text: stripAuthTransactionalGreetings(mergedText),
      subject: stripAuthTransactionalGreetings(mergedSubject),
    };
  }

  return {
    html: mergedHtml,
    text: mergedText,
    subject: mergedSubject,
  };
}

export function listTemplateMergeFields(templateName: string): string[] {
  const authFields = AUTH_MERGE_FIELDS_BY_TEMPLATE[templateName];
  if (authFields) return [...authFields, "emailLogoUrl", "emailFooterLogoUrl"];

  const preview = getTemplateSampleProps(templateName);
  const keys = new Set<string>(Object.keys(preview));
  keys.add("emailLogoUrl");
  keys.add("emailFooterLogoUrl");
  keys.add("fullName");
  keys.add("siteName");
  keys.add("siteUrl");
  if (preview.qaDevices) keys.add("qaDevicesLabel");
  if (preview.recipientName) keys.add("recipientName");
  return Array.from(keys).sort();
}
