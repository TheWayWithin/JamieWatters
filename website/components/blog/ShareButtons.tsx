'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jamiewatters.work'}/journey/${slug}`;

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Button
        variant="secondary"
        size="md"
        onClick={shareToTwitter}
        className="w-full sm:w-auto inline-flex items-center gap-2"
      >
        <Twitter className="w-4 h-4" />
        Share on Twitter
      </Button>

      <Button
        variant="secondary"
        size="md"
        onClick={shareToLinkedIn}
        className="w-full sm:w-auto inline-flex items-center gap-2"
      >
        <Linkedin className="w-4 h-4" />
        Share on LinkedIn
      </Button>

      <Button
        variant="secondary"
        size="md"
        onClick={copyLink}
        className="w-full sm:w-auto inline-flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <LinkIcon className="w-4 h-4" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  );
}
