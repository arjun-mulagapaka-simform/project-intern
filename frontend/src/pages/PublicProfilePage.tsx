import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicProfile } from '../hooks/useUserQueries';
import { User as UserIcon, Calendar, Activity, Loader2, UserX } from 'lucide-react';

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading, isError } = usePublicProfile(username || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <UserX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">User Not Found</h2>
        <p className="text-slate-400 text-sm mt-1 mb-6">
          The requested profile @{username} does not exist or has been removed.
        </p>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-950 border-2 border-indigo-500/30 flex items-center justify-center text-slate-600 shadow-inner flex-shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-slate-600" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {profile.first_name || profile.last_name
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                : profile.username}
            </h1>
            <p className="text-sm font-medium text-indigo-400">@{profile.username}</p>
            <p className="text-sm text-slate-300 pt-2 leading-relaxed max-w-2xl">
              {profile.bio || <span className="italic text-slate-600">No bio available.</span>}
            </p>
          </div>
        </div>

        {/* Placeholder Block for Contribution Graph (Module 4) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-200 font-semibold text-lg">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>Contribution Activity</span>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Reserved for Module 4
            </span>
          </div>

          {/* Grid Mockup Skeleton */}
          <div className="p-6 bg-slate-950/60 border border-slate-800/60 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Contribution Graph Slot</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Real-time activity matrix, commit streaks, and goal progress visualization will be integrated here in Module 4.
              </p>
            </div>

            {/* Fake Contribution Heatmap Preview */}
            <div className="w-full pt-4 grid grid-cols-12 sm:grid-cols-24 gap-1.5 opacity-30">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 rounded-sm ${
                    i % 5 === 0
                      ? 'bg-indigo-500'
                      : i % 3 === 0
                      ? 'bg-indigo-700'
                      : i % 7 === 0
                      ? 'bg-indigo-400'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
