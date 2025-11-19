'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProjectForm } from '@/components/admin/ProjectForm';

interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string | null;
  url: string;
  techStack: string[];
  category: string;
  status: string;
  featured: boolean;
  mrr: number;
  users: number;
  problemStatement?: string | null;
  solutionApproach?: string | null;
  lessonsLearned?: string | null;
  screenshots: string[];
  launchedAt?: string | null;
  githubUrl?: string | null;
  trackProgress: boolean;
}

export default function EditProjectPage() {
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/projects/${id}`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setProject(data.data);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to fetch project');
        }
      } catch (err) {
        setError('Failed to fetch project');
        console.error('Fetch project error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <header className="px-6 py-4 border-b border-border-subtle">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-display-sm font-bold text-brand-primary">Edit Project</h1>
          </div>
        </header>
        <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
          <p className="text-body text-text-secondary">Loading project...</p>
        </section>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-bg-primary">
        <header className="px-6 py-4 border-b border-border-subtle">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-display-sm font-bold text-brand-primary">Edit Project</h1>
            <Link href="/admin/projects">
              <Button variant="ghost" size="sm">
                Back to Projects
              </Button>
            </Link>
          </div>
        </header>
        <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
          <p className="text-body text-error">{error || 'Project not found'}</p>
          <Link href="/admin/projects">
            <Button variant="primary" className="mt-4">
              Back to Projects
            </Button>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-display-sm font-bold text-brand-primary">
            Edit Project: {project.name}
          </h1>
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm">
              Back to Projects
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12">
        <ProjectForm mode="edit" project={project} />
      </section>
    </main>
  );
}
