'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Project {
  id: string;
  name: string;
  githubUrl?: string | null;
  trackProgress: boolean;
  lastSynced?: string | null;
}

export default function SettingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncMessage('');

    try {
      // TODO: Implement actual sync logic when GitHub sync API is ready
      // For now, just simulate a sync
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSyncMessage('All projects synced successfully!');
      await fetchProjects();

      setTimeout(() => setSyncMessage(''), 3000);
    } catch (err) {
      setSyncMessage('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const connectedProjects = projects.filter(
    (p) => p.githubUrl && p.trackProgress
  ).length;
  const totalProjects = projects.length;

  const getLastSyncTime = () => {
    const syncedProjects = projects.filter((p) => p.lastSynced);
    if (syncedProjects.length === 0) return 'Never';

    const latestSync = syncedProjects.reduce((latest, project) => {
      const syncDate = new Date(project.lastSynced!);
      return syncDate > latest ? syncDate : latest;
    }, new Date(0));

    if (latestSync.getTime() === 0) return 'Never';

    return latestSync.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="px-6 pt-8 pb-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-display-md font-bold text-text-primary mb-2">Settings</h2>
        <p className="text-body text-text-secondary">
          Manage your account and integration settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <Card>
          <h3 className="text-heading-md font-semibold text-text-primary mb-4">
            Account
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <p className="text-body text-text-secondary">jamie@jamiewatters.work</p>
            </div>

            <div>
              <label className="block text-body-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <Button variant="secondary" size="sm" disabled>
                Change Password
              </Button>
              <p className="text-caption text-text-tertiary mt-1">Coming soon</p>
            </div>
          </div>
        </Card>

        {/* GitHub Integration Section */}
        <Card>
          <h3 className="text-heading-md font-semibold text-text-primary mb-4">
            GitHub Integration
          </h3>

          {loading ? (
            <p className="text-body text-text-secondary">Loading projects...</p>
          ) : (
            <div className="space-y-6">
              {/* Integration Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-bg-primary border border-border-subtle rounded-lg p-4">
                  <div className="text-2xl font-bold text-brand-accent font-mono mb-1">
                    {connectedProjects} / {totalProjects}
                  </div>
                  <div className="text-body-sm text-text-secondary">
                    Connected Projects
                  </div>
                </div>

                <div className="bg-bg-primary border border-border-subtle rounded-lg p-4">
                  <div className="text-body-lg font-semibold text-text-primary mb-1">
                    {getLastSyncTime()}
                  </div>
                  <div className="text-body-sm text-text-secondary">Last Sync</div>
                </div>
              </div>

              {/* Sync Button */}
              <div>
                <Button
                  variant="primary"
                  onClick={handleSyncAll}
                  disabled={syncing || connectedProjects === 0}
                >
                  {syncing ? 'Syncing...' : 'Sync All Projects Now'}
                </Button>

                {connectedProjects === 0 && (
                  <p className="text-body-sm text-text-tertiary mt-2">
                    Enable progress tracking for projects with GitHub URLs to sync.
                  </p>
                )}

                {syncMessage && (
                  <p
                    className={`text-body-sm mt-2 ${
                      syncMessage.includes('failed') ? 'text-error' : 'text-success'
                    }`}
                  >
                    {syncMessage}
                  </p>
                )}
              </div>

              {/* Connected Projects List */}
              {connectedProjects > 0 && (
                <div>
                  <h4 className="text-body font-semibold text-text-primary mb-3">
                    Connected Projects
                  </h4>
                  <div className="space-y-2">
                    {projects
                      .filter((p) => p.githubUrl && p.trackProgress)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 bg-bg-primary border border-border-subtle rounded-md"
                        >
                          <div>
                            <p className="text-body font-medium text-text-primary">
                              {project.name}
                            </p>
                            <p className="text-body-sm text-text-tertiary">
                              {project.lastSynced
                                ? `Synced ${new Date(
                                    project.lastSynced
                                  ).toLocaleDateString()}`
                                : 'Never synced'}
                            </p>
                          </div>
                          <Badge variant="success" size="sm">
                            Active
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
