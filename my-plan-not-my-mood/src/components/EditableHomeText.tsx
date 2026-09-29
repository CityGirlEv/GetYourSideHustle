import React from 'react';

type EditableTag = 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'blockquote' | 'div';

interface EditableHomeTextProps {
  value: string;
  onChange: (next: string) => void;
  editing: boolean;
  as?: EditableTag;
  className?: string;
  testId?: string;
  multiline?: boolean;
  'aria-label'?: string;
}

export const EditableHomeText: React.FC<EditableHomeTextProps> = ({
  value,
  onChange,
  editing,
  as: Tag = 'p',
  className = '',
  testId,
  multiline = false,
  'aria-label': ariaLabel,
}) => {
  if (!editing) {
    return (
      <Tag className={className} data-testid={testId}>
        {value}
      </Tag>
    );
  }

  const fieldClass = `${className} w-full bg-white/80 border-2 border-dashed border-[#C2410C] rounded-xl px-2 py-1 outline-none focus:border-[#1F1917]`;

  if (multiline) {
    return (
      <textarea
        value={value}
        aria-label={ariaLabel}
        data-testid={testId}
        rows={Math.max(3, value.split('\n').length + 1)}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClass} resize-y min-h-[5.5rem]`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      aria-label={ariaLabel}
      data-testid={testId}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClass}
    />
  );
};
