import { useEffect, useState } from "react";
import type { GuideCheckItem } from "../../lib/user-guide-content";

function storageKey(guideId: string) {
  return `gysh-user-guide-checks:${guideId}`;
}

function loadChecked(guideId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(storageKey(guideId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function GuideChecklist({
  guideId,
  items,
}: {
  guideId: string;
  items: GuideCheckItem[];
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => loadChecked(guideId));

  useEffect(() => {
    setChecked(loadChecked(guideId));
  }, [guideId]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(storageKey(guideId), JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
      return next;
    });
  };

  return (
    <ul className="user-guide-checklist">
      {items.map((item) => {
        const isOn = Boolean(checked[item.id]);
        const inputId = `${guideId}-${item.id}`;
        return (
          <li key={item.id} className={`user-guide-checklist__item${isOn ? " is-checked" : ""}`}>
            <label htmlFor={inputId}>
              <input
                id={inputId}
                type="checkbox"
                checked={isOn}
                onChange={() => toggle(item.id)}
              />
              <span className="user-guide-checklist__box" aria-hidden />
              <span className="user-guide-checklist__text">{item.text}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function GuideToc({
  entries,
}: {
  entries: { id: string; label: string; number?: string; level?: 1 | 2 }[];
}) {
  return (
    <nav className="user-guide-toc" aria-label="Table of contents">
      <h3 className="user-guide-toc__title">Contents</h3>
      <ul className="user-guide-toc__list">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={entry.level === 2 ? "user-guide-toc__item--sub" : undefined}
          >
            <a href={`#guide-${entry.id}`}>
              {entry.number ? (
                <span className="user-guide-toc__num">{entry.number}</span>
              ) : null}
              <span className="user-guide-toc__label">{entry.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
