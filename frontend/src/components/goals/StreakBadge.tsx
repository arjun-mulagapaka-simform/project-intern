import React from 'react';
import { useGoalStreak } from '../../hooks/useGoalQueries';
import { Flame, Loader2, Award, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

interface StreakBadgeProps {
  goalId: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ goalId }) => {
  const { data: streak, isLoading, isError } = useGoalStreak(goalId);

  if (isLoading) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1.5px dashed #cbd5e1' }}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
        <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.2rem', color: '#64748b', fontWeight: 600 }}>Loading streak...</span>
      </div>
    );
  }

  if (isError || !streak) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1.5px dashed #fca5a5' }}>
        <Flame className="w-3.5 h-3.5 text-rose-400" />
        <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.2rem', color: '#b91c1c', fontWeight: 600 }}>Streak unavailable</span>
      </div>
    );
  }

  const getStatusStyle = () => {
    switch (streak.status) {
      case 'active':
        return {
          bg: '#fefce8',
          border: '#fde047',
          color: '#854d0e',
          badgeText: 'Active',
          icon: <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />,
        };
      case 'at-risk':
        return {
          bg: '#fff7ed',
          border: '#fdba74',
          color: '#9a3412',
          badgeText: 'At-Risk',
          icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
        };
      case 'broken':
      default:
        return {
          bg: '#f8fafc',
          border: '#cbd5e1',
          color: '#475569',
          badgeText: 'Reset',
          icon: <XCircle className="w-4 h-4 text-slate-400" />,
        };
    }
  };

  const statusConfig = getStatusStyle();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.45rem 0.85rem',
        borderRadius: '12px',
        backgroundColor: statusConfig.bg,
        border: `2px dashed ${statusConfig.border}`,
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        {statusConfig.icon}
        <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.45rem', fontWeight: 700, color: statusConfig.color }}>
          {streak.current_streak} {streak.current_streak === 1 ? 'day' : 'days'}
        </span>
      </div>

      <div style={{ height: '16px', width: '1.5px', backgroundColor: '#cbd5e1' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Longest Streak">
        <Award className="w-3.5 h-3.5 text-indigo-500" />
        <span style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.25rem', fontWeight: 700, color: '#4338ca' }}>
          Best: {streak.longest_streak}
        </span>
      </div>

      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.75rem',
          padding: '0.15rem 0.5rem',
          borderRadius: '6px',
          backgroundColor: '#ffffff',
          border: `1px solid ${statusConfig.border}`,
          color: statusConfig.color,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {statusConfig.badgeText}
      </span>
    </div>
  );
};
