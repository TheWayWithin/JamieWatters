'use client';

interface LoadingStateProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Layout: 'grid' or 'list' */
  layout?: 'grid' | 'list';
  /** Height of each skeleton card */
  cardHeight?: string;
  /** Grid columns at different breakpoints */
  columns?: { sm?: number; md?: number; lg?: number };
}

export default function LoadingState({
  count = 4,
  layout = 'grid',
  cardHeight = 'h-24',
  columns = { sm: 1, md: 2, lg: 3 },
}: LoadingStateProps) {
  const gridCols = layout === 'list'
    ? 'grid-cols-1'
    : `grid-cols-1 ${columns.md ? `md:grid-cols-${columns.md}` : ''} ${columns.lg ? `lg:grid-cols-${columns.lg}` : ''}`;

  return (
    <div className={`grid gap-4 ${gridCols}`} role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${cardHeight} animate-pulse rounded-lg border border-border-default bg-bg-surface`}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
