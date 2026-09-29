import React from 'react';
import {
  HEAR_ABOUT_US_LABEL,
  HEAR_ABOUT_US_OPTIONS,
  HEAR_ABOUT_US_PLACEHOLDER,
} from '../lib/hearAboutUs';

const fieldClass =
  'w-full min-h-[44px] rounded-xl border-2 border-[#E5DFD3] bg-[#FAF8F5] px-3 text-sm font-medium text-[#1F1917]';

export const HearAboutUsField: React.FC<{
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  testId: string;
}> = ({ id, name, value, onChange, required = false, testId }) => {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-[11px] font-black uppercase tracking-wider text-[#9A6B3D]">
        {HEAR_ABOUT_US_LABEL}
        {required ? '' : ' (optional)'}
      </span>
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
        data-testid={testId}
      >
        <option value="">{HEAR_ABOUT_US_PLACEHOLDER}</option>
        {HEAR_ABOUT_US_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
