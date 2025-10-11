'use client';

import { useState } from 'react';
import { getAllProjects } from '@/lib/placeholder-data';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin dashboard state
  const [selectedProjectId, setSelectedProjectId] = useState('1');
  const [mrr, setMrr] = useState('0');
  const [users, setUsers] = useState('0');
  const [status, setStatus] = useState<'active' | 'beta' | 'planning' | 'archived'>('active');
  const [successMessage, setSuccessMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  const projects = getAllProjects();
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for secure session
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear client state regardless of API response
      setIsAuthenticated(false);
      setPassword('');
      setError('');
    }
  };

  // Handle project selection
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setMrr(project.metrics.mrr.toString());
      setUsers(project.metrics.users.toString());
      setStatus(project.status);
    }
    setSuccessMessage('');
    setUpdateError('');
  };

  // Handle metrics update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setUpdateError('');
    setLoading(true);

    try {
      const res = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          projectId: selectedProjectId,
          metrics: {
            mrr: parseFloat(mrr),
            users: parseInt(users),
            status
          }
        })
      });

      if (res.ok) {
        setSuccessMessage('Metrics updated successfully!');
        // Clear message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setUpdateError('Failed to update metrics');
      }
    } catch (err) {
      setUpdateError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Status badge color
  const statusColors: Record<typeof status, 'success' | 'warning' | 'info' | 'error'> = {
    active: 'success',
    beta: 'warning',
    planning: 'info',
    archived: 'error',
  };

  // Unauthenticated view
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-bg-surface border border-border-default rounded-lg p-8 shadow-lg">
            <h2 className="text-display-md font-semibold text-text-primary mb-6 text-center">
              Admin Access
            </h2>

            <form onSubmit={handleLogin}>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                error={error}
                autoFocus
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              {error && (
                <p className="text-error text-body-sm mt-4 text-center">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated view
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-display-sm font-bold text-brand-primary">
            Admin Dashboard
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-4xl mx-auto">
        <h1 className="text-display-lg font-bold text-text-primary mb-4">
          Admin Dashboard
        </h1>
        <p className="text-body-lg text-text-secondary mb-12">
          Update project metrics. Changes go live immediately.
        </p>

        {/* Project Selector */}
        <div className="mb-8">
          <label htmlFor="project-selector" className="block text-body-sm font-medium text-text-primary mb-2">
            Select Project
          </label>
          <select
            id="project-selector"
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Current Metrics Display */}
        {selectedProject && (
          <div className="mb-12">
            <h2 className="text-display-sm font-semibold text-text-primary mb-6">
              Current Metrics for {selectedProject.name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-bg-surface border border-border-default rounded-lg p-6">
                <div className="text-3xl font-bold text-brand-accent font-mono mb-2">
                  ${selectedProject.metrics.mrr.toLocaleString()}
                </div>
                <div className="text-body-sm text-text-secondary">
                  MRR
                </div>
              </div>

              <div className="bg-bg-surface border border-border-default rounded-lg p-6">
                <div className="text-3xl font-bold text-brand-accent font-mono mb-2">
                  {selectedProject.metrics.users.toLocaleString()}
                </div>
                <div className="text-body-sm text-text-secondary">
                  Users
                </div>
              </div>

              <div className="bg-bg-surface border border-border-default rounded-lg p-6">
                <div className="mb-2">
                  <Badge variant={statusColors[selectedProject.status]} size="md">
                    {selectedProject.status}
                  </Badge>
                </div>
                <div className="text-body-sm text-text-secondary">
                  Status
                </div>
              </div>
            </div>

            <p className="text-caption text-text-tertiary">
              Last updated: {selectedProject.updatedAt.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}

        {/* Update Form */}
        <div className="bg-bg-surface border border-border-default rounded-lg p-6 sm:p-8">
          <h2 className="text-display-sm font-semibold text-text-primary mb-6">
            Update Metrics
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            {/* MRR Input */}
            <div>
              <label htmlFor="mrr" className="block text-body-sm font-medium text-text-primary mb-2">
                Monthly Recurring Revenue (MRR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  $
                </span>
                <input
                  id="mrr"
                  type="number"
                  step="0.01"
                  value={mrr}
                  onChange={(e) => setMrr(e.target.value)}
                  className="w-full bg-bg-primary border border-border-default rounded-md pl-8 pr-4 py-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Users Input */}
            <Input
              label="Active Users"
              type="number"
              value={users}
              onChange={(e) => setUsers(e.target.value)}
              disabled={loading}
            />

            {/* Status Select */}
            <div>
              <label htmlFor="status" className="block text-body-sm font-medium text-text-primary mb-2">
                Project Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="beta">Beta</option>
                <option value="planning">Planning</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>

            {/* Success Message */}
            {successMessage && (
              <p className="text-success text-body-sm text-center">
                {successMessage}
              </p>
            )}

            {/* Error Message */}
            {updateError && (
              <p className="text-error text-body-sm text-center">
                {updateError}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
