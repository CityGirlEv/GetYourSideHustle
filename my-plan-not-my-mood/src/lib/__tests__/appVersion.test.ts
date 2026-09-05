import { describe, expect, it } from 'vitest';
import { APP_RELEASE, getAppVersionLabel, getAppVersionStamp } from '../appVersion';

describe('appVersion', () => {
  it('labels the release as Alpha V1.1', () => {
    expect(getAppVersionLabel()).toBe('Alpha V1.1');
    expect(APP_RELEASE.channel).toBe('Alpha');
    expect(APP_RELEASE.major).toBe(1);
    expect(APP_RELEASE.minor).toBe(1);
  });

  it('includes day stamp and day build increment', () => {
    expect(APP_RELEASE.buildDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(APP_RELEASE.dayBuild).toBeGreaterThanOrEqual(1);
    expect(getAppVersionStamp()).toBe(
      `Alpha V1.1 · ${APP_RELEASE.buildDate} #${APP_RELEASE.dayBuild}`,
    );
  });
});
