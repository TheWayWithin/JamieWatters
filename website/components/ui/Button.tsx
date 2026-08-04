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
      'bg-brand-primary text-bg-primary hover:bg-brand-primary-hover active:transform active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed',
    secondary:
      'border border-border-default text-text-primary bg-transparent hover:border-brand-primary hover:text-brand-primary disabled:opacity-40 disabled:cursor-not-allowed',
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
  // The only prop injected is className, so that is all the child has to
  // accept. Be clear about what this does and does not prove: isValidElement's
  // type argument is supplied by the caller and never checked at runtime (React
  // only tests $$typeof), so this is still an assertion, just a narrow and
  // stated one rather than the ReactElement<any> cast it replaces. It holds
  // today because every asChild call site passes a Link or an <a>, both of
  // which accept className.
  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    return React.cloneElement(children, {
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
