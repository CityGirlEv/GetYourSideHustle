import React, { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { namedMerchStyleFamily } from '../lib/merchStyleFamily';
import { CF_POP_BTN } from '../lib/contentFactory';

export const StyleNameDialog: React.FC<{
  open: boolean;
  suggested: string;
  title?: string;
  saveLabel?: string;
  fieldLabel?: string;
  hint?: string;
  plainName?: boolean;
  onCancel: () => void;
  onSave: (label: string) => void;
}> = ({
  open,
  suggested,
  title = 'Name this style',
  saveLabel = 'Save style',
  fieldLabel = 'Style name',
  hint = 'Cards with this name stay together — Tee, Hoodie, and Hat on one style.',
  plainName = false,
  onCancel,
  onSave,
}) => {
  const inputId = useId();
  const [value, setValue] = useState(suggested);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setValue(suggested);
    setError('');
  }, [open, suggested]);

  if (!open) return null;

  const submit = () => {
    if (plainName) {
      const next = value.trim();
      if (!next) {
        setError('Name this card.');
        return;
      }
      if (next.length > 80) {
        setError('Card names must be 80 characters or fewer.');
        return;
      }
      onSave(next);
      return;
    }
    const named = namedMerchStyleFamily(value);
    if ('error' in named) {
      setError(named.error);
      return;
    }
    onSave(named.family.familyLabel);
  };

  return (
    <div
      className="fixed inset-0 z-[10060] bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${inputId}-title`}
      data-testid="style-name-dialog"
      onClick={onCancel}
    >
      <form
        className="w-full max-w-md rounded-2xl border-2 border-[#FDBA74] bg-[#FFFCF7] p-5 shadow-[0_16px_40px_rgba(31,25,23,0.22)] space-y-3"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={`${inputId}-title`} className="text-lg font-serif font-semibold text-[#9A3412]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border-2 border-[#1F1917] bg-white cursor-pointer"
            aria-label="Cancel style name"
            data-testid="style-name-cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <label htmlFor={inputId} className="block text-[10px] font-black uppercase tracking-wider text-[#C2410C]">
          {fieldLabel}
        </label>
        <input
          id={inputId}
          type="text"
          value={value}
          autoFocus
          maxLength={80}
          onChange={(event) => {
            setValue(event.target.value);
            setError('');
          }}
          placeholder="Lebbering Beige"
          className="w-full min-h-[44px] rounded-xl border-2 border-[#FDBA74] bg-white px-3 text-sm font-semibold text-[#1F1917] focus:border-[#EA580C] focus:outline-none"
          data-testid="style-name-input"
        />
        {error ? (
          <p className="text-sm font-semibold text-[#9A3412]" role="alert" data-testid="style-name-error">
            {error}
          </p>
        ) : (
          <p className="text-sm text-[#3F3832]">{hint}</p>
        )}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-3.5 rounded-xl border-2 border-[#1F1917] bg-white text-[11px] font-black uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button type="submit" className={CF_POP_BTN} data-testid="style-name-save">
            {saveLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
