# Code Examples: Milestone Components

## 1. MilestoneProgress Component

```typescript
// components/MilestoneProgress.tsx
import React from 'react';

interface MilestoneProgressProps {
  current: number;
  target: number;
  label: string;
  deadline: Date;
  unit?: string;
}

export default function MilestoneProgress({
  current,
  target,
  label,
  deadline,
  unit = '$'
}: MilestoneProgressProps) {
  const progress = (current / target) * 100;
  const remaining = target - current;
  const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const requiredDaily = remaining / Math.max(daysRemaining, 1);
  
  // Calculate if on track (need to be at least at proportional progress)
  const totalDays = 365; // Adjust based on actual timeline
  const daysPassed = totalDays - daysRemaining;
  const expectedProgress = (daysPassed / totalDays) * 100;
  const onTrack = progress >= expectedProgress * 0.8; // 80% threshold
  
  const statusColor = onTrack ? 'text-green-500' : 'text-yellow-500';
  const statusIcon = onTrack ? '✓' : '⚠️';
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{label}</h3>
      
      <div className="space-y-3">
        {/* Current vs Target */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Current:</span>
          <span className="text-white font-mono">
            {unit}{current.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Target:</span>
          <span className="text-white font-mono">
            {unit}{target.toLocaleString()}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{progress.toFixed(1)}% complete</span>
            <span>{unit}{remaining.toLocaleString()} remaining</span>
          </div>
        </div>
        
        {/* Timeline Info */}
        <div className="pt-3 border-t border-slate-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Deadline:</span>
            <span className="text-white">
              {deadline.toLocaleDateString()} ({daysRemaining} days)
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Required daily:</span>
            <span className="text-white font-mono">
              {unit}{requiredDaily.toFixed(2)}/day
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Status:</span>
            <span className={`font-semibold ${statusColor}`}>
              {statusIcon} {onTrack ? 'On Track' : 'Behind Pace'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 2. RoadmapTimeline Component

```typescript
// components/RoadmapTimeline.tsx
import React from 'react';

interface Milestone {
  id: string;
  phase: string;
  year: string;
  target: string;
  metrics: string[];
  status: 'completed' | 'current' | 'upcoming';
  proofPoint: string;
}

interface RoadmapTimelineProps {
  milestones: Milestone[];
}

