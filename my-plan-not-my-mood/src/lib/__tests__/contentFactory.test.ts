import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PHASE_1_CONTENT_FACTORY,
  CF_CHANNEL_LABELS,
  CF_CHANNELS,
  CF_POSTING_RESUME_ISO,
  cfPostIsImageOnly,
  cfPostingShiftDays,
  contentFactoryGearItems,
  contentFactoryHasChannelCoverage,
  contentFactoryHasNumberedTask,
  contentFactoryHasSprintAndAssigneeCoverage,
  contentFactoryLinkedTask,
  contentFactoryLogoItems,
  ensureShopLinkInCopy,
  filterContentFactoryItems,
  formatCfDueChip,
  formatCfWhen,
  formatContentFactoryCode,
  groupContentFactoryByChannel,
  groupContentFactoryBySprint,
  overlayContentFactoryEdits,
  overlayContentFactoryStatuses,
  parseContentFactoryEdits,
  parseContentFactoryStatuses,
  setContentFactoryItemField,
  setContentFactoryStatus,
} from '../contentFactory';
import { TEE_LIFESTYLE_MOCKUP_PATH, TEE_SALES_SHOP_URL } from '../teeSalesPlaybook';

describe('contentFactory', () => {
  it('lays out Phase 1 content across every sprint with Angela and Evelyn owners', () => {
    expect(contentFactoryHasSprintAndAssigneeCoverage()).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.every((item) => item.phase === 'Phase 1')).toBe(true);
    const grouped = groupContentFactoryBySprint(overlayContentFactoryStatuses(PHASE_1_CONTENT_FACTORY));
    expect(grouped['Sprint 0'].length).toBe(0);
    expect(grouped['Sprint 1'].filter((item) => item.rolledOver).length).toBe(0);
    expect(grouped['Sprint 2'].filter((item) => item.rolledOver).length).toBeGreaterThanOrEqual(5);
    expect(grouped['Sprint 2'].some((item) => item.assignee === 'angela')).toBe(true);
    expect(grouped['Sprint 2'].some((item) => item.assignee === 'evelyn')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.filter((item) => item.assignee === 'angela' && item.kind === 'post').length).toBeGreaterThanOrEqual(20);
  });

  it('puts Gear Selections work in Sprint 2 after the posting calendar shift and filters by sprint and assignee', () => {
    const gear = contentFactoryGearItems();
    expect(gear.length).toBeGreaterThanOrEqual(4);
    expect(gear.every((item) => item.dateIso >= '2026-09-04')).toBe(true);
    expect(gear.some((item) => item.sprint === 'Sprint 2')).toBe(true);
    expect(gear.some((item) => item.taskId === 't-27')).toBe(true);
    expect(gear.some((item) => item.taskId === 't-7')).toBe(true);
    const angelaSprint1 = filterContentFactoryItems(PHASE_1_CONTENT_FACTORY, {
      sprints: new Set(['Sprint 1']),
      assignees: new Set(['angela']),
    });
    expect(angelaSprint1.every((item) => item.sprint === 'Sprint 1' && item.assignee === 'angela')).toBe(true);
    expect(angelaSprint1.length).toBeGreaterThan(0);
    expect(
      filterContentFactoryItems(PHASE_1_CONTENT_FACTORY, { search: 'Gear' }).some((item) => item.kind === 'gear'),
    ).toBe(true);
    expect(
      filterContentFactoryItems(PHASE_1_CONTENT_FACTORY, { search: 'E-ShirtLebberingBeige' }).length,
    ).toBeGreaterThan(0);
    expect(
      filterContentFactoryItems(PHASE_1_CONTENT_FACTORY, { search: 'TShirtTieDieRainbowSpiral' }).length,
    ).toBeGreaterThan(0);
  });

  it('puts Logo Concepts work in Sprint 0/1 for Evelyn upload and Angela pick', () => {
    const logos = overlayContentFactoryStatuses(contentFactoryLogoItems());
    expect(logos.length).toBeGreaterThanOrEqual(2);
    expect(logos.some((item) => item.taskId === 't-41' && item.assignee === 'evelyn' && item.sprint === 'Sprint 2')).toBe(true);
    expect(logos.some((item) => item.taskId === 't-42' && item.assignee === 'angela')).toBe(true);
    expect(
      filterContentFactoryItems(PHASE_1_CONTENT_FACTORY, { search: 'Logo Concepts' }).some((item) => item.kind === 'logo'),
    ).toBe(true);
  });

  it('overlays saved status without dropping seed copy', () => {
    const overlay = overlayContentFactoryStatuses(PHASE_1_CONTENT_FACTORY, {
      'cf-s0-mon-angela': 'done',
    });
    expect(overlay.find((item) => item.id === 'cf-s0-mon-angela')?.status).toBe('done');
    expect(overlay.find((item) => item.id === 'cf-s0-mon-angela')?.sprint).toBe('Sprint 0');
    expect(overlay.find((item) => item.id === 'cf-s0-mon-angela')?.rolledOver).toBeFalsy();
    expect(overlay.find((item) => item.id === 'cf-s0-mon-angela')?.copy).toMatch(/Follow the Plan/i);
    expect(parseContentFactoryStatuses({ 'cf-s0-mon-angela': 'blocked', junk: 'nope' })).toEqual({
      'cf-s0-mon-angela': 'blocked',
    });
    expect(setContentFactoryStatus({}, 'cf-s0-mon-angela', 'in_progress')['cf-s0-mon-angela']).toBe('in_progress');
  });

  it('overlays edited copy, image prompt, and video prompt, and resets to seed', () => {
    const seed = PHASE_1_CONTENT_FACTORY.find((item) => item.id === 'cf-s0-mon-angela')!;
    let edits = setContentFactoryItemField({}, seed, 'copy', 'New caption with https://nonnegotiation.com/gear');
    edits = setContentFactoryItemField(edits, seed, 'imagePrompt', 'Close crop of the seal.');
    edits = setContentFactoryItemField(edits, seed, 'videoPrompt', '1 scene, 15 seconds. Hold the seal.');
    const overlay = overlayContentFactoryEdits(PHASE_1_CONTENT_FACTORY, edits);
    const row = overlay.find((item) => item.id === 'cf-s0-mon-angela')!;
    expect(row.copy).toBe('New caption with https://nonnegotiation.com/gear');
    expect(row.imagePrompt).toBe('Close crop of the seal.');
    expect(row.videoPrompt).toBe('1 scene, 15 seconds. Hold the seal.');
    expect(seed.copy).toMatch(/Follow the Plan/i);

    const clearedVideo = overlayContentFactoryEdits(
      PHASE_1_CONTENT_FACTORY,
      setContentFactoryItemField(edits, seed, 'videoPrompt', '   '),
    ).find((item) => item.id === 'cf-s0-mon-angela')!;
    expect(clearedVideo.videoPrompt).toBeUndefined();
    expect(cfPostIsImageOnly(clearedVideo)).toBe(true);

    expect(parseContentFactoryEdits({ 'cf-s0-mon-angela': { copy: 'Hi', junk: 9 }, nope: 'x' })).toEqual({
      'cf-s0-mon-angela': { copy: 'Hi' },
    });
    expect(parseContentFactoryEdits(null)).toEqual({});
    const restored = setContentFactoryItemField(edits, seed, 'copy', seed.copy);
    expect(overlayContentFactoryEdits(PHASE_1_CONTENT_FACTORY, restored).find((item) => item.id === seed.id)?.copy).toBe(
      seed.copy,
    );
  });

  it('filters and groups by Facebook, YouTube, TikTok, Personal, and Website channels', () => {
    expect(CF_CHANNELS).toEqual(['facebook', 'youtube', 'tiktok', 'personal', 'website']);
    expect(contentFactoryHasChannelCoverage()).toBe(true);
    expect(CF_CHANNEL_LABELS.facebook).toBe('Facebook');
    expect(CF_CHANNEL_LABELS.youtube).toBe('YouTube');
    expect(CF_CHANNEL_LABELS.tiktok).toBe('TikTok');
    expect(CF_CHANNEL_LABELS.personal).toBe('Personal');
    expect(CF_CHANNEL_LABELS.website).toBe('Website');
    const tiktokOnly = filterContentFactoryItems(PHASE_1_CONTENT_FACTORY, {
      channels: new Set(['tiktok']),
    });
    expect(tiktokOnly.length).toBeGreaterThan(0);
    expect(tiktokOnly.every((item) => item.channel === 'tiktok')).toBe(true);
    const byChannel = groupContentFactoryByChannel(PHASE_1_CONTENT_FACTORY);
    expect(byChannel.facebook.length).toBeGreaterThan(0);
    expect(byChannel.youtube.length).toBeGreaterThan(0);
    expect(byChannel.tiktok.length).toBeGreaterThan(0);
    expect(byChannel.personal.length).toBeGreaterThan(0);
    expect(byChannel.website.length).toBeGreaterThan(0);
  });

  it('numbers content factory items as CF-1…', () => {
    expect(formatContentFactoryCode(PHASE_1_CONTENT_FACTORY[0].id)).toBe('CF-1');
    expect(formatContentFactoryCode(PHASE_1_CONTENT_FACTORY[9].id)).toBe('CF-10');
  });

  it('slides posting so 26 Aug starts Friday 4 Sep, with welcome rows, video prompts, and numbered tasks', () => {
    expect(cfPostingShiftDays()).toBe(11);
    const posts = PHASE_1_CONTENT_FACTORY.filter((item) => item.kind === 'post');
    expect(posts.length).toBeGreaterThanOrEqual(20);
    expect(posts.every((item) => item.copy.includes('nonnegotiation.com/gear'))).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.every((item) => item.dateIso >= CF_POSTING_RESUME_ISO)).toBe(true);
    expect(posts.every((item) => item.imagePrompt.trim().length > 0)).toBe(true);
    expect(posts.filter((item) => item.videoPrompt).length).toBeGreaterThan(posts.filter(cfPostIsImageOnly).length);
    expect(posts.some(cfPostIsImageOnly)).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.every(contentFactoryHasNumberedTask)).toBe(true);
    expect(contentFactoryLinkedTask('t-74')?.code).toBe('T-74');
    expect(contentFactoryLinkedTask('t-74')?.priority).toBe('high');

    const mood = PHASE_1_CONTENT_FACTORY.find((item) => item.id === 'cf-s0-wed-angela');
    expect(mood?.dateIso).toBe('2026-09-06');
    const brand = PHASE_1_CONTENT_FACTORY.find((item) => item.id === 'cf-s0-mon-angela');
    expect(brand?.dateIso).toBe('2026-09-05');
    expect(formatCfWhen(brand!)).toMatch(/Due Sat, Sep 5, 2026/i);
    expect(formatCfDueChip(brand!)).toBe('Due Sep 5');
    const logos = PHASE_1_CONTENT_FACTORY.find((item) => item.id === 'cf-s0-tue-evelyn-logos');
    expect(logos?.dateIso).toBe('2026-09-05');

    const welcomes = PHASE_1_CONTENT_FACTORY.filter((item) => item.id.startsWith('cf-s0-welcome-'));
    expect(welcomes.map((item) => item.channel).sort()).toEqual(['facebook', 'personal', 'tiktok', 'website', 'youtube']);
    expect(welcomes.every((item) => item.dateIso === '2026-09-04' && item.taskId === 't-74')).toBe(true);
    expect(welcomes.every((item) => /NonNegotiation/i.test(`${item.copy} ${item.visualPrompt}`))).toBe(true);

    const fridayPosts = PHASE_1_CONTENT_FACTORY.filter(
      (item) => item.dateIso === '2026-09-04' && item.kind === 'post',
    );
    expect(fridayPosts.filter((item) => item.channel === 'facebook')).toHaveLength(1);
    expect(fridayPosts.filter((item) => item.channel === 'tiktok')).toHaveLength(1);
    expect(fridayPosts.filter((item) => item.channel === 'youtube')).toHaveLength(1);
    expect(fridayPosts.map((item) => item.id).sort()).toEqual(
      [
        'cf-s0-welcome-facebook',
        'cf-s0-welcome-personal',
        'cf-s0-welcome-tiktok',
        'cf-s0-welcome-website',
        'cf-s0-welcome-youtube',
      ].sort(),
    );

    const blob = PHASE_1_CONTENT_FACTORY.map((item) => `${item.title} ${item.copy} ${item.visualPrompt}`).join(' ');
    expect(blob).not.toMatch(/link soon|when the shop opens|shop is not live/i);
    expect(ensureShopLinkInCopy('Feel it.')).toContain(TEE_SALES_SHOP_URL);

    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-63')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-65')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-66')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-67')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-68')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-71')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-72')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-64')).toBe(true);
    expect(PHASE_1_CONTENT_FACTORY.some((item) => item.taskId === 't-70')).toBe(true);
    expect(posts.filter((item) => item.visualSrc === TEE_LIFESTYLE_MOCKUP_PATH).length).toBeGreaterThan(5);
    expect(
      existsSync(resolve(process.cwd(), 'public/images/apparel_tee_lifestyle.jpg')),
    ).toBe(true);
  });
});
