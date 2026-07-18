import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`input-glass ${className}`}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'white',
          fontSize: '1rem',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
          boxSizing: 'border-box',
          ...props.style,
        }}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
