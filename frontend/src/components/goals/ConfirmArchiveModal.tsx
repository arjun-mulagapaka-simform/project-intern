import React from 'react';
import { Archive, X, Loader2 } from 'lucide-react';

interface ConfirmArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  goalDescription: string;
  isArchiving: boolean;
}

export const ConfirmArchiveModal: React.FC<ConfirmArchiveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  goalDescription,
  isArchiving,
}) => {
  if (!isOpen) return null;

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
          maxWidth: '480px',
          padding: '2.5rem',
          position: 'relative',
          backgroundColor: '#ffffff',
        }}
      >
        <div className="washi-tape washi-tape-top-left" style={{ backgroundColor: 'var(--tape-pink)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              border: '2px solid #0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px #0f172a',
            }}
          >
            <Archive className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="slambook-title" style={{ fontSize: '1.8rem', margin: 0 }}>
              Archive Goal?
            </h3>
          </div>
        </div>

        <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '1.45rem', color: '#334155', fontWeight: 600, marginBottom: '1.5rem', lineHeight: '1.4' }}>
          Are you sure you want to archive <strong style={{ color: '#0f172a' }}>"{goalDescription}"</strong>? It will be moved to your Archived Goals tab.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
          <button type="button" onClick={onClose} className="slam-nav-btn" disabled={isArchiving}>
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="slam-btn"
            style={{
              width: 'auto',
              padding: '0.75rem 1.75rem',
              marginTop: 0,
              backgroundColor: '#fde68a',
            }}
            disabled={isArchiving}
          >
            {isArchiving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Archiving...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
