import React, { useState } from 'react';
import { useGoals, useCreateGoal, useUpdateGoal, useArchiveGoal, useReactivateGoal } from '../hooks/useGoalQueries';
import { Goal, GoalFormData } from '../types/goal';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalFormModal } from '../components/goals/GoalFormModal';
import { ConfirmArchiveModal } from '../components/goals/ConfirmArchiveModal';
import { Plus, Target, Archive, CheckCircle2, Loader2, AlertCircle, Layers } from 'lucide-react';
import { AxiosError } from 'axios';

type TabType = 'active' | 'archived' | 'all';

export const MyGoalsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('active');

  // Modal & Selection States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archivingGoal, setArchivingGoal] = useState<Goal | null>(null);
  const [reactivatingGoalId, setReactivatingGoalId] = useState<number | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string | string[]> | null>(null);

  // Filter parameter for API call based on current tab
  const activeFilter = currentTab === 'active' ? true : currentTab === 'archived' ? false : undefined;
  const { data: goals, isLoading, isError, refetch } = useGoals(activeFilter);

  // React Query Mutations
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const archiveMutation = useArchiveGoal();
  const reactivateMutation = useReactivateGoal();

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setServerErrors(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setServerErrors(null);
    setIsFormOpen(true);
  };

  const handleOpenArchiveModal = (goal: Goal) => {
    setArchivingGoal(goal);
    setIsArchiveOpen(true);
  };

  const handleFormSubmit = async (formData: GoalFormData) => {
    setServerErrors(null);
    try {
      if (editingGoal) {
        await updateMutation.mutateAsync({ id: editingGoal.id, payload: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsFormOpen(false);
      setEditingGoal(null);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        setServerErrors(err.response.data as Record<string, string | string[]>);
      } else {
        setServerErrors({ detail: 'Failed to save goal. Please try again.' });
      }
    }
  };

  const handleConfirmArchive = async () => {
    if (!archivingGoal) return;
    try {
      await archiveMutation.mutateAsync(archivingGoal.id);
      setIsArchiveOpen(false);
      setArchivingGoal(null);
    } catch {
      alert('Failed to archive goal. Please try again.');
    }
  };

  const handleReactivateGoal = async (goal: Goal) => {
    setReactivatingGoalId(goal.id);
    try {
      await reactivateMutation.mutateAsync(goal.id);
    } catch {
      alert('Failed to reactivate goal. Please try again.');
    } finally {
      setReactivatingGoalId(null);
    }
  };

  return (
    <div className="slambook-page-container">
      <div className="slambook-card">
        <div className="washi-tape washi-tape-top-left" />
        <div className="washi-tape washi-tape-top-right" />
        <div className="washi-tape washi-tape-bottom-right" />

        {/* Page Header */}
        <div className="profile-header-bar" style={{ marginBottom: '2rem' }}>
          <div>
            <div className="slambook-stamp" style={{ marginBottom: '0.5rem' }}>
              <Target className="w-4 h-4 inline mr-1" />
              <span>TRACK • MY GOALS</span>
            </div>
            <h1 className="slambook-title">My Goals 🎯</h1>
            <p className="slambook-subtitle" style={{ margin: 0 }}>
              Track your daily, weekly, and custom target goals & streak stats.
            </p>
          </div>

          <button onClick={handleOpenCreateModal} className="slam-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem', marginTop: 0 }}>
            <Plus className="w-5 h-5" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '0.75rem',
          }}
        >
          <button
            onClick={() => setCurrentTab('active')}
            className="slam-nav-btn"
            style={{
              backgroundColor: currentTab === 'active' ? '#fef08a' : '#ffffff',
              transform: currentTab === 'active' ? 'translateY(-2px)' : 'none',
              boxShadow: currentTab === 'active' ? '3px 4px 0px #0f172a' : '2px 2px 0px #0f172a',
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Active Goals</span>
          </button>

          <button
            onClick={() => setCurrentTab('archived')}
            className="slam-nav-btn"
            style={{
              backgroundColor: currentTab === 'archived' ? '#fef08a' : '#ffffff',
              transform: currentTab === 'archived' ? 'translateY(-2px)' : 'none',
              boxShadow: currentTab === 'archived' ? '3px 4px 0px #0f172a' : '2px 2px 0px #0f172a',
            }}
          >
            <Archive className="w-4 h-4 text-amber-700" />
            <span>Archived Goals</span>
          </button>

          <button
            onClick={() => setCurrentTab('all')}
            className="slam-nav-btn"
            style={{
              backgroundColor: currentTab === 'all' ? '#fef08a' : '#ffffff',
              transform: currentTab === 'all' ? 'translateY(-2px)' : 'none',
              boxShadow: currentTab === 'all' ? '3px 4px 0px #0f172a' : '2px 2px 0px #0f172a',
            }}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>All Goals</span>
          </button>
        </div>

        {/* Goals List Content */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <AlertCircle className="w-12 h-12 text-rose-500 style={{ margin: '0 auto 1rem' }}" />
            <h3 className="slambook-title" style={{ fontSize: '2rem' }}>Failed to load goals</h3>
            <p className="slambook-subtitle" style={{ fontSize: '1.3rem' }}>An error occurred while fetching your goals list.</p>
            <button onClick={() => refetch()} className="slam-nav-btn" style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        ) : !goals || goals.length === 0 ? (
          <div
            style={{
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              border: '2.5px dashed #cbd5e1',
              borderRadius: '20px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <Target className="w-14 h-14 text-slate-400" style={{ margin: '0 auto 1rem' }} />
            <h3 className="slambook-title" style={{ fontSize: '2.2rem', margin: 0 }}>
              {currentTab === 'active'
                ? 'No Active Goals Yet'
                : currentTab === 'archived'
                ? 'No Archived Goals'
                : 'No Goals Found'}
            </h3>
            <p className="slambook-subtitle" style={{ fontSize: '1.4rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              {currentTab === 'active'
                ? 'Start tracking your habits by creating your first goal!'
                : currentTab === 'archived'
                ? 'Goal items you archive will appear here.'
                : 'Get started by creating a new goal.'}
            </p>
            {currentTab === 'active' && (
              <button onClick={handleOpenCreateModal} className="slam-btn" style={{ display: 'inline-flex', width: 'auto', padding: '0.75rem 1.75rem' }}>
                <Plus className="w-5 h-5" />
                <span>Create Your First Goal</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleOpenEditModal}
                onArchive={handleOpenArchiveModal}
                onReactivate={handleReactivateGoal}
                isReactivating={reactivatingGoalId === goal.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      <GoalFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingGoal}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        serverErrors={serverErrors}
      />

      {/* Confirm Soft Archive Modal */}
      <ConfirmArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={handleConfirmArchive}
        goalDescription={archivingGoal?.description || ''}
        isArchiving={archiveMutation.isPending}
      />
    </div>
  );
};
