import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMyProfile, useUpdateProfile } from '../hooks/useUserQueries';
import { Camera, Check, Edit3, Loader2, LogOut, User as UserIcon, X, AlertCircle, BookOpen, ExternalLink } from 'lucide-react';
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
        alert('File size exceeds 5MB limit!');
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
      <div className="slambook-page-container flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="slambook-page-container">
        <div className="slambook-card text-center py-12">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="slambook-title">Failed to load profile</h2>
          <p className="slambook-subtitle">Could not fetch your profile data.</p>
          <button onClick={logout} className="slam-nav-btn slam-nav-btn-danger">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const avatarDisplay = previewUrl || user.avatar;

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
            <span>CHAPTER • MY PROFILE</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to={`/u/${user.username}`} className="slam-nav-btn">
              <span>View Public Page</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button onClick={logout} className="slam-nav-btn slam-nav-btn-danger">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="slam-alert bg-emerald-100 border-emerald-500 text-emerald-900">
            <Check className="w-5 h-5 flex-shrink-0" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* 2-Column Pure CSS Profile Grid */}
        <div className="profile-grid">
          {/* Left Column: Polaroid & User Info */}
          <div className="profile-sidebar-card">
            <div className="polaroid-frame group">
              <div className="polaroid-tape" />
              {avatarDisplay ? (
                <img src={avatarDisplay} alt={user.username} className="polaroid-photo" />
              ) : (
                <div className="polaroid-photo text-slate-400">
                  <UserIcon className="w-16 h-16" />
                </div>
              )}

              {isEditing && (
                <label className="absolute inset-0 bg-slate-900/60 rounded flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-7 h-7 mb-1 text-amber-300" />
                  <span className="text-xs font-bold">Change Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p className="font-handwriting text-3xl text-amber-900 font-bold">@{user.username}</p>
              <p className="font-handwriting text-xl text-slate-600 font-semibold" style={{ marginTop: '0.25rem' }}>
                {user.email}
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="slam-nav-btn"
                style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Right Column: Bio Section & Edit Form */}
          <div className="profile-main-content">
            {!isEditing ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 className="slambook-title" style={{ fontSize: '2.75rem', margin: 0 }}>
                    {user.first_name || user.last_name
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : user.username}
                  </h2>
                </div>

                <div className="bio-display-box">
                  <h3 className="font-heading text-xl text-indigo-900" style={{ marginBottom: '0.75rem' }}>
                    About Me ✏️
                  </h3>
                  <p className="font-handwriting text-2xl text-slate-900 font-bold leading-relaxed whitespace-pre-line">
                    {user.bio ? (
                      user.bio
                    ) : (
                      <span className="italic text-slate-400">
                        No bio written yet. Click "Edit Profile" on the left to write your story!
                      </span>
                    )}
                  </p>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="edit-form-card">
                <h3 className="font-heading text-xl text-indigo-900">Edit Profile Details ✏️</h3>

                <div className="form-grid-2col">
                  <div className="slam-field" style={{ margin: 0 }}>
                    <label className="slam-label">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="slam-input"
                      placeholder="John"
                    />
                  </div>
                  <div className="slam-field" style={{ margin: 0 }}>
                    <label className="slam-label">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="slam-input"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="slam-field" style={{ margin: 0 }}>
                  <label className="slam-label">Bio / Personal Story</label>
                  <textarea
                    rows={5}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="slam-textarea"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px dashed #cbd5e1',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                    }}
                    className="slam-nav-btn"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="slam-btn"
                    style={{ width: 'auto', padding: '0.85rem 2rem', marginTop: 0 }}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Profile</span>
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
  );
};
