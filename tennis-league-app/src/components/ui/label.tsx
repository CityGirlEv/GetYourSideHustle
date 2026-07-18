import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`label-glass ${className}`}
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.8)',
          ...props.style,
        }}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = 'Label';
