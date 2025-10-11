import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;

  // Base styles
  const baseStyles =
    'w-full bg-bg-primary border rounded-md px-4 py-3 text-body text-text-primary transition-base';

  // State styles
  const stateStyles = error
    ? 'border-error focus:border-error focus:shadow-error'
    : 'border-border-default focus:border-brand-primary focus:shadow-brand';

  // Disabled styles
  const disabledStyles = props.disabled
    ? 'bg-bg-surface opacity-60 cursor-not-allowed'
    : '';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-body-sm font-medium text-text-primary mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-body-sm text-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-body-sm text-text-tertiary">{helperText}</p>
      )}
    </div>
  );
}
