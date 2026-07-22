import React from 'react';
import { Goal } from '../../types/goal';
import { StreakBadge } from './StreakBadge';
import { Edit3, Archive, Calendar, Clock, RotateCcw } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onArchive: (goal: Goal) => void;
  onReactivate?: (goal: Goal) => void;
  isReactivating?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onArchive,
  onReactivate,
  isReactivating = false,
}) => {
  const getCadenceLabel = () => {
    switch (goal.cadence) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'n_times_per_week':
        return `${goal.target_count || '?'}x per week`;
      default:
        return goal.cadence;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '2.5px solid #0f172a',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        boxShadow: '4px 5px 0px #0f172a',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Header Row: Cadence pill & Status / Created Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '8px',
              backgroundColor: '#fef08a',
              border: '1.5px solid #0f172a',
              color: '#0f172a',
              letterSpacing: '0.03em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-800" />
            {getCadenceLabel()}
          </span>

          {!goal.is_active && (
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.75rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                border: '1.5px solid #94a3b8',
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              Archived
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontFamily: 'var(--font-handwriting)', fontSize: '1.2rem', fontWeight: 600 }}>
          <Clock className="w-3.5 h-3.5" />
          <span>{goal.is_active ? `Created ${formatDate(goal.created_at)}` : `Archived ${goal.archived_at ? formatDate(goal.archived_at) : ''}`}</span>
        </div>
      </div>

      {/* Goal Description */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-handwriting)',
            fontSize: '1.85rem',
            fontWeight: 700,
            color: goal.is_active ? '#0f172a' : '#64748b',
            lineHeight: 1.25,
            margin: 0,
            textDecoration: goal.is_active ? 'none' : 'line-through',
          }}
        >
          {goal.description}
        </h3>
      </div>

      {/* Footer Row: Streak Badge & Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1.5px dashed #cbd5e1' }}>
        <StreakBadge goalId={goal.id} />

        {goal.is_active ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => onEdit(goal)}
              className="slam-nav-btn"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              title="Edit Goal"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onArchive(goal)}
              className="slam-nav-btn"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', backgroundColor: '#fef3c7', color: '#92400e' }}
              title="Archive Goal"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          </div>
        ) : (
          /* Reactivate Goal button for archived card */
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onReactivate && onReactivate(goal)}
              className="slam-nav-btn"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', backgroundColor: '#dcfce7', color: '#166534' }}
              title="Reactivate Goal"
              disabled={isReactivating}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReactivating ? 'animate-spin' : ''}`} />
              <span>{isReactivating ? 'Reactivating...' : 'Reactivate'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
