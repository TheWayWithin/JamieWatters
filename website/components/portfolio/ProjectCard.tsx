import Link from 'next/link';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ExternalLink, Github } from 'lucide-react';
import type { PlaceholderProject } from '@/lib/placeholder-data';

interface ProjectCardProps {
  project: PlaceholderProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-green-500/15 text-green-400',
    beta: 'bg-blue-500/15 text-blue-400',
    planning: 'bg-yellow-500/15 text-yellow-400',
    archived: 'bg-gray-500/15 text-gray-400',
  };

  return (
    <Card hover className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-text-primary mb-1">
            {project.name}
          </h3>
          <p className="text-sm text-brand-accent font-medium">
            {project.tagline}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            statusColors[project.status]
          }`}
        >
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
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
            ${project.metrics.mrr.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-tertiary">Users</div>
          <div className="text-lg font-semibold text-brand-accent">
            {project.metrics.users.toLocaleString()}
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
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-brand-primary text-brand-primary hover:bg-brand-primary hover:bg-opacity-10 px-3 py-2 rounded-md transition-base flex items-center justify-center"
            aria-label="Visit live site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-brand-primary text-brand-primary hover:bg-brand-primary hover:bg-opacity-10 px-3 py-2 rounded-md transition-base flex items-center justify-center"
            aria-label="View on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        )}
      </div>
    </Card>
  );
}
