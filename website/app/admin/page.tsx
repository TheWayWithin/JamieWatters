'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to content tab (default tab)
    router.replace('/admin/content');
  }, [router]);

  // Show loading while redirecting
  return (
    <section className="px-6 pt-8 pb-12 max-w-4xl mx-auto">
      <p className="text-body text-text-secondary">Loading...</p>
    </section>
  );
}
