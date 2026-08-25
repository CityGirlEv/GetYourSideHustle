import { describe, expect, it } from "vitest";
import { draftsMarkedPublishedForDoneItems } from "../gysh-content-factory";
import {
  PERSONAL_AMPLIFY_CADENCE,
  PERSONAL_AMPLIFY_PLAYBOOK,
  ROLLOUT_CHANNELS,
  ROLLOUT_OWNERS,
  SOFT_LAUNCH_FACTORY_SPRINTS,
  SOFT_LAUNCH_ITEM_STATUSES,
  SOFT_LAUNCH_ITEM_STATUS_LABELS,
  contentFactoryItemStatusClass,
  SOFT_LAUNCH_ROLLOUT,
  draftBelongsToSoftLaunchItem,
  filterSoftLaunchByOwner,
  personalAmplifyItem,
  rolloutChannelCounts,
  rolloutItemToDraftFields,
  rolloutOwnerCounts,
  softLaunchCrossLinks,
  softLaunchFactoryDefaultSprint,
  softLaunchFactoryDefaultSprints,
  softLaunchItemById,
  softLaunchItemCompletion,
  softLaunchItemFromTaskId,
  softLaunchItemFromTestId,
  softLaunchItemRef,
  softLaunchProjectionForItem,
  softLaunchStandaloneProjections,
  softLaunchTaskId,
  softLaunchTaskSeeds,
} from "../gysh-soft-launch-rollout";