export default function RoadmapTimeline({ milestones }: RoadmapTimelineProps) {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-slate-700" />
      
      {/* Milestones */}
      <div className="space-y-8">
        {milestones.map((milestone, index) => {
          const isCompleted = milestone.status === 'completed';
          const isCurrent = milestone.status === 'current';
          const isUpcoming = milestone.status === 'upcoming';
          
          return (
            <div key={milestone.id} className="relative pl-20">
              {/* Timeline Dot */}
              <div className={`absolute left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${isCompleted ? 'bg-green-500 border-green-400' : ''}
                ${isCurrent ? 'bg-blue-500 border-blue-400 animate-pulse' : ''}
                ${isUpcoming ? 'bg-slate-700 border-slate-600' : ''}
              `}>
                {isCompleted && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Current Indicator */}
              {isCurrent && (
                <div className="absolute left-0 top-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                  YOU ARE HERE
                </div>
              )}
              
              {/* Milestone Card */}
              <div className={`bg-slate-800 border rounded-lg p-6 transition-all hover:border-slate-600
                ${isCompleted ? 'border-green-500/30' : ''}
                ${isCurrent ? 'border-blue-500 shadow-lg shadow-blue-500/20' : ''}
                ${isUpcoming ? 'border-slate-700 opacity-60' : ''}
              `}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Phase {index + 1}: {milestone.phase}
                    </h3>
                    <p className="text-slate-400 text-sm">{milestone.year}</p>
                  </div>
                  <div className={`text-2xl font-bold
                    ${isCompleted ? 'text-green-400' : ''}
                    ${isCurrent ? 'text-blue-400' : ''}
                    ${isUpcoming ? 'text-slate-500' : ''}
                  `}>
                    {milestone.target}
                  </div>
                </div>
                
                {/* Metrics */}
                <div className="space-y-2 mb-4">
                  {milestone.metrics.map((metric, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-300">
                      <span className="mr-2">•</span>
                      {metric}
                    </div>
                  ))}
                </div>
                
                {/* Proof Point */}
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold text-purple-400">Proof Point:</span>{' '}
                    {milestone.proofPoint}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## 3. Usage Example in Homepage

```typescript
// app/page.tsx
import MilestoneProgress from '@/components/MilestoneProgress';
import RoadmapTimeline from '@/components/RoadmapTimeline';

export default function HomePage() {
  const foundationDeadline = new Date('2025-12-31');
  
  const milestones = [
    {
      id: 'foundation',
      phase: 'Foundation',
      year: '2025',
      target: '$10K MRR',
      metrics: [
        '3+ profitable products',
        '1,000+ users across portfolio',
        '10,000+ engaged followers',
        '90%+ automation achieved'
      ],
      status: 'current' as const,
      proofPoint: 'AI-powered solopreneur model works'
    },
    {
      id: 'scale',
      phase: 'Scale',
      year: '2026-2027',
      target: '$10M ARR',
      metrics: [
        '10+ products in portfolio',
        '97%+ automation',
        '50,000+ framework users'
      ],
      status: 'upcoming' as const,
      proofPoint: 'One person can manage $10M portfolio'
    },
    {
      id: 'acceleration',
      phase: 'Acceleration',
      year: '2028-2029',
      target: '$100M ARR',
      metrics: [
        '10-20 businesses at $5-50M each',
        '98%+ automation',
        '1M+ community members'
      ],
      status: 'upcoming' as const,
      proofPoint: 'Billion-dollar trajectory validated'
    },
    {
      id: 'achievement',
      phase: 'Achievement',
      year: '2030',
      target: '$1B Valuation',
      metrics: [
        'Portfolio generating $100M+ ARR',
        'Self-evolving systems',
        'New model proven'
      ],
      status: 'upcoming' as const,
      proofPoint: 'New model of entrepreneurship proven'
    }
  ];
  
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Building $1B Solo by 2030—One Milestone at a Time
        </h1>
        <p className="text-xl text-slate-400 mb-6">
          Foundation Phase: $3.9K → $10K MRR by Dec 2025 → $1B by 2030
        </p>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto">
          AI-powered solopreneur proving one person can build billion-dollar businesses
          through systematic milestones. Follow the transparent journey.
        </p>
      </section>
      
      {/* Current Progress with Milestone Context */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8">Current Progress: Foundation Phase</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MilestoneProgress
            current={108.95}
            target={10000}
            label="MRR Progress"
            deadline={foundationDeadline}
            unit="$"
          />
          <MilestoneProgress
            current={8}
            target={1000}
            label="Total Users"
            deadline={foundationDeadline}
            unit=""
          />
          <MilestoneProgress
            current={6}
            target={10}
            label="Active Products"
            deadline={foundationDeadline}
            unit=""
          />
        </div>
      </section>
      
      {/* Roadmap Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-4">The Roadmap to $1B</h2>
        <p className="text-slate-400 mb-12 max-w-3xl">
          I'm not just dreaming about a billion-dollar portfolio—I'm building it systematically
          through validated milestones. Each phase proves the model before scaling to the next level.
        </p>
        <RoadmapTimeline milestones={milestones} />
      </section>
    </div>
  );
}
```

## 4. Weekly Update Template Component

```typescript
// components/WeeklyUpdateMilestone.tsx
import React from 'react';

interface WeeklyUpdateMilestoneProps {
  weekNumber: number;
  metrics: {
    mrr: { current: number; target: number; change: number };
    users: { current: number; target: number; change: number };
    products: { current: number; target: number; change: number };
  };
  deadline: Date;
}

export default function WeeklyUpdateMilestone({
  weekNumber,
  metrics,
  deadline
}: WeeklyUpdateMilestoneProps) {
  const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const mrrProgress = (metrics.mrr.current / metrics.mrr.target) * 100;
  const mrrRemaining = metrics.mrr.target - metrics.mrr.current;
  const requiredWeeklyGrowth = mrrRemaining / Math.max(Math.ceil(daysRemaining / 7), 1);
  const onTrack = metrics.mrr.change >= requiredWeeklyGrowth * 0.8;
  
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-8">
      <h3 className="text-2xl font-bold text-white mb-6">
        Week {weekNumber} Milestone Progress
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-slate-400 text-sm mb-2">Current Phase</p>
          <p className="text-white font-semibold text-lg">Foundation (2025)</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-2">Target Milestone</p>
          <p className="text-white font-semibold text-lg">$10K MRR by Dec 31, 2025</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 text-slate-400 font-medium">Metric</th>
              <th className="text-right py-2 text-slate-400 font-medium">Current</th>
              <th className="text-right py-2 text-slate-400 font-medium">Target</th>
              <th className="text-right py-2 text-slate-400 font-medium">Progress</th>
              <th className="text-right py-2 text-slate-400 font-medium">This Week</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-800">
              <td className="py-3 text-white">MRR</td>
              <td className="text-right text-white font-mono">${metrics.mrr.current.toFixed(2)}</td>
              <td className="text-right text-white font-mono">${metrics.mrr.target.toLocaleString()}</td>
              <td className="text-right text-white">{mrrProgress.toFixed(1)}%</td>
              <td className={`text-right font-mono ${metrics.mrr.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.mrr.change >= 0 ? '+' : ''}${metrics.mrr.change.toFixed(2)}
              </td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="py-3 text-white">Users</td>
              <td className="text-right text-white font-mono">{metrics.users.current}</td>
              <td className="text-right text-white font-mono">{metrics.users.target.toLocaleString()}</td>
              <td className="text-right text-white">
                {((metrics.users.current / metrics.users.target) * 100).toFixed(1)}%
              </td>
              <td className={`text-right font-mono ${metrics.users.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.users.change >= 0 ? '+' : ''}{metrics.users.change}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-white">Products</td>
              <td className="text-right text-white font-mono">{metrics.products.current}</td>
              <td className="text-right text-white font-mono">{metrics.products.target}</td>
              <td className="text-right text-white">
                {((metrics.products.current / metrics.products.target) * 100).toFixed(0)}%
              </td>
              <td className={`text-right font-mono ${metrics.products.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.products.change >= 0 ? '+' : ''}{metrics.products.change}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">On Track?</p>
          <p className={`font-semibold text-lg ${onTrack ? 'text-green-400' : 'text-yellow-400'}`}>
            {onTrack ? '✓ Yes' : '⚠️ Behind Pace'}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Days Remaining</p>
          <p className="text-white font-semibold text-lg">{daysRemaining} days</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Required Weekly Growth</p>
          <p className="text-white font-semibold text-lg font-mono">
            ${requiredWeeklyGrowth.toFixed(0)}/week
          </p>
        </div>
      </div>
    </div>
  );
}
```

## 5. Milestone Data Management

```typescript
// lib/milestones.ts
export interface MilestoneMetrics {
  mrr: number;
  users: number;
  products: number;
  followers: number;
  automation: number;
}

export interface Milestone {
  id: string;
  phase: string;
  year: string;
  target: string;
  targetMetrics: MilestoneMetrics;
  deadline: Date;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  proofPoint: string;
}

export const milestones: Milestone[] = [
  {
    id: 'foundation-2025',
    phase: 'Foundation',
    year: '2025',
    target: '$10K MRR',
    targetMetrics: {
      mrr: 10000,
      users: 1000,
      products: 10,
      followers: 10000,
      automation: 90
    },
    deadline: new Date('2025-12-31'),
    status: 'current',
    description: 'Prove the AI-powered solopreneur model works',
    proofPoint: 'One person can build and manage 10 profitable products'
  },
  // Add other milestones...
];

export function getCurrentMilestone(): Milestone {
  return milestones.find(m => m.status === 'current') || milestones[0];
}

export function calculateProgress(current: number, target: number): number {
  return (current / target) * 100;
}

export function isOnTrack(
  current: number,
  target: number,
  deadline: Date,
  startDate: Date = new Date('2025-10-01')
): boolean {
  const totalDays = (deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysPassed = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const expectedProgress = (daysPassed / totalDays) * 100;
  const actualProgress = (current / target) * 100;
  
  return actualProgress >= expectedProgress * 0.8; // 80% threshold
}
```

## 6. API Route for Milestone Data

```typescript
// app/api/milestones/current/route.ts
import { NextResponse } from 'next/server';
import { getCurrentMilestone, calculateProgress, isOnTrack } from '@/lib/milestones';
import { getMetrics } from '@/lib/metrics'; // Your existing metrics function

export async function GET() {
  const milestone = getCurrentMilestone();
  const currentMetrics = await getMetrics();
  
  const progress = {
    mrr: {
      current: currentMetrics.mrr,
      target: milestone.targetMetrics.mrr,
      progress: calculateProgress(currentMetrics.mrr, milestone.targetMetrics.mrr),
      onTrack: isOnTrack(currentMetrics.mrr, milestone.targetMetrics.mrr, milestone.deadline)
    },
    users: {
      current: currentMetrics.users,
      target: milestone.targetMetrics.users,
      progress: calculateProgress(currentMetrics.users, milestone.targetMetrics.users),
      onTrack: isOnTrack(currentMetrics.users, milestone.targetMetrics.users, milestone.deadline)
    },
    products: {
      current: currentMetrics.products,
      target: milestone.targetMetrics.products,
      progress: calculateProgress(currentMetrics.products, milestone.targetMetrics.products),
      onTrack: isOnTrack(currentMetrics.products, milestone.targetMetrics.products, milestone.deadline)
    }
  };
  
  const daysRemaining = Math.ceil((milestone.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  return NextResponse.json({
    milestone,
    progress,
    daysRemaining,
    overallOnTrack: progress.mrr.onTrack && progress.users.onTrack && progress.products.onTrack
  });
}
```

These components provide a complete foundation for implementing the milestone-enhanced BHAG strategy on your site. They're designed to be:

- **Reusable**: Drop into any page
- **Responsive**: Work on all screen sizes
- **Accessible**: Semantic HTML and ARIA labels
- **Performant**: Minimal re-renders
- **Maintainable**: Clear prop interfaces and documentation
