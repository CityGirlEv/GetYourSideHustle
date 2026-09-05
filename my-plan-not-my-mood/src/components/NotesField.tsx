import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import {
  NOTES_POPUP_MIN_CLASS,
  NOTES_PREVIEW_MIN_CLASS,
  NOTES_VISIBLE_ROWS,
  notesNeedFullPopup,
  notesOverflow,
} from '../lib/notesField';

export const NotesField: React.FC<{
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  testId?: string;
  itemTitle?: string;
}> = ({
  label = 'Notes',
  value,
  onChange,
  readOnly = false,
  placeholder = 'Add notes',
  testId = 'notes-field',
  itemTitle,
}) => {
  const previewRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(() => notesNeedFullPopup(value));

  useEffect(() => {
    const el = previewRef.current;
    if (!el) {
      setOverflowing(notesNeedFullPopup(value));
      return;
    }
    const measure = () => setOverflowing(notesOverflow(el.scrollHeight, el.clientHeight) || notesNeedFullPopup(value));
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => observer?.disconnect();
  }, [value]);

  const canEdit = Boolean(onChange) && !readOnly;
  const openPopup = () => setOpen(true);

  return (
    <div className="space-y-1.5" data-testid={testId}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#6B5344]">{label}</span>
        <button
          type="button"
          data-testid={`${testId}-open`}
          aria-label={`Open ${label} larger`}
          onClick={openPopup}
          className="min-h-[44px] px-3 rounded-xl border-2 border-[#1F1917] text-[10px] font-black uppercase cursor-pointer inline-flex items-center gap-1.5"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Open larger
        </button>
      </div>
      <textarea
        ref={previewRef}
        value={value}
        readOnly={!canEdit || overflowing}
        rows={NOTES_VISIBLE_ROWS}
        placeholder={placeholder}
        aria-label={label}
        data-testid={`${testId}-preview`}
        onChange={(event) => onChange?.(event.target.value)}
        onClick={() => {
          if (overflowing) openPopup();
        }}
        className={`w-full ${NOTES_PREVIEW_MIN_CLASS} px-3 py-3 rounded-xl border-2 border-[#E5DFD3] text-sm leading-relaxed ${
          overflowing ? 'cursor-pointer overflow-hidden' : ''
        } ${canEdit && !overflowing ? 'bg-[#FAF8F5]' : 'bg-[#FFFCF7]'}`}
      />
      {overflowing ? (
        <button
          type="button"
          onClick={openPopup}
          className="text-[11px] font-semibold text-[#C2410C] underline cursor-pointer min-h-[44px]"
        >
          Notes overflow — open full notes
        </button>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#1F1917]/80 backdrop-blur-sm"
          data-testid={`${testId}-popup`}
          role="dialog"
          aria-modal="true"
          aria-label={`${label}${itemTitle ? ` for ${itemTitle}` : ''}`}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-white border-2 border-[#1F1917] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#9A7B3C]">{label}</p>
                {itemTitle ? (
                  <h3 className="text-lg font-black text-[#1F1917] uppercase leading-snug">{itemTitle}</h3>
                ) : null}
              </div>
              <button
                type="button"
                aria-label={`Close ${label}`}
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl border-2 border-[#1F1917] cursor-pointer inline-flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              autoFocus
              value={value}
              readOnly={!canEdit}
              onChange={(event) => onChange?.(event.target.value)}
              placeholder={placeholder}
              data-testid={`${testId}-popup-input`}
              className={`w-full ${NOTES_POPUP_MIN_CLASS} px-4 py-4 rounded-2xl border-2 border-[#E5DFD3] text-base leading-relaxed ${
                canEdit ? 'bg-[#FAF8F5]' : 'bg-[#EFE8DC] cursor-not-allowed'
              }`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
