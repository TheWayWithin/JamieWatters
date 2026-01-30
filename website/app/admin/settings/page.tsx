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

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordChanging(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
        setTimeout(() => setPasswordMessage(''), 5000);
      } else {
        setPasswordError(data.error || 'Failed to change password.');
      }
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setPasswordChanging(false);
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

              {passwordMessage && (
                <p className="text-body-sm text-success mb-2">{passwordMessage}</p>
              )}

              {!showPasswordForm ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowPasswordForm(true);
                    setPasswordError('');
                    setPasswordMessage('');
                  }}
                >
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                  <div>
                    <label className="block text-body-sm text-text-secondary mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-md text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                      autoComplete="current-password"
                    />
                  </div>

                  <div>
                    <label className="block text-body-sm text-text-secondary mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-md text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                      autoComplete="new-password"
                    />
                    <p className="text-caption text-text-tertiary mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-body-sm text-text-secondary mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-md text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                      autoComplete="new-password"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-body-sm text-error">{passwordError}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={passwordChanging}
                    >
                      {passwordChanging ? 'Changing...' : 'Update Password'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                      }}
                      disabled={passwordChanging}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
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
