import React from 'react';

interface CardProps {
  variant?: 'default' | 'flat' | 'featured';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({
  variant = 'default',
  children,
  className = '',
  onClick,
  hover = false,
}: CardProps) {
  // Base styles
  const baseStyles = 'rounded-lg p-6';

  // Variant styles
  const variantStyles = {
    default:
      'bg-bg-surface border border-border-default shadow-md',
    flat: 'bg-bg-surface border border-border-subtle',
    featured:
      'bg-bg-surface border-2 border-brand-primary shadow-lg p-8',
  };

  // Hover styles (if interactive)
  const hoverStyles = hover || onClick
    ? 'cursor-pointer transition-slow hover:scale-102 hover:shadow-hover hover:border-border-emphasis'
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
