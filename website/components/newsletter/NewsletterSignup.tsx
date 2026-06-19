'use client';

import { useState, FormEvent } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

type Variant = 'footer' | 'inline';

interface NewsletterSignupProps {
  variant?: Variant;
  /** Optional override for the heading/intro copy. */
  heading?: string;
  subtext?: string;
}

const DEFAULTS: Record<Variant, { heading: string; subtext: string }> = {
  footer: {
    heading: 'Get the field reports',
    subtext: 'New posts and what actually held up, straight to your inbox. No hype.',
  },
  inline: {
    heading: 'Get the next one in your inbox',
    subtext:
      "I build with AI in the open and write up what held and what didn't. Real numbers, the failures before the wins.",
  },
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function NewsletterSignup({ variant = 'footer', heading, subtext }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const copy = {
    heading: heading ?? DEFAULTS[variant].heading,
    subtext: subtext ?? DEFAULTS[variant].subtext,
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus('success');
        setEmail('');
        return;
      }
      setError(data.error || 'Something went wrong. Please try again.');
      setStatus('error');
    } catch {
      setError('Network error. Please try again.');
      setStatus('error');
    }
  }

  const isInline = variant === 'inline';

  const wrapperClass = isInline
    ? 'bg-bg-surface border border-border-default rounded-lg p-6 sm:p-8'
    : '';

  return (
    <div className={wrapperClass}>
      <h3
        className={
          isInline
            ? 'text-display-sm font-bold text-text-primary mb-2'
            : 'font-semibold text-body text-text-primary mb-4'
        }
      >
        {copy.heading}
      </h3>

      {status === 'success' ? (
        <p className="text-body-sm text-text-secondary">
          Almost there: check your inbox and click the confirmation link.
        </p>
      ) : (
        <>
          <p className="text-body-sm text-text-secondary mb-4">{copy.subtext}</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="w-full sm:flex-1">
              <Input
                type="email"
                required
                aria-label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                error={status === 'error' ? error : undefined}
                disabled={status === 'submitting'}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={status === 'submitting'}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
