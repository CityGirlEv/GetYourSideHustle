import { useEffect, useState } from "react";
import {
  ROLLOUT_CHANNEL_LABELS,
  ROLLOUT_CHANNELS,
  ROLLOUT_OWNERS,
  SOFT_LAUNCH_ITEM_STATUSES,
  SOFT_LAUNCH_ITEM_STATUS_LABELS,
  type SoftLaunchItem,
  type SoftLaunchItemStatus,
} from "../../lib/gysh-soft-launch-rollout";
import {
  linesToList,
  listToLines,
  type SoftLaunchItemPatch,
} from "../../lib/soft-launch-item-overrides";

type Props = {
  item: SoftLaunchItem;
  /** Effective status shown in the list (explicit override or auto-derived). */
  itemStatus: SoftLaunchItemStatus;
  hasOverride: boolean;
  busy?: boolean;
  onSave: (patch: SoftLaunchItemPatch) => void | Promise<void>;
  onReset: () => void | Promise<void>;
};

export function SoftLaunchItemEditor({
  item,
  itemStatus,
  hasOverride,
  busy = false,
  onSave,
  onReset,
}: Props) {
  const [title, setTitle] = useState(item.title);
  const [day, setDay] = useState(item.day);
  const [sprint, setSprint] = useState<string>(String(item.sprint));
  const [channel, setChannel] = useState(item.channel);
  const [owner, setOwner] = useState(item.owner);
  const [status, setStatus] = useState<SoftLaunchItemStatus>(itemStatus);
  const [postTime, setPostTime] = useState(item.postTime ?? "");
  const [copy, setCopy] = useState(item.copy ?? "");
  const [imagePrompt, setImagePrompt] = useState(item.imagePrompt ?? "");
  const [videoPrompt, setVideoPrompt] = useState(item.videoPrompt ?? "");
  const [hedraStart, setHedraStart] = useState(item.hedraStartImagePrompt ?? "");
  const [hedraVideo, setHedraVideo] = useState(item.hedraVideoPrompt ?? "");
  const [relatedTests, setRelatedTests] = useState(
    listToLines(item.relatedTestIds),
  );
  const [artifacts, setArtifacts] = useState(listToLines(item.artifacts));
  const [websiteActions, setWebsiteActions] = useState(
    listToLines(item.websiteActions),
  );
  const [notes, setNotes] = useState(item.notes ?? "");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setTitle(item.title);
    setDay(item.day);
    setSprint(String(item.sprint));
    setChannel(item.channel);
    setOwner(item.owner);
    setStatus(itemStatus);
    setPostTime(item.postTime ?? "");
    setCopy(item.copy ?? "");
    setImagePrompt(item.imagePrompt ?? "");
    setVideoPrompt(item.videoPrompt ?? "");
    setHedraStart(item.hedraStartImagePrompt ?? "");
    setHedraVideo(item.hedraVideoPrompt ?? "");
    setRelatedTests(listToLines(item.relatedTestIds));
    setArtifacts(listToLines(item.artifacts));
    setWebsiteActions(listToLines(item.websiteActions));
    setNotes(item.notes ?? "");
    setMsg("");
  }, [item, itemStatus]);

  const buildPatch = (): SoftLaunchItemPatch => ({
    title: title.trim(),
    day: day.trim(),
    sprint: Number(sprint) as 2 | 3 | 4 | 5,
    channel,
    owner,
    status,
    postTime: postTime.trim() || null,
    copy: copy.trim() || null,
    imagePrompt: imagePrompt.trim() || null,
    videoPrompt: videoPrompt.trim() || null,
    hedraStartImagePrompt: hedraStart.trim() || null,
    hedraVideoPrompt: hedraVideo.trim() || null,
    relatedTestIds: linesToList(relatedTests),
    artifacts: linesToList(artifacts),
    websiteActions: linesToList(websiteActions),
    notes: notes.trim() || null,
  });

  return (
    <form
      className="soft-launch-item-editor"
      data-testid={`factory-item-editor-${item.id}`}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setMsg("");
        void (async () => {
          try {
            await onSave(buildPatch());
            setMsg("Saved.");
          } catch {
            setMsg("Save failed.");
          }
        })();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="soft-launch-item-editor__heading">
        <strong>Edit calendar item</strong>
        {hasOverride ? (
          <span className="soft-launch-item-editor__badge">Customized</span>
        ) : null}
      </div>

      <label>
        Title
        <input
          className="text-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          data-testid={`factory-item-title-${item.id}`}
        />
      </label>

      <div className="soft-launch-item-editor__row">
        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SoftLaunchItemStatus)}
            data-testid={`factory-item-editor-status-${item.id}`}
          >
            {SOFT_LAUNCH_ITEM_STATUSES.map((st) => (
              <option key={st} value={st}>
                {SOFT_LAUNCH_ITEM_STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Due date
          <input
            className="text-input"
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
            data-testid={`factory-item-day-${item.id}`}
          />
        </label>
        <label>
          Sprint
          <select
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            data-testid={`factory-item-sprint-${item.id}`}
          >
            {[2, 3, 4, 5].map((s) => (
              <option key={s} value={s}>
                Sprint {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Owner
          <select
            value={owner}
            onChange={(e) => {
              const next = e.target.value as SoftLaunchItem["owner"];
              setOwner(next);
              setMsg("");
              void (async () => {
                try {
                  await onSave({ owner: next });
                  setMsg("Saved.");
                } catch {
                  setMsg("Save failed.");
                }
              })();
            }}
            data-testid={`factory-item-owner-${item.id}`}
          >
            {ROLLOUT_OWNERS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="soft-launch-item-editor__row">
        <label>
          Channel
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as SoftLaunchItem["channel"])}
            data-testid={`factory-item-channel-${item.id}`}
          >
            {ROLLOUT_CHANNELS.map((c) => (
              <option key={c} value={c}>
                {ROLLOUT_CHANNEL_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Post time
          <input
            className="text-input"
            value={postTime}
            onChange={(e) => setPostTime(e.target.value)}
            placeholder="e.g. 6:00 PM CT"
            data-testid={`factory-item-posttime-${item.id}`}
          />
        </label>
      </div>

      <label className="soft-launch-item-editor__notes">
        <span>
          Working notes
          <span className="soft-launch-item-editor__hint">
            Partner comments, blockers, links — with or without images. Not published copy.
          </span>
        </span>
        <textarea
          className="text-input"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Trailer deferred to Sprint 3 · channel art in Drive · waiting on Tina photo"
          data-testid={`factory-item-notes-${item.id}`}
        />
      </label>

      <label>
        <span>
          Copy
          <span className="soft-launch-item-editor__hint">
            Words to publish (caption, description, newsletter body).
          </span>
        </span>
        <textarea
          className="text-input"
          rows={5}
          value={copy}
          onChange={(e) => setCopy(e.target.value)}
          data-testid={`factory-item-copy-${item.id}`}
        />
      </label>

      <label>
        <span>
          Image prompt
          <span className="soft-launch-item-editor__hint">
            How to generate/design the still graphic — paste into AI image tools.
          </span>
        </span>
        <textarea
          className="text-input"
          rows={3}
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
        />
      </label>
      <label>
        <span>
          Video prompt
          <span className="soft-launch-item-editor__hint">
            High-level video brief (length, hook, CTA) — not partner notes.
          </span>
        </span>
        <textarea
          className="text-input"
          rows={3}
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
        />
      </label>
      <label>
        <span>
          Hedra start image prompt
          <span className="soft-launch-item-editor__hint">
            Starting-frame still for Hedra (when this item ships video).
          </span>
        </span>
        <textarea
          className="text-input"
          rows={3}
          value={hedraStart}
          onChange={(e) => setHedraStart(e.target.value)}
        />
      </label>
      <label>
        <span>
          Hedra video prompt
          <span className="soft-launch-item-editor__hint">
            Motion/animation prompt for Hedra from the start frame.
          </span>
        </span>
        <textarea
          className="text-input"
          rows={3}
          value={hedraVideo}
          onChange={(e) => setHedraVideo(e.target.value)}
        />
      </label>

      <label>
        Related test IDs (one per line)
        <textarea
          className="text-input"
          rows={2}
          value={relatedTests}
          onChange={(e) => setRelatedTests(e.target.value)}
          placeholder="VIDEO-003"
          data-testid={`factory-item-tests-${item.id}`}
        />
      </label>
      <label>
        Artifacts (one per line)
        <textarea
          className="text-input"
          rows={4}
          value={artifacts}
          onChange={(e) => setArtifacts(e.target.value)}
          data-testid={`factory-item-artifacts-${item.id}`}
        />
      </label>
      <label>
        Website actions (one per line)
        <textarea
          className="text-input"
          rows={2}
          value={websiteActions}
          onChange={(e) => setWebsiteActions(e.target.value)}
        />
      </label>

      <div className="soft-launch-item-editor__actions">
        <button
          type="submit"
          className="btn"
          disabled={busy || !title.trim() || !day.trim()}
          data-testid={`factory-item-save-${item.id}`}
        >
          Save item
        </button>
        {hasOverride ? (
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            data-testid={`factory-item-reset-${item.id}`}
            onClick={() => {
              setMsg("");
              void (async () => {
                try {
                  await onReset();
                  setMsg("Reset to catalog defaults.");
                } catch {
                  setMsg("Reset failed.");
                }
              })();
            }}
          >
            Reset to default
          </button>
        ) : null}
        {msg ? <span className="soft-launch-item-editor__msg">{msg}</span> : null}
      </div>
    </form>
  );
}
