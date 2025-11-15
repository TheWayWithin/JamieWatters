'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProjectForm } from '@/components/admin/ProjectForm';

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-display-sm font-bold text-brand-primary">Create New Project</h1>
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm">
              Back to Projects
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12">
        <ProjectForm mode="create" />
      </section>
    </main>
  );
}