describe("gysh-soft-launch-rollout", () => {
  const ytFirstShort = SOFT_LAUNCH_ROLLOUT.find((i) => i.id === "sl-s3-yt-first-short");

  it("builds Task List ids from calendar item ids", () => {
    expect(softLaunchTaskId("sl-s3-yt-first-short")).toBe("T-SL-S3-YT-FIRST-SHORT");
  });

  it("defaults Content Factory sprint filter to the live soft-launch sprint", () => {
    expect(softLaunchFactoryDefaultSprint(new Date(2026, 7, 3))).toBe(2);
    expect(softLaunchFactoryDefaultSprint(new Date(2026, 7, 5))).toBe(3); // pause → Sprint 3
    expect(softLaunchFactoryDefaultSprint(new Date(2026, 7, 18))).toBe(3);
    expect(softLaunchFactoryDefaultSprint(new Date(2026, 5, 1))).toBe(2);
    expect(SOFT_LAUNCH_FACTORY_SPRINTS).toContain(
      softLaunchFactoryDefaultSprint(new Date(2026, 7, 3)),
    );
  });

  it("defaults Content Factory to current and next soft-launch sprint", () => {
    expect(softLaunchFactoryDefaultSprints(new Date(2026, 7, 3))).toEqual([2, 3]);
    expect(softLaunchFactoryDefaultSprints(new Date(2026, 7, 5))).toEqual([3, 4]);
    expect(softLaunchFactoryDefaultSprints(new Date(2026, 7, 18))).toEqual([3, 4]);
    expect(softLaunchFactoryDefaultSprints(new Date(2026, 8, 2))).toEqual([5]); // Sep 2 → Sprint 5
    expect(softLaunchFactoryDefaultSprints(new Date(2026, 5, 1))).toEqual([2, 3]);
  });

  it("filters and counts calendar items by assignee", () => {
    expect(ROLLOUT_OWNERS).toEqual(["Tina", "Evelyn", "Both"]);
    const counts = rolloutOwnerCounts(SOFT_LAUNCH_ROLLOUT);
    expect(counts.all).toBe(SOFT_LAUNCH_ROLLOUT.length);
    expect(counts.Tina + counts.Evelyn + counts.Both).toBe(counts.all);
    const tinaOnly = filterSoftLaunchByOwner(SOFT_LAUNCH_ROLLOUT, new Set(["Tina"]));
    expect(tinaOnly.length).toBe(counts.Tina);
    expect(tinaOnly.every((i) => i.owner === "Tina")).toBe(true);
    expect(filterSoftLaunchByOwner(SOFT_LAUNCH_ROLLOUT, new Set()).length).toBe(
      SOFT_LAUNCH_ROLLOUT.length,
    );
    const both = filterSoftLaunchByOwner(SOFT_LAUNCH_ROLLOUT, ["Tina", "Both"]);
    expect(both.every((i) => i.owner === "Tina" || i.owner === "Both")).toBe(true);
  });

  it("ties the first YouTube Short to Task T-SL-S3-YT-FIRST-SHORT and Test VIDEO-003-EVELYN", () => {
    expect(ytFirstShort).toBeTruthy();
    const links = softLaunchCrossLinks(ytFirstShort!);
    expect(links.taskId).toBe("T-SL-S3-YT-FIRST-SHORT");
    expect(links.testIds).toEqual(["VIDEO-003-EVELYN", "VIDEO-003-TINA"]);
  });

  it("uses the every-age montage brief for the first YouTube Short", () => {
    expect(ytFirstShort!.videoPrompt).toMatch(/Side hustles for every age\?/i);
    expect(ytFirstShort!.videoPrompt).toMatch(/Home\s*→\s*Pick Your Path\s*→\s*Wizard\s*→\s*Blueprint/i);
    expect(ytFirstShort!.videoPrompt).toMatch(/Start free/i);
    expect(ytFirstShort!.hedraVideoPrompt).toMatch(/Home hero/i);
    expect(ytFirstShort!.hedraVideoPrompt).toMatch(/Pick Your Path/i);
    expect(ytFirstShort!.hedraVideoPrompt).toMatch(/Blueprint/i);
  });

  it("exposes Done in the Content Factory status list", () => {
    expect(SOFT_LAUNCH_ITEM_STATUSES).toContain("done");
    expect(SOFT_LAUNCH_ITEM_STATUS_LABELS.done).toBe("Done");
  });

  it("maps Content Factory item status to Task List–matching card classes", () => {
    expect(contentFactoryItemStatusClass("not_started")).toBe("content-factory__item--not_started");
    expect(contentFactoryItemStatusClass("in_progress")).toBe("content-factory__item--in_progress");
    expect(contentFactoryItemStatusClass("blocked")).toBe("content-factory__item--blocked");
    expect(contentFactoryItemStatusClass("done")).toBe("content-factory__item--done");
    expect(contentFactoryItemStatusClass("unknown")).toBe("content-factory__item--not_started");
  });

  it("populates publishable Copy for every social / newsletter calendar item", () => {
    const socialChannels = new Set([
      "facebook_gysh",
      "facebook_kevina",
      "youtube_gysh",
      "tiktok_gysh",
      "instagram_gysh",
      "newsletter",
      "personal_amplify",
    ]);
    const missing = SOFT_LAUNCH_ROLLOUT.filter(
      (i) => socialChannels.has(i.channel) && !String(i.copy || "").trim(),
    ).map((i) => i.id);
    expect(missing).toEqual([]);
    const short2 = softLaunchItemById("sl-s4-yt-short-2");
    expect(short2?.copy).toMatch(/Free Side Hustle Blueprint/i);
    expect(softLaunchItemById("sl-s2-yt-create")?.copy).toMatch(/ABOUT/i);
    expect(softLaunchItemById("sl-s5-multi-channel-repost")?.copy).toMatch(/INSTAGRAM/i);
  });

  it("lists task and test numbers in Short artifacts", () => {
    const joined = ytFirstShort!.artifacts.join("\n");
    expect(joined).toContain("T-SL-S3-YT-FIRST-SHORT");
    expect(joined).toContain("VIDEO-003-EVELYN");
  });

  it("seeds draft body with clickable TASK + QA TESTS deep links", () => {
    const fields = rolloutItemToDraftFields(ytFirstShort!);
    const cfRef = softLaunchItemRef("sl-s3-yt-first-short");
    expect(fields.body).toContain(`CF: ${cfRef}`);
    expect(fields.body).toContain(
      "[Task T-SL-S3-YT-FIRST-SHORT](/admin?tab=tasks&task=T-SL-S3-YT-FIRST-SHORT)",
    );
    expect(fields.body).toContain(
      `[Content Factory ${cfRef}](/admin?tab=factory&panel=launch-plan&item=sl-s3-yt-first-short)`,
    );
    expect(fields.body).toContain(
      "[Test VIDEO-003-EVELYN](/admin?tab=testing&test=VIDEO-003-EVELYN)",
    );
    expect(fields.body).toContain(
      "[Test VIDEO-003-TINA](/admin?tab=testing&test=VIDEO-003-TINA)",
    );
  });

  it("reverse-maps task and test ids back to Content Factory items", () => {
    expect(softLaunchItemById("sl-s3-yt-first-short")?.id).toBe("sl-s3-yt-first-short");
    expect(softLaunchItemFromTaskId("T-SL-S3-YT-FIRST-SHORT")?.id).toBe("sl-s3-yt-first-short");
    expect(softLaunchItemFromTestId("VIDEO-003-EVELYN")?.id).toBe("sl-s3-yt-first-short");
    expect(softLaunchItemFromTestId("VIDEO-003-TINA")?.id).toBe("sl-s3-yt-first-short");
    expect(softLaunchItemFromTestId("VIDEO-003")?.id).toBe("sl-s3-yt-first-short");
    expect(softLaunchItemFromTaskId("T-999")).toBeUndefined();
  });

  it("combines Sprint 3 Polish + cadence projection into one CF calendar item", () => {
    const item = softLaunchItemById("sl-s3-polish-cadence");
    expect(item?.title).toBe("Sprint 3 — Polish + cadence");
    expect(softLaunchTaskId(item!.id)).toBe("T-SL-S3-POLISH-CADENCE");
    expect(softLaunchItemRef(item!.id)).toMatch(/^CF-\d{3}$/);
    expect(softLaunchProjectionForItem("sl-s3-polish-cadence")?.opsItemId).toBe(
      "sl-s3-polish-cadence",
    );
    expect(softLaunchStandaloneProjections(3).some((p) => p.sprint === 3)).toBe(false);
  });

  it("counts calendar items per channel for filter bubbles", () => {
    const all = rolloutChannelCounts();
    expect(all.all).toBe(SOFT_LAUNCH_ROLLOUT.length);
    expect(all.youtube_gysh).toBeGreaterThan(0);
    expect(all.facebook_gysh).toBeGreaterThan(0);
    expect(all.personal_amplify).toBeGreaterThan(0);
    const s3 = rolloutChannelCounts(3);
    expect(s3.all).toBe(SOFT_LAUNCH_ROLLOUT.filter((i) => i.sprint === 3).length);
    expect(ROLLOUT_CHANNELS).toContain("instagram_gysh");
    expect(ROLLOUT_CHANNELS).toContain("personal_amplify");
  });

  it("schedules Personal amplify across Sprints 3–5 on the growth cadence", () => {
    const amplify = SOFT_LAUNCH_ROLLOUT.filter((i) => i.channel === "personal_amplify");
    expect(amplify).toHaveLength(PERSONAL_AMPLIFY_CADENCE.length * 2);
    expect(amplify.every((i) => i.owner === "Tina" || i.owner === "Evelyn")).toBe(true);
    expect(amplify.filter((i) => i.sprint === 3)).toHaveLength(6);
    expect(amplify.filter((i) => i.sprint === 4)).toHaveLength(8);
    expect(amplify.filter((i) => i.sprint === 5)).toHaveLength(6);

    const wrapTina = softLaunchItemById("sl-s3-personal-amplify-wrap-tina");
    const wrapEvelyn = softLaunchItemById("sl-s3-personal-amplify-wrap-evelyn");
    expect(wrapTina?.day).toBe("2026-08-24");
    expect(wrapTina?.owner).toBe("Tina");
    expect(wrapEvelyn?.owner).toBe("Evelyn");
    expect(softLaunchTaskId(wrapTina!.id)).toBe("T-SL-S3-PERSONAL-AMPLIFY-WRAP-TINA");
    expect(wrapTina!.copy).toContain("PERSONAL AMPLIFY");
    expect(wrapTina!.copy).toMatch(/week wrap/i);
    expect(PERSONAL_AMPLIFY_PLAYBOOK).toMatch(/prefer 6–9 PM CT/i);
    expect(PERSONAL_AMPLIFY_PLAYBOOK).toMatch(/3–4 personal shares/i);
    expect(PERSONAL_AMPLIFY_CADENCE.map((r) => r.day)).toEqual([
      "2026-08-18",
      "2026-08-20",
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-28",
      "2026-08-30",
      "2026-09-02",
      "2026-09-04",
      "2026-09-05",
    ]);

    const igTt = softLaunchItemById("sl-s4-personal-amplify-ig-tt-tina");
    expect(igTt?.sprint).toBe(4);
    expect(igTt?.copy).toMatch(/Instagram/i);
    expect(igTt?.copy).toMatch(/TikTok/i);

    const wrapSeed = softLaunchTaskSeeds({
      onlyIds: ["T-SL-S3-PERSONAL-AMPLIFY-WRAP-TINA"],
    })[0];
    expect(wrapSeed?.assignedTo).toBe("Tina");
    expect(wrapSeed?.dueDate).toBe("08/24/26");
    expect(wrapSeed?.sprint).toBe(3);

    const fields = rolloutItemToDraftFields(wrapTina!);
    expect(fields.body).toMatch(/Share → your personal timeline/i);
    const helper = personalAmplifyItem({
      id: "sl-test-amplify",
      sprint: 3,
      day: "2026-08-24",
      owner: "Tina",
      title: "Test amplify",
      amplifyTargets: "• GYSH FB test",
    });
    expect(helper.channel).toBe("personal_amplify");
    expect(helper.owner).toBe("Tina");
    expect(helper.artifacts.some((a) => /Tina: personal Facebook/i.test(a))).toBe(true);
    expect(helper.artifacts.some((a) => /Evelyn: personal Facebook/i.test(a))).toBe(false);
  });

  it("marks Content Factory item done only when task and linked tests are done", () => {
    const item = ytFirstShort!;
    const bothPass = {
      "VIDEO-003-EVELYN": "pass",
      "VIDEO-003-TINA": "pass",
    } as const;
    const open = softLaunchItemCompletion(item, {
      taskStatusById: { "T-SL-S3-YT-FIRST-SHORT": "in_progress" },
      testStatusById: bothPass,
    });
    expect(open.taskStatus).toBe("in_progress");
    expect(open.testStatusById["VIDEO-003-EVELYN"]).toBe("pass");
    expect(open.testStatusById["VIDEO-003-TINA"]).toBe("pass");
    expect(open.taskDone).toBe(false);
    expect(open.testsDone).toBe(true);
    expect(open.itemStatus).toBe("in_progress");
    expect(open.itemDone).toBe(false);

    const taskOnly = softLaunchItemCompletion(item, {
      taskStatusById: { "T-SL-S3-YT-FIRST-SHORT": "done" },
      testStatusById: { "VIDEO-003-EVELYN": "fail", "VIDEO-003-TINA": "pass" },
    });
    expect(taskOnly.taskStatus).toBe("done");
    expect(taskOnly.testStatusById["VIDEO-003-EVELYN"]).toBe("fail");
    expect(taskOnly.taskDone).toBe(true);
    expect(taskOnly.testsDone).toBe(false);
    expect(taskOnly.itemStatus).toBe("in_progress");
    expect(taskOnly.itemDone).toBe(false);

    const both = softLaunchItemCompletion(item, {
      taskStatusById: { "T-SL-S3-YT-FIRST-SHORT": "done" },
      testStatusById: bothPass,
    });
    expect(both.itemStatus).toBe("done");
    expect(both.itemDone).toBe(true);
  });

  it("honors explicit Content Factory status like Task List", () => {
    const item = ytFirstShort!;
    const forcedDone = softLaunchItemCompletion(item, {
      taskStatusById: { "T-SL-S3-YT-FIRST-SHORT": "not_started" },
      testStatusById: { "VIDEO-003-EVELYN": "not_run", "VIDEO-003-TINA": "not_run" },
      status: "done",
    });
    expect(forcedDone.statusIsExplicit).toBe(true);
    expect(forcedDone.itemStatus).toBe("done");
    expect(forcedDone.itemDone).toBe(true);

    const blocked = softLaunchItemCompletion(
      { ...item, status: "blocked" },
      {
        taskStatusById: { "T-SL-S3-YT-FIRST-SHORT": "done" },
        testStatusById: { "VIDEO-003-EVELYN": "pass", "VIDEO-003-TINA": "pass" },
      },
    );
    expect(blocked.itemStatus).toBe("blocked");
    expect(blocked.itemDone).toBe(false);
    expect(blocked.linkedDone).toBe(true);
  });

  it("defaults missing statuses to not_started / not_run", () => {
    const c = softLaunchItemCompletion(ytFirstShort!, {});
    expect(c.taskStatus).toBe("not_started");
    expect(c.testStatusById["VIDEO-003-EVELYN"]).toBe("not_run");
    expect(c.testStatusById["VIDEO-003-TINA"]).toBe("not_run");
  });

  it("treats items with no linked tests as done when the task is done", () => {
    const noTest = SOFT_LAUNCH_ROLLOUT.find((i) => !i.relatedTestIds?.length);
    expect(noTest).toBeTruthy();
    const taskId = softLaunchTaskId(noTest!.id);
    const c = softLaunchItemCompletion(noTest!, {
      taskStatusById: { [taskId]: "done" },
      testStatusById: {},
    });
    expect(c.testsDone).toBe(true);
    expect(c.itemDone).toBe(true);
  });

  it("matches seeded drafts to calendar items", () => {
    expect(draftBelongsToSoftLaunchItem("D-SL-sl-s3-yt-first-short-123", "sl-s3-yt-first-short")).toBe(
      true,
    );
    expect(draftBelongsToSoftLaunchItem("D-SL-sl-s2-fb-welcome-1", "sl-s3-yt-first-short")).toBe(
      false,
    );
  });

  it("publishes seeded drafts when the Content Factory item is done", () => {
    const item = ytFirstShort!;
    const completion = softLaunchItemCompletion(item, {
      taskStatusById: { "T-SL-S3-YT-FIRST-SHORT": "done" },
      testStatusById: { "VIDEO-003-EVELYN": "pass", "VIDEO-003-TINA": "pass" },
    });
    const map = new Map([[item.id, completion]]);
    const { drafts, changed } = draftsMarkedPublishedForDoneItems(
      [
        {
          id: `D-SL-${item.id}-1`,
          batchId: "BATCH-SL-1",
          type: "youtube_script",
          title: "[S3] YouTube — First Short",
          excerpt: "",
          body: "",
          audience: "all",
          status: "draft",
          owner: "Both",
          createdAt: "2026-08-03T00:00:00.000Z",
        },
      ],
      map,
    );
    expect(changed).toBe(true);
    expect(drafts[0]?.status).toBe("published");
  });
});
