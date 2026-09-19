import React from 'react';

type HomeEditableFieldProps = {
  editing: boolean;
  value: string;
  onChange: (next: string) => void;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  testId?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div';
  'aria-label'?: string;
};

export function HomeEditableField({
  editing,
  value,
  onChange,
  className = '',
  inputClassName = '',
  multiline = false,
  testId,
  as: Tag = 'p',
  'aria-label': ariaLabel,
}: HomeEditableFieldProps) {
  if (!editing) {
    return (
      <Tag className={className} data-testid={testId}>
        {value}
      </Tag>
    );
  }

  const shared = {
    value,
    'aria-label': ariaLabel,
    'data-testid': testId ? `${testId}-input` : undefined,
    className: `w-full min-h-[44px] bg-white/90 border-2 border-[#C2410C] rounded-xl px-3 py-2 text-inherit ${inputClassName}`,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };

  if (multiline) {
    return <textarea {...shared} rows={4} />;
  }
  return <input type="text" {...shared} />;
}
