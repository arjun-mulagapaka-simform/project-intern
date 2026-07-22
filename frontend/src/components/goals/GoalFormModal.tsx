import React, { useState, useEffect } from 'react';
import { Goal, GoalFormData, CadenceType } from '../../types/goal';
import { X, Check, Loader2, Target, Calendar, AlertCircle } from 'lucide-react';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  initialData?: Goal | null;
  isSubmitting: boolean;
  serverErrors?: Record<string, string | string[]> | null;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  serverErrors,
}) => {
  const [description, setDescription] = useState('');
  const [cadence, setCadence] = useState<CadenceType>('daily');
  const [targetCount, setTargetCount] = useState<string>('');
  const [errors, setErrors] = useState<{ description?: string; target_count?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDescription(initialData.description || '');
        setCadence(initialData.cadence || 'daily');
        setTargetCount(initialData.target_count ? String(initialData.target_count) : '');
      } else {
        setDescription('');
        setCadence('daily');
        setTargetCount('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleCadenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCadence = e.target.value as CadenceType;
    setCadence(newCadence);
    if (newCadence !== 'n_times_per_week') {
      setTargetCount('');
      setErrors((prev) => ({ ...prev, target_count: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { description?: string; target_count?: string } = {};

    if (!description.trim()) {
      newErrors.description = 'Goal description is required.';
    } else if (description.trim().length > 255) {
      newErrors.description = 'Description cannot exceed 255 characters.';
    }

    if (cadence === 'n_times_per_week') {
      if (!targetCount.trim()) {
        newErrors.target_count = 'Choose a custom frequency for goal.';
      } else {
        const num = Number(targetCount);
        if (isNaN(num) || !Number.isInteger(num) || num < 2 || num > 6) {
          newErrors.target_count = 'Custom frequency target must be between 2 and 6 times per week.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: GoalFormData = {
      description: description.trim(),
      cadence,
      target_count: cadence === 'n_times_per_week' && targetCount ? Number(targetCount) : null,
    };

    await onSubmit(payload);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="slambook-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '2.5rem',
          position: 'relative',
          backgroundColor: '#ffffff',
        }}
      >
        <div className="washi-tape washi-tape-top-left" />
        <div className="washi-tape washi-tape-top-right" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '2px dashed #cbd5e1', paddingBottom: '1rem' }}>
          <div>
            <h2 className="slambook-title" style={{ fontSize: '2rem', margin: 0 }}>
              {initialData ? 'Edit Goal ✏️' : 'New Goal 🎯'}
            </h2>
            <p className="slambook-subtitle" style={{ fontSize: '1.25rem', margin: 0, marginTop: '0.2rem' }}>
              {initialData ? 'Update your target goal & cadence' : 'Set a daily, weekly, or custom goal target'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.25rem',
              borderRadius: '8px',
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {serverErrors?.detail && (
          <div className="slam-alert" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{typeof serverErrors.detail === 'string' ? serverErrors.detail : JSON.stringify(serverErrors.detail)}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Description Input */}
          <div className="slam-field">
            <label className="slam-label">Goal Description *</label>
            <div className="slam-input-wrapper">
              <Target className="slam-input-icon" />
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                className={`slam-input ${errors.description || serverErrors?.description ? 'slam-input-error' : ''}`}
                placeholder="e.g., Read 20 pages of a book"
                maxLength={255}
              />
            </div>
            {(errors.description || serverErrors?.description) && (
              <p className="slam-error-text">
                {errors.description || (Array.isArray(serverErrors?.description) ? serverErrors?.description[0] : serverErrors?.description)}
              </p>
            )}
          </div>

          {/* Cadence Dropdown */}
          <div className="slam-field">
            <label className="slam-label">Goal Cadence *</label>
            <div className="slam-input-wrapper">
              <Calendar className="slam-input-icon" />
              <select
                value={cadence}
                onChange={handleCadenceChange}
                className="slam-input"
                style={{ cursor: 'pointer', appearance: 'none' }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="n_times_per_week">Custom</option>
              </select>
            </div>
          </div>

          {/* Conditional Target Count Field */}
          {cadence === 'n_times_per_week' && (
            <div className="slam-field" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
              <label className="slam-label">Times Per Week (Target Count) *</label>
              <div className="slam-input-wrapper">
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={targetCount}
                  onChange={(e) => {
                    setTargetCount(e.target.value);
                    if (errors.target_count) setErrors((prev) => ({ ...prev, target_count: undefined }));
                  }}
                  className={`slam-input ${errors.target_count || serverErrors?.target_count ? 'slam-input-error' : ''}`}
                  placeholder="e.g., 3 (Min: 2, Max: 6)"
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
              <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.2rem', color: '#64748b', marginTop: '0.2rem' }}>
                Specify how many days per week (2 to 6 days).
              </p>
              {(errors.target_count || serverErrors?.target_count) && (
                <p className="slam-error-text">
                  {errors.target_count || (Array.isArray(serverErrors?.target_count) ? serverErrors?.target_count[0] : serverErrors?.target_count)}
                </p>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
            <button type="button" onClick={onClose} className="slam-nav-btn" disabled={isSubmitting}>
              <span>Cancel</span>
            </button>
            <button type="submit" className="slam-btn" style={{ width: 'auto', padding: '0.75rem 1.75rem', marginTop: 0 }} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialData ? 'Update Goal' : 'Create Goal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
