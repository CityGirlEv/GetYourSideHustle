/**
 * App release label + day-based build increments.
 *
 * When you ship a change on the same calendar day, bump `dayBuild`.
 * When the calendar day changes, set `buildDate` to today and reset `dayBuild` to 1.
 * When you cut a named release (e.g. Alpha V1.2), bump major/minor and reset dayBuild to 1.
 */
export const APP_RELEASE = {
  channel: 'Alpha',
  major: 1,
  minor: 1,
  /** Calendar day for this build (YYYY-MM-DD) */
  buildDate: '2026-08-25',
  /** Sequential build number within buildDate */
  dayBuild: 7,
} as const;

/** Short UI badge — e.g. "Alpha V1.1" */
export function getAppVersionLabel(): string {
  return `${APP_RELEASE.channel} V${APP_RELEASE.major}.${APP_RELEASE.minor}`;
}

/** Full stamp for footers / admin — e.g. "Alpha V1.1 · 2026-08-25 #1" */
export function getAppVersionStamp(): string {
  return `${getAppVersionLabel()} · ${APP_RELEASE.buildDate} #${APP_RELEASE.dayBuild}`;
}
