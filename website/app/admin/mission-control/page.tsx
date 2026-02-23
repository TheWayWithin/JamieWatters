import MissionControlTabs from '@/components/admin/mission-control/MissionControlTabs';

export default function MissionControlPage() {
  return (
    <div>
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-display-sm font-bold text-text-primary">Mission Control</h1>
        <p className="mt-1 text-body text-text-secondary">
          Portfolio dashboard &mdash; products, sprint, tasks, and agent activity
        </p>
      </div>
      <MissionControlTabs />
    </div>
  );
}
