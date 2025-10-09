import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'frontend' | 'backend' | 'database' | 'devops' | 'ai' | 'default' | 'success' | 'warning' | 'info' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  // Base styles
  const baseStyles =
    'inline-flex items-center justify-center rounded font-medium uppercase tracking-wider';

  // Variant styles (color-coded by tech category)
  const variantStyles = {
    frontend: 'bg-blue-500/15 text-blue-400',
    backend: 'bg-purple-500/15 text-purple-400',
    database: 'bg-green-500/15 text-green-400',
    devops: 'bg-amber-500/15 text-amber-400',
    ai: 'bg-violet-500/15 text-violet-400',
    default: 'bg-bg-surface-hover text-text-secondary',
    success: 'bg-green-500/15 text-green-400',
    warning: 'bg-amber-500/15 text-amber-400',
    info: 'bg-blue-500/15 text-blue-400',
    error: 'bg-red-500/15 text-red-400',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1 text-caption',
    lg: 'px-4 py-1.5 text-body-sm',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
