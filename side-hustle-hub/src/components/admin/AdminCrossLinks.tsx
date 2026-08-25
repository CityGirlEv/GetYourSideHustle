import { useMemo, useState, type CSSProperties } from "react";
import {
  adminStudioPath,
  navigateAdminDeepLink,
  type AdminDeepLinkOpts,
} from "../../lib/admin-deep-links";
import {
  mergeEntityCrossLinks,
  withLiveEntityTitle,
  type AdminEntityKind,
  type AdminEntityLinkRow,
  type AdminEntityRef,
  type AdminEntityTitleMap,
} from "../../lib/admin-entity-links";
import type { AdminLinkCandidate } from "../../lib/admin-link-candidates";
import {
  softLaunchCrossLinks,
  softLaunchItemFromTaskId,
  softLaunchItemFromTestId,
  softLaunchItemRef,
  type SoftLaunchItem,
} from "../../lib/gysh-soft-launch-rollout";

export type { AdminLinkCandidate };

export type AdminCrossLink = {
  label: string;
  opts: AdminDeepLinkOpts;
};

function CrossLinkButton({ link }: { link: AdminCrossLink }) {
  const href = adminStudioPath(link.opts);
  return (
    <a
      href={href}
      className="admin-cross-link"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateAdminDeepLink(link.opts);
      }}
    >
      {link.label}
    </a>
  );
}

