import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicProfile } from '../hooks/useUserQueries';
import { useUserGoals } from '../hooks/useGoalQueries';
import { GoalCard } from '../components/goals/GoalCard';
import { User as UserIcon, Activity, Loader2, UserX, BookOpen, Target, ArrowLeft } from 'lucide-react';

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading, isError } = usePublicProfile(username || '');
  const { data: goals, isLoading: isGoalsLoading } = useUserGoals(username || '');

  if (isLoading) {
    return (
      <div className="slambook-page-container flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="slambook-page-container">
        <div className="slambook-card text-center py-12">
          <UserX className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="slambook-title">Page Not Found 📄</h2>
          <p className="slambook-subtitle">The profile @{username} doesn't exist.</p>
          <Link to="/login" className="slam-btn w-auto inline-flex px-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="slambook-page-container">
      <div className="slambook-card">
        <div className="washi-tape washi-tape-top-left" />
        <div className="washi-tape washi-tape-top-right" />
        <div className="washi-tape washi-tape-bottom-right" />

        {/* Header Bar */}
        <div className="profile-header-bar">
          <div className="slambook-stamp">
            <BookOpen className="w-4 h-4 inline mr-1" />
            <span>CHAPTER • PUBLIC PROFILE</span>
          </div>

          <Link to="/me" className="slam-nav-btn">
            <ArrowLeft className="w-4 h-4" />
            <span>My Profile</span>
          </Link>
        </div>

        {/* 2-Column Pure CSS Profile Grid */}
        <div className="profile-grid">
          {/* Left Column: Polaroid & User Info */}
          <div className="profile-sidebar-card">
            <div className="polaroid-frame">
              <div className="polaroid-tape" />
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="polaroid-photo" />
              ) : (
                <div className="polaroid-photo text-slate-400">
                  <UserIcon className="w-16 h-16" />
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p className="font-handwriting text-3xl text-amber-900 font-bold">@{profile.username}</p>
            </div>
          </div>

          {/* Right Column: Bio Section */}
          <div className="profile-main-content">
            <h1 className="slambook-title" style={{ fontSize: '2.75rem', margin: 0 }}>
              {profile.first_name || profile.last_name
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                : profile.username}
            </h1>

            <div className="bio-display-box">
              <h3 className="font-heading text-xl text-indigo-900" style={{ marginBottom: '0.75rem' }}>
                About Me ✏️
              </h3>
              <p className="font-handwriting text-2xl text-slate-900 font-bold leading-relaxed whitespace-pre-line">
                {profile.bio ? profile.bio : <span className="italic text-slate-400">No bio written yet.</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Sticky Note */}
        <div className="sticky-note-card activity-matrix-container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="font-heading text-2xl text-slate-900" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity className="w-6 h-6 text-indigo-800" />
              <span>Active Goals</span>
            </div>
          </div>

          {isGoalsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : !goals || goals.length === 0 ? (
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'rgba(254, 252, 232, 0.95)',
                border: '2px dashed #f59e0b',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '0.75rem',
              }}
            >
              <Target className="w-8 h-8 text-amber-700" />
              <p className="font-handwriting text-2xl text-slate-800 font-bold">
                @{profile.username} hasn't set any active goals yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} isOwner={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
