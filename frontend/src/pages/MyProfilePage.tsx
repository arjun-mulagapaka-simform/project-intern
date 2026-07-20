import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMyProfile, useUpdateProfile } from '../hooks/useUserQueries';
import { Camera, Check, Edit3, Loader2, LogOut, User as UserIcon, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const { data: user, isLoading, isError } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    updateProfileMutation.mutate(
      {
        first_name: firstName,
        last_name: lastName,
        bio,
        avatar: selectedFile,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSelectedFile(null);
          setSuccessMessage('Profile updated successfully!');
          setTimeout(() => setSuccessMessage(null), 4000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold">Failed to load profile</h2>
        <p className="text-slate-400 text-sm mt-1 mb-4">An error occurred while fetching your data.</p>
        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-sm transition-all"
        >
          Sign Out
        </button>
      </div>
    );
  }

  const avatarDisplay = previewUrl || user.avatar;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
          <h1 className="text-xl font-bold text-slate-100">My Profile</h1>
          <div className="flex items-center gap-3">
            <Link
              to={`/u/${user.username}`}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
            >
              View Public Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-950 border-2 border-indigo-500/30 flex items-center justify-center text-slate-500 shadow-inner">
                {avatarDisplay ? (
                  <img src={avatarDisplay} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-slate-600" />
                )}
              </div>

              {isEditing && (
                <label className="absolute inset-0 bg-slate-950/70 rounded-full flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 mb-1 text-indigo-400" />
                  <span className="text-[10px] font-medium">Change</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Profile Info / Form */}
            <div className="flex-1 w-full space-y-4">
              {!isEditing ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : user.username}
                      </h2>
                      <p className="text-sm text-indigo-400">@{user.username}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Bio
                    </button>
                  </div>

                  <p className="text-sm text-slate-400 mt-1">{user.email}</p>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Bio</h3>
                    <p className="text-sm text-slate-300 whitespace-pre-line">
                      {user.bio ? user.bio : <span className="italic text-slate-600">No bio provided yet.</span>}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Bio</label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedFile(null);
                      }}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md disabled:opacity-50 transition-all"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
