'use client';

import Link from 'next/link';
import { ProjectPhase } from '@prisma/client';

// Timeline event structure stored in project.timelineEvents JSON field
export interface TimelineEvent {
  date: string; // ISO date string
  event: string; // Event title
  description?: string; // Optional description
  linkedPostId?: string; // Optional link to related post
  linkedPostSlug?: string; // For creating links
  phase?: ProjectPhase; // Which phase this event belongs to
}

interface ProjectTimelineProps {
  events: TimelineEvent[];
  currentPhase?: ProjectPhase | null;
  projectSlug: string;
}

const phaseLabels: Record<ProjectPhase, string> = {
  IDEATION: 'Ideation',
  MVP: 'MVP',
  LAUNCH: 'Launch',
  GROWTH: 'Growth',
  MAINTENANCE: 'Maintenance',
  ARCHIVED: 'Archived',
  PAUSED: 'Paused',
};

const phaseColors: Record<ProjectPhase, string> = {
  IDEATION: 'bg-purple-500',
  MVP: 'bg-blue-500',
  LAUNCH: 'bg-green-500',
  GROWTH: 'bg-emerald-500',
  MAINTENANCE: 'bg-amber-500',
  ARCHIVED: 'bg-gray-500',
  PAUSED: 'bg-yellow-500',
};

const phaseBgColors: Record<ProjectPhase, string> = {
  IDEATION: 'bg-purple-500/10 border-purple-500/30',
  MVP: 'bg-blue-500/10 border-blue-500/30',
  LAUNCH: 'bg-green-500/10 border-green-500/30',
  GROWTH: 'bg-emerald-500/10 border-emerald-500/30',
  MAINTENANCE: 'bg-amber-500/10 border-amber-500/30',
  ARCHIVED: 'bg-gray-500/10 border-gray-500/30',
  PAUSED: 'bg-yellow-500/10 border-yellow-500/30',
};

export function ProjectTimeline({ events, currentPhase, projectSlug }: ProjectTimelineProps) {
  if (!events || events.length === 0) {
    return null;
  }

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="relative">
      {/* Current Phase Badge */}
      {currentPhase && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-text-tertiary">Current Phase:</span>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${phaseBgColors[currentPhase]} border`}
          >
            {phaseLabels[currentPhase]}
          </span>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {sortedEvents.map((event, index) => {
          const eventDate = new Date(event.date);
          const isFirst = index === 0;
          const isLast = index === sortedEvents.length - 1;

          return (
            <div key={`${event.date}-${index}`} className="relative flex gap-4">
              {/* Timeline Line & Dot */}
              <div className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    event.phase ? phaseColors[event.phase] : 'bg-brand-accent'
                  } ring-4 ring-bg-primary z-10`}
                />
                {/* Line (except for last item) */}
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-border-default min-h-[60px]" />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
                {/* Date */}
                <time className="text-xs text-text-tertiary font-mono">
                  {eventDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>

                {/* Event Title */}
                <h4 className="text-base font-semibold text-text-primary mt-1">
                  {event.event}
                </h4>

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {event.description}
                  </p>
                )}

                {/* Phase Badge */}
                {event.phase && (
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${phaseBgColors[event.phase]} border`}
                  >
                    {phaseLabels[event.phase]}
                  </span>
                )}

                {/* Link to Related Post */}
                {event.linkedPostSlug && (
                  <Link
                    href={`/journey/${event.linkedPostSlug}`}
                    className="inline-block mt-2 ml-2 text-xs text-brand-secondary hover:text-brand-primary transition-colors"
                  >
                    Read more →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
