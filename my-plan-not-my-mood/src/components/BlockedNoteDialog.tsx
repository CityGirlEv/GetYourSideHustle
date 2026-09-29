import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function BlockedNoteDialog({
  open,
  itemCount = 1,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  itemCount?: number;
  onCancel: () => void;
  onConfirm: (note: string) => string | void;
}) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const many = itemCount > 1;
  const canSubmit = note.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    setNote('');
    setError('');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const submit = () => {
    const message = onConfirm(note);
    if (message) {
      setError(message);
      return;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center p-4 bg-[#1F1917]/50"
      role="presentation"
      data-testid="blocked-note-dialog"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="blocked-note-title"
        className="w-full max-w-md rounded-2xl border-2 border-[#1F1917] bg-[#FAF8F5] p-5 shadow-2xl space-y-4"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="blocked-note-title" className="text-lg font-black uppercase tracking-tight text-[#1F1917]">
          Why is this blocked?
        </h2>
        <p className="text-sm font-medium text-[#3F3832]">
          {many
            ? `Add a note before marking ${itemCount} tasks Blocked. The same note is added to each selected task.`
            : 'Add a note before marking this task Blocked.'}
        </p>
        <label className="block space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wide text-[#6B3A2C]">Blocked note</span>
          <textarea
            ref={inputRef}
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              if (error) setError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && canSubmit) {
                event.preventDefault();
                submit();
              }
            }}
            rows={4}
            aria-label="Blocked note"
            data-testid="blocked-note-input"
            placeholder="What’s blocking this work?"
            className="w-full min-h-[96px] rounded-xl border-2 border-[#1F1917] bg-white px-3 py-2 text-sm font-medium text-[#1F1917] focus:outline-none"
          />
        </label>
        {error ? (
          <p className="text-xs font-bold text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] bg-white text-[10px] font-black uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            data-testid="blocked-note-confirm"
            className="min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] bg-[#C2410C] text-white text-[10px] font-black uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {many ? 'Block tasks' : 'Block task'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
