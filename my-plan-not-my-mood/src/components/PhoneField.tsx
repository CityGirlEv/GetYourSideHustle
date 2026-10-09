import React from 'react';

const DEFAULT_INPUT_CLASS =
  'w-full min-h-[44px] rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] px-3 text-sm font-medium text-[#1F1917]';

export const PhoneField: React.FC<{
  id: string;
  name?: string;
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  testId?: string;
  hint?: string;
  label?: string;
  labelClassName?: string;
  inputClassName?: string;
}> = ({
  id,
  name,
  value,
  onChange,
  required = false,
  testId,
  hint,
  label = 'Phone',
  labelClassName = 'text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]',
  inputClassName = DEFAULT_INPUT_CLASS,
}) => {
  const hintId = `${id}-hint`;
  const hintText =
    hint ??
    (required
      ? 'Required so we can call you if we need to. US number.'
      : 'Optional. US number only if you want a text or call.');

  return (
    <label className="block space-y-1.5">
      <span className={labelClassName}>{required ? label : `${label} (optional)`}</span>
      <input
        id={id}
        type="tel"
        name={name ?? id}
        autoComplete="tel"
        inputMode="tel"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="(619) 555-0100"
        className={inputClassName}
        data-testid={testId ?? id}
        aria-describedby={hintId}
      />
      <span id={hintId} className="block text-xs text-[#6B5344]">
        {hintText}
      </span>
    </label>
  );
};
