import React from 'react';
import { createPortal } from 'react-dom';
import { ARE_YOU_SURE_LABEL } from '../lib/confirmDelete';

export function AreYouSureDialog({
  open,
  onCancel,
  onConfirm,
  confirmLabel = 'Delete',
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[10060] flex items-center justify-center p-4 bg-[#1F1917]/50"
      role="presentation"
      data-testid="are-you-sure-dialog"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="are-you-sure-title"
        className="w-full max-w-sm rounded-2xl border-2 border-[#1F1917] bg-[#FAF8F5] p-5 shadow-2xl space-y-4"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="are-you-sure-title" className="text-lg font-black uppercase tracking-tight text-[#1F1917]">
          {ARE_YOU_SURE_LABEL}
        </h2>
        <p className="text-sm font-medium text-[#3F3832]">This cannot be undone.</p>
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
            onClick={onConfirm}
            data-testid="are-you-sure-confirm"
            className="min-h-[44px] px-4 rounded-xl border-2 border-[#1F1917] bg-[#C2410C] text-white text-[10px] font-black uppercase cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
