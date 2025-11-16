import Link from 'next/link';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ExternalLink, Github } from 'lucide-react';
import type { ProjectWithMetrics } from '@/lib/database';

interface ProjectCardProps {
  project: ProjectWithMetrics;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    RESEARCH: 'bg-purple-500/15 text-purple-400',
    DESIGN: 'bg-indigo-500/15 text-indigo-400',
    PLANNING: 'bg-yellow-500/15 text-yellow-400',
    BUILD: 'bg-orange-500/15 text-orange-400',
    BETA: 'bg-blue-500/15 text-blue-400',
    MVP: 'bg-cyan-500/15 text-cyan-400',
    LIVE: 'bg-green-500/15 text-green-400',
    ARCHIVED: 'bg-gray-500/15 text-gray-400',
  };

  return (
    <Card hover className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-text-primary mb-1">
            {project.name}
          </h3>
          <p className="text-sm text-brand-accent font-medium">
            {project.description.split('.')[0] + '.'} {/* Use first sentence as tagline */}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            statusColors[project.status]
          }`}
        >
          {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
        </span>
      </div>

      <p className="text-text-secondary text-sm mb-4 flex-1">
        {project.description}
      </p>

      {/* Metrics */}
      <div className="flex gap-4 mb-4 pb-4 border-b border-white/10">
        <div>
          <div className="text-xs text-text-tertiary">MRR</div>
          <div className="text-lg font-semibold text-brand-accent">
            ${Number(project.mrr).toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-tertiary">Users</div>
          <div className="text-lg font-semibold text-brand-accent">
            {project.users.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.techStack.slice(0, 4).map((tech) => (
          <Badge key={tech} variant="frontend" size="sm">
            {tech}
          </Badge>
        ))}
        {project.techStack.length > 4 && (
          <Badge variant="frontend" size="sm">
            +{project.techStack.length - 4}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/portfolio/${project.slug}`}
          className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-md transition-base text-center"
        >
          View Details
        </Link>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-brand-primary text-brand-primary hover:bg-brand-primary hover:bg-opacity-10 px-3 py-2 rounded-md transition-base flex items-center justify-center"
            aria-label="Visit project"
          >
            {project.url.includes('github.com') ? (
              <Github className="w-4 h-4" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
          </a>
        )}
      </div>
    </Card>
  );
}
