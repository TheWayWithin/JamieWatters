'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check', {
        credentials: 'include',
      });

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
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
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setPassword('');
      setError('');
      router.push('/admin');
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-body text-text-secondary">Loading...</p>
      </main>
    );
  }

  // Login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-bg-surface border border-border-default rounded-lg p-8 shadow-lg">
            <h2 className="text-display-md font-semibold text-text-primary mb-6 text-center">
              Admin Access
            </h2>

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-body-sm font-medium text-text-primary mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-bg-primary border border-border-default rounded-md px-4 py-3 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all"
                  autoFocus
                  disabled={loginLoading}
                />
                {error && (
                  <p className="text-error text-body-sm mt-2">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated view with tab navigation
  // Don't show tabs on the login page itself (/admin with no auth)
  const showTabs = pathname !== '/admin' || isAuthenticated;

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-display-sm font-bold text-brand-primary">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-body-sm text-text-secondary hidden sm:inline">
              jamie@jamiewatters.work
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      {showTabs && <AdminTabs currentPath={pathname} />}

      {/* Page Content */}
      <div>{children}</div>
    </main>
  );
}
