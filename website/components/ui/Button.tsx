import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  asChild = false,
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles =
    'font-semibold rounded-md transition-base inline-flex items-center justify-center';

  // Variant styles
  const variantStyles = {
    primary:
      'bg-brand-primary text-white hover:bg-brand-primary-hover active:transform active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed',
    secondary:
      'border border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary hover:bg-opacity-10 disabled:opacity-40 disabled:cursor-not-allowed',
    ghost:
      'text-brand-secondary bg-transparent hover:underline disabled:opacity-40 disabled:cursor-not-allowed',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-4 py-2 text-body-sm',
    md: 'px-6 py-3 text-body',
    lg: 'px-8 py-4 text-body-lg',
  };

  // If asChild is true, apply className to the child element
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`,
    });
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
