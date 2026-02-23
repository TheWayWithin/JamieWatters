'use client';

interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Optional context label (e.g., "projects", "goals") */
  context?: string;
}

export default function ErrorState({ message, onRetry, context }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      role="alert"
      aria-live="assertive"
    >
      <p className="text-body text-error">
        Failed to load{context ? ` ${context}` : ''}: {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-brand-primary px-4 py-2 text-body-sm font-medium text-white hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}
