import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PostForm } from '@/components/admin/PostForm';
import { prisma } from '@/lib/prisma';
import { postToFormData } from '@/lib/validations/post';

export const metadata = {
  title: 'Edit Post - Admin',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch post by ID (server-side)
 */
async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return post;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

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

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const [post, projects] = await Promise.all([
    getPost(id),
    getProjects(),
  ]);

  if (!post) {
    notFound();
  }

  // Convert post data to form data
  const initialData = postToFormData({
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    tags: post.tags,
    postType: post.postType,
    projectId: post.projectId,
    published: post.published,
  });

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-display-sm font-bold text-brand-primary">Edit Post</h1>
            <p className="text-body-sm text-text-tertiary mt-1">
              Last updated: {new Date(post.updatedAt).toLocaleString()}
            </p>
          </div>
          <Link href="/admin/content/posts">
            <Button variant="ghost" size="sm">
              Back to Posts
            </Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-5xl mx-auto">
        <PostForm
          mode="edit"
          postId={post.id}
          initialData={initialData}
          projects={projects}
        />
      </section>
    </main>
  );
}
