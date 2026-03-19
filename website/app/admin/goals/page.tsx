'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface Goal {
  id: string;
  goalId: string | null;
  name: string;
  description: string | null;
  metric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: string;
  status: string;
  deadline: string | null;
  dueDate: string | null;
  horizon: string | null;
  period: string | null;
  parentId: string | null;
  confidence: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  progressPercent: number;
  project: { id: string; name: string; slug: string } | null;
}

type ViewMode = 'overview' | 'create' | 'review';

function statusColor(status: string): string {
  switch (status) {
    case 'on_track': case 'achieved': return 'text-green-400';
    case 'at_risk': return 'text-amber-400';
    case 'behind': return 'text-red-400';
    default: return 'text-text-secondary';
  }
}

function statusBg(status: string): string {
  switch (status) {
    case 'on_track': case 'achieved': return 'bg-green-500';
    case 'at_risk': return 'bg-amber-500';
    case 'behind': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q}-${now.getFullYear()}`;
}

function getCurrentYear(): string {
  return String(new Date().getFullYear());
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('overview');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMetric, setFormMetric] = useState('');
  const [formCurrentValue, setFormCurrentValue] = useState(0);
  const [formTargetValue, setFormTargetValue] = useState(1);
  const [formUnit, setFormUnit] = useState('');
  const [formCategory, setFormCategory] = useState('Revenue');
  const [formHorizon, setFormHorizon] = useState<'yearly' | 'quarterly'>('quarterly');
  const [formPeriod, setFormPeriod] = useState(getCurrentQuarter());
  const [formParentId, setFormParentId] = useState('');
  const [formDeadline, setFormDeadline] = useState('');

  // Review state
  const [reviewGoalId, setReviewGoalId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('on_track');

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/goals');
      if (!res.ok) throw new Error('Failed to load goals');
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const yearlyGoals = goals.filter((g) => g.horizon === 'yearly');
  const quarterlyGoals = goals.filter((g) => g.horizon === 'quarterly');
  const ungroupedGoals = goals.filter((g) => !g.horizon);
  const currentQuarter = getCurrentQuarter();
  const currentYear = getCurrentYear();

  // Quarterly goals for the current quarter
  const currentQKRs = quarterlyGoals.filter((g) => g.period === currentQuarter);
  const otherQKRs = quarterlyGoals.filter((g) => g.period && g.period !== currentQuarter);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormMetric('');
    setFormCurrentValue(0);
    setFormTargetValue(1);
    setFormUnit('');
    setFormCategory('Revenue');
    setFormHorizon('quarterly');
    setFormPeriod(getCurrentQuarter());
    setFormParentId('');
    setFormDeadline('');
    setEditingGoal(null);
  };

  const openEdit = (g: Goal) => {
    setFormName(g.name);
    setFormDescription(g.description || '');
    setFormMetric(g.metric);
    setFormCurrentValue(g.currentValue);
    setFormTargetValue(g.targetValue);
    setFormUnit(g.unit);
    setFormCategory(g.category);
    setFormHorizon((g.horizon as 'yearly' | 'quarterly') || 'quarterly');
    setFormPeriod(g.period || getCurrentQuarter());
    setFormParentId(g.parentId || '');
    setFormDeadline(g.deadline ? g.deadline.split('T')[0] : g.dueDate ? g.dueDate.split('T')[0] : '');
    setEditingGoal(g);
    setView('create');
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: formName,
        description: formDescription || null,
        metric: formMetric,
        currentValue: formCurrentValue,
        targetValue: formTargetValue,
        unit: formUnit,
        category: formCategory,
        horizon: formHorizon,
        period: formPeriod,
        parentId: formParentId || null,
        deadline: formDeadline || null,
      };

      let res: Response;
      if (editingGoal) {
        res = await fetch(`/api/admin/goals/${editingGoal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      resetForm();
      setView('overview');
      fetchGoals();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (goalId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes,
          reviewedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to save review');
      setReviewGoalId(null);
      setReviewNotes('');
      fetchGoals();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Delete this goal? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/goals/${goalId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchGoals();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto"><p className="text-text-secondary">Loading goals...</p></div>;
  }

  // ==================== CREATE / EDIT FORM ====================
  if (view === 'create') {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-display-sm font-bold text-text-primary">
            {editingGoal ? 'Edit Goal' : 'New Goal'}
          </h1>
          <button onClick={() => { resetForm(); setView('overview'); }} className="text-body-sm text-text-secondary hover:text-text-primary">
            Cancel
          </button>
        </div>

        {error && <p className="text-red-400 text-body-sm">{error}</p>}

        <div className="bg-bg-surface border border-border-default rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-body-sm text-text-secondary mb-1">Horizon</label>
              <select value={formHorizon} onChange={(e) => {
                const h = e.target.value as 'yearly' | 'quarterly';
                setFormHorizon(h);
                setFormPeriod(h === 'yearly' ? getCurrentYear() : getCurrentQuarter());
              }} className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary">
                <option value="yearly">Yearly Objective</option>
                <option value="quarterly">Quarterly Key Result</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-body-sm text-text-secondary mb-1">Period</label>
              <select value={formPeriod} onChange={(e) => setFormPeriod(e.target.value)} className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary">
                {formHorizon === 'yearly' ? (
                  <>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </>
                ) : (
                  <>
                    <option value="Q1-2026">Q1 2026</option>
                    <option value="Q2-2026">Q2 2026</option>
                    <option value="Q3-2026">Q3 2026</option>
                    <option value="Q4-2026">Q4 2026</option>
                    <option value="Q1-2027">Q1 2027</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {formHorizon === 'quarterly' && yearlyGoals.length > 0 && (
            <div>
              <label className="block text-body-sm text-text-secondary mb-1">Parent Yearly Objective</label>
              <select value={formParentId} onChange={(e) => setFormParentId(e.target.value)} className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary">
                <option value="">None (standalone)</option>
                {yearlyGoals.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-body-sm text-text-secondary mb-1">Goal Name</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary"
              placeholder="e.g. First $1 revenue" />
          </div>

          <div>
            <label className="block text-body-sm text-text-secondary mb-1">Description (optional)</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2}
              className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary resize-none"
              placeholder="What does success look like?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm text-text-secondary mb-1">Metric</label>
              <input type="text" value={formMetric} onChange={(e) => setFormMetric(e.target.value)}
                className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary"
                placeholder="e.g. MRR" />
            </div>
            <div>
              <label className="block text-body-sm text-text-secondary mb-1">Unit</label>
              <input type="text" value={formUnit} onChange={(e) => setFormUnit(e.target.value)}
                className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary"
                placeholder="e.g. $, users, %" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm text-text-secondary mb-1">Current Value</label>
              <input type="number" value={formCurrentValue} onChange={(e) => setFormCurrentValue(Number(e.target.value))}
                className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary" />
            </div>
            <div>
              <label className="block text-body-sm text-text-secondary mb-1">Target Value</label>
              <input type="number" value={formTargetValue} onChange={(e) => setFormTargetValue(Number(e.target.value))}
                className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm text-text-secondary mb-1">Category</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary">
                <option value="Revenue">Revenue</option>
                <option value="Growth">Growth</option>
                <option value="Product">Product</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Content">Content</option>
                <option value="Community">Community</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm text-text-secondary mb-1">Deadline</label>
              <input type="date" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full bg-bg-primary border border-border-default rounded-md px-3 py-2 text-body-sm text-text-primary" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !formName || !formMetric || !formUnit}
            className="w-full py-3 bg-brand-primary text-white text-body-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
            style={{ minHeight: '44px' }}>
            {saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </div>
    );
  }

  // ==================== OVERVIEW ====================
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-display-sm font-bold text-text-primary">Goals & Objectives</h1>
        <div className="flex gap-2">
          <button onClick={() => { resetForm(); setFormHorizon('yearly'); setFormPeriod(getCurrentYear()); setView('create'); }}
            className="px-4 py-2 bg-purple-600 text-white text-body-sm font-medium rounded-md hover:opacity-90"
            style={{ minHeight: '44px' }}>
            + Yearly Objective
          </button>
          <button onClick={() => { resetForm(); setView('create'); }}
            className="px-4 py-2 bg-brand-primary text-white text-body-sm font-medium rounded-md hover:opacity-90"
            style={{ minHeight: '44px' }}>
            + Quarterly KR
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-body-sm">{error}</p>}

      {/* Yearly Objectives */}
      <section className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-body font-semibold text-text-primary">{currentYear} Yearly Objectives</h2>
          <span className="text-[11px] text-text-secondary">{yearlyGoals.filter((g) => g.period === currentYear).length} objectives</span>
        </div>

        {yearlyGoals.filter((g) => g.period === currentYear || !g.period).length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary text-body-sm mb-3">No yearly objectives set for {currentYear}.</p>
            <button onClick={() => { resetForm(); setFormHorizon('yearly'); setFormPeriod(currentYear); setView('create'); }}
              className="text-brand-primary text-body-sm hover:underline">
              Set your {currentYear} objectives
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {yearlyGoals.filter((g) => g.period === currentYear || !g.period).map((goal) => {
              const childKRs = quarterlyGoals.filter((kr) => kr.parentId === goal.id);
              const isReviewing = reviewGoalId === goal.id;
              return (
                <div key={goal.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${statusBg(goal.status)}`} />
                        <span className="text-body font-medium text-text-primary">{goal.name}</span>
                        <span className="text-[10px] text-text-secondary capitalize">{goal.status.replace(/_/g, ' ')}</span>
                      </div>
                      {goal.description && (
                        <p className="text-[11px] text-text-secondary ml-4 mb-2">{goal.description}</p>
                      )}
                      <div className="ml-4">
                        <div className="flex items-center gap-3 text-body-sm">
                          <span className={statusColor(goal.status)}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                          <span className="text-text-secondary">({goal.progressPercent}%)</span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-bg-primary rounded-full overflow-hidden max-w-xs">
                          <div className={`h-full rounded-full ${statusBg(goal.status)}`}
                            style={{ width: `${Math.min(goal.progressPercent, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setReviewGoalId(isReviewing ? null : goal.id); setReviewStatus(goal.status); setReviewNotes(goal.reviewNotes || ''); }}
                        className="text-[11px] text-text-secondary hover:text-text-primary px-2 py-1 rounded border border-border-subtle">
                        Review
                      </button>
                      <button onClick={() => openEdit(goal)}
                        className="text-[11px] text-text-secondary hover:text-text-primary px-2 py-1 rounded border border-border-subtle">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(goal.id)}
                        className="text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/20">
                        Del
                      </button>
                    </div>
                  </div>

                  {/* Review panel */}
                  {isReviewing && (
                    <div className="mt-3 ml-4 bg-bg-primary border border-border-subtle rounded-lg p-4 space-y-3">
                      <p className="text-body-sm font-medium text-text-primary">Review: {goal.name}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-text-secondary mb-1">Status Assessment</label>
                          <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}
                            className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary">
                            <option value="on_track">On Track</option>
                            <option value="at_risk">At Risk</option>
                            <option value="behind">Behind</option>
                            <option value="achieved">Achieved</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-text-secondary mb-1">Last Reviewed</label>
                          <p className="text-body-sm text-text-primary mt-1.5">{goal.reviewedAt ? new Date(goal.reviewedAt).toLocaleDateString() : 'Never'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-text-secondary mb-1">Review Notes</label>
                        <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={2}
                          className="w-full bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary resize-none"
                          placeholder="What's changed? What needs to adjust?" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setReviewGoalId(null)} className="px-3 py-1.5 text-body-sm text-text-secondary border border-border-default rounded-md">
                          Cancel
                        </button>
                        <button onClick={() => handleReview(goal.id)} disabled={saving}
                          className="px-3 py-1.5 text-body-sm text-white bg-brand-primary rounded-md hover:opacity-90 disabled:opacity-50">
                          {saving ? 'Saving...' : 'Save Review'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Child quarterly KRs */}
                  {childKRs.length > 0 && (
                    <div className="mt-3 ml-4 space-y-2">
                      <p className="text-[11px] text-text-secondary font-medium">Linked Quarterly KRs:</p>
                      {childKRs.map((kr) => (
                        <div key={kr.id} className="flex items-center justify-between bg-bg-primary rounded-md p-2.5 border border-border-subtle">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusBg(kr.status)}`} />
                            <span className="text-body-sm text-text-primary truncate">{kr.name}</span>
                            <span className="text-[10px] text-text-secondary shrink-0">{kr.period}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-body-sm ${statusColor(kr.status)}`}>{kr.progressPercent}%</span>
                            <button onClick={() => openEdit(kr)} className="text-[11px] text-text-secondary hover:text-text-primary">Edit</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Current Quarter KRs */}
      <section className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-body font-semibold text-text-primary">{currentQuarter.replace('-', ' ')} Key Results</h2>
          <span className="text-[11px] text-text-secondary">{currentQKRs.length} KRs</span>
        </div>

        {currentQKRs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary text-body-sm mb-3">No key results set for {currentQuarter.replace('-', ' ')}.</p>
            <button onClick={() => { resetForm(); setView('create'); }}
              className="text-brand-primary text-body-sm hover:underline">
              Set your {currentQuarter.replace('-', ' ')} key results
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
            {currentQKRs.map((kr) => {
              const parentGoal = yearlyGoals.find((g) => g.id === kr.parentId);
              const isReviewing = reviewGoalId === kr.id;
              return (
                <div key={kr.id} className="bg-bg-primary rounded-lg p-4 border border-border-subtle">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium text-text-primary">{kr.name}</p>
                      {parentGoal && (
                        <p className="text-[10px] text-purple-400 mt-0.5">{parentGoal.name}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setReviewGoalId(isReviewing ? null : kr.id); setReviewStatus(kr.status); setReviewNotes(kr.reviewNotes || ''); }}
                        className="text-[10px] text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded border border-border-subtle">
                        Review
                      </button>
                      <button onClick={() => openEdit(kr)}
                        className="text-[10px] text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded border border-border-subtle">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(kr.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded border border-red-500/20">
                        Del
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-body-sm">
                      <span className={statusColor(kr.status)}>{kr.currentValue} / {kr.targetValue} {kr.unit}</span>
                      <span className="text-text-secondary">{kr.progressPercent}%</span>
                    </div>
                    <div className="mt-1 h-2 bg-bg-surface rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${statusBg(kr.status)}`}
                        style={{ width: `${Math.min(kr.progressPercent, 100)}%` }} />
                    </div>
                  </div>
                  {kr.reviewedAt && (
                    <p className="text-[10px] text-text-secondary mt-2">Last reviewed: {new Date(kr.reviewedAt).toLocaleDateString()}</p>
                  )}

                  {/* Inline review */}
                  {isReviewing && (
                    <div className="mt-3 pt-3 border-t border-border-subtle space-y-2">
                      <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}
                        className="w-full bg-bg-surface border border-border-default rounded-md px-2 py-1.5 text-body-sm text-text-primary">
                        <option value="on_track">On Track</option>
                        <option value="at_risk">At Risk</option>
                        <option value="behind">Behind</option>
                        <option value="achieved">Achieved</option>
                      </select>
                      <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={2}
                        className="w-full bg-bg-surface border border-border-default rounded-md px-2 py-1.5 text-body-sm text-text-primary resize-none"
                        placeholder="Review notes..." />
                      <div className="flex gap-2">
                        <button onClick={() => setReviewGoalId(null)} className="flex-1 px-2 py-1.5 text-body-sm text-text-secondary border border-border-default rounded-md">Cancel</button>
                        <button onClick={() => handleReview(kr.id)} disabled={saving}
                          className="flex-1 px-2 py-1.5 text-body-sm text-white bg-brand-primary rounded-md disabled:opacity-50">
                          {saving ? '...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Other quarter KRs */}
      {otherQKRs.length > 0 && (
        <section className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-border-subtle">
            <h2 className="text-body font-semibold text-text-primary">Other Quarters</h2>
          </div>
          <div className="divide-y divide-border-subtle">
            {otherQKRs.map((kr) => (
              <div key={kr.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusBg(kr.status)}`} />
                  <span className="text-body-sm text-text-primary truncate">{kr.name}</span>
                  <span className="text-[10px] text-text-secondary shrink-0">{kr.period}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-body-sm ${statusColor(kr.status)}`}>{kr.progressPercent}%</span>
                  <button onClick={() => openEdit(kr)} className="text-[11px] text-text-secondary hover:text-text-primary">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ungrouped legacy goals */}
      {ungroupedGoals.length > 0 && (
        <section className="bg-bg-surface border border-border-default rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between">
            <h2 className="text-body font-semibold text-text-primary">Ungrouped Goals</h2>
            <span className="text-[11px] text-text-secondary">Set horizon to organize</span>
          </div>
          <div className="divide-y divide-border-subtle">
            {ungroupedGoals.map((g) => (
              <div key={g.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusBg(g.status)}`} />
                  <span className="text-body-sm text-text-primary truncate">{g.name}</span>
                  <span className="text-[10px] text-text-secondary shrink-0">{g.category}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-body-sm ${statusColor(g.status)}`}>{g.progressPercent}%</span>
                  <button onClick={() => openEdit(g)} className="text-[11px] text-text-secondary hover:text-text-primary">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
