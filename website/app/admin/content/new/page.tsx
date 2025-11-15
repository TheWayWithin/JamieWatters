import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PostForm } from '@/components/admin/PostForm';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Create New Post - Admin',
};

/**
 * Fetch projects for linking (server-side)
 */
async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return projects;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export default async function NewPostPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-display-sm font-bold text-brand-primary">Create New Post</h1>
          <Link href="/admin/content">
            <Button variant="ghost" size="sm">
              Back to Content
            </Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-5xl mx-auto">
        <PostForm mode="create" projects={projects} />
      </section>
    </main>
  );
}