/** Clickable deep links that stay in-tab and focus the target task/test/factory item. */
export function AdminCrossLinks({
  links,
  style,
  testId,
  entity,
  edges,
  titles,
  editable = false,
  candidates = [],
  onLink,
  onUnlink,
  busy = false,
}: {
  links: AdminCrossLink[];
  style?: CSSProperties;
  testId?: string;
  /** When set with edges, merges catalog + manual links / suppressions. */
  entity?: AdminEntityRef;
  edges?: AdminEntityLinkRow[];
  /** Live task/test/CF titles — updates chip labels when entities are renamed. */
  titles?: AdminEntityTitleMap;
  editable?: boolean;
  candidates?: AdminLinkCandidate[];
  onLink?: (target: AdminEntityRef) => void | Promise<void>;
  onUnlink?: (target: AdminEntityRef) => void | Promise<void>;
  busy?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickKind, setPickKind] = useState<AdminEntityKind | "">("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);

  const merged = useMemo(() => {
    if (entity && edges) return mergeEntityCrossLinks(entity, links, edges, titles);
    return links
      .map((link) => {
        const target: AdminEntityRef | null = link.opts.taskId
          ? { kind: "task", id: link.opts.taskId }
          : link.opts.testId
            ? { kind: "test", id: link.opts.testId }
            : link.opts.itemId
              ? { kind: "cf", id: link.opts.itemId }
              : null;
        if (!target) return null;
        return {
          ...withLiveEntityTitle(link, titles),
          target,
          source: "catalog" as const,
        };
      })
      .filter(Boolean) as ReturnType<typeof mergeEntityCrossLinks>;
  }, [entity, edges, links, titles]);

  const linkedKeys = useMemo(
    () => new Set(merged.map((l) => `${l.target.kind}:${l.target.id}`)),
    [merged],
  );

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      if (entity && c.kind === entity.kind && c.id === entity.id) return false;
      if (linkedKeys.has(`${c.kind}:${c.id}`)) return false;
      if (pickKind && c.kind !== pickKind) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q) ||
        c.kind.toLowerCase().includes(q)
      );
    }).slice(0, 40);
  }, [candidates, entity, linkedKeys, pickKind, query]);

  const show = merged.length > 0 || editable;
  if (!show) return null;

  const run = async (fn: () => void | Promise<void>) => {
    setPending(true);
    try {
      await fn();
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="admin-cross-links"
      data-testid={testId}
      data-editable={editable ? "true" : undefined}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {merged.map((link) => (
        <span
          key={`${link.target.kind}:${link.target.id}`}
          className="admin-cross-link-chip"
          data-source={link.source}
        >
          <CrossLinkButton link={link} />
          {editable && onUnlink && (
            <button
              type="button"
              className="admin-cross-link-unlink"
              title={`Unlink ${link.label}`}
              aria-label={`Unlink ${link.label}`}
              data-testid={testId ? `${testId}-unlink-${link.target.kind}-${link.target.id}` : undefined}
              disabled={busy || pending}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void run(() => onUnlink(link.target));
              }}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {editable && onLink && (
        <>
          <button
            type="button"
            className="admin-cross-link-add"
            data-testid={testId ? `${testId}-add` : "admin-crosslinks-add"}
            disabled={busy || pending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPickerOpen((o) => !o);
            }}
          >
            {pickerOpen ? "Cancel" : "+ Link"}
          </button>
          {pickerOpen && (
            <div
              className="admin-cross-link-picker"
              data-testid={testId ? `${testId}-picker` : "admin-crosslinks-picker"}
            >
              <div className="admin-cross-link-picker__row">
                <select
                  value={pickKind}
                  onChange={(e) => setPickKind(e.target.value as AdminEntityKind | "")}
                  aria-label="Link type"
                  data-testid={testId ? `${testId}-kind` : undefined}
                >
                  <option value="">All types</option>
                  <option value="task">Task</option>
                  <option value="test">Test</option>
                  <option value="cf">Content Factory</option>
                </select>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search id or title…"
                  aria-label="Search link targets"
                  data-testid={testId ? `${testId}-search` : undefined}
                />
              </div>
              <ul className="admin-cross-link-picker__list">
                {filteredCandidates.length === 0 ? (
                  <li className="admin-cross-link-picker__empty">No matches</li>
                ) : (
                  filteredCandidates.map((c) => (
                    <li key={`${c.kind}:${c.id}`}>
                      <button
                        type="button"
                        disabled={busy || pending}
                        data-testid={
                          testId ? `${testId}-pick-${c.kind}-${c.id}` : undefined
                        }
                        onClick={() => {
                          void run(async () => {
                            await onLink({ kind: c.kind, id: c.id });
                            setPickerOpen(false);
                            setQuery("");
                          });
                        }}
                      >
                        <span className="admin-cross-link-picker__kind">{c.kind}</span>
                        {c.label}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function crossLinksForSoftLaunchItem(item: SoftLaunchItem): AdminCrossLink[] {
  const links = softLaunchCrossLinks(item);
  const out: AdminCrossLink[] = [
    {
      label: `Task ${links.taskId}`,
      opts: { tab: "tasks", taskId: links.taskId },
    },
  ];
  for (const testId of links.testIds) {
    out.push({
      label: `Test ${testId}`,
      opts: { tab: "testing", testId },
    });
  }
  return out;
}

export function crossLinksForTaskId(taskId: string): AdminCrossLink[] {
  const item = softLaunchItemFromTaskId(taskId);
  if (!item) return [];
  const links = softLaunchCrossLinks(item);
  const out: AdminCrossLink[] = [
    {
      label: `${links.itemRef} · ${item.title}`,
      opts: { tab: "factory", panel: "launch-plan", itemId: item.id },
    },
  ];
  for (const testId of links.testIds) {
    out.push({
      label: `Test ${testId}`,
      opts: { tab: "testing", testId },
    });
  }
  return out;
}

export function crossLinksForTestId(
  testId: string,
  relatedTaskIds?: string[] | null,
): AdminCrossLink[] {
  const out: AdminCrossLink[] = [];
  const item = softLaunchItemFromTestId(testId);
  if (item) {
    const links = softLaunchCrossLinks(item);
    out.push({
      label: `${links.itemRef} · ${item.title}`,
      opts: { tab: "factory", panel: "launch-plan", itemId: item.id },
    });
    out.push({
      label: `Task ${links.taskId}`,
      opts: { tab: "tasks", taskId: links.taskId },
    });
  }
  for (const taskId of relatedTaskIds ?? []) {
    const id = String(taskId || "").trim();
    if (!id) continue;
    if (out.some((l) => l.opts.taskId === id)) continue;
    out.push({
      label: `Task ${id}`,
      opts: { tab: "tasks", taskId: id },
    });
    const fromTask = softLaunchItemFromTaskId(id);
    if (fromTask && !out.some((l) => l.opts.itemId === fromTask.id)) {
      out.push({
        label: `${softLaunchItemRef(fromTask.id)} · ${fromTask.title}`,
        opts: { tab: "factory", panel: "launch-plan", itemId: fromTask.id },
      });
    }
  }
  return out;
}
