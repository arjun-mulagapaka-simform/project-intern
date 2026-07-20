import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, User, LogOut, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to={isAuthenticated ? '/me' : '/login'} className="brand-logo">
        <div className="brand-logo-icon">
          <BookOpen className="w-4 h-4 text-slate-900" />
        </div>
        <span>Chapter</span>
      </Link>

      <div className="nav-actions">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <Link to="/me" className="slam-nav-btn">
              <User className="w-4 h-4" />
              <span>@{user.username}</span>
            </Link>
            <button onClick={logout} className="slam-nav-btn slam-nav-btn-danger">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="slam-nav-btn">
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link to="/signup" className="slam-nav-btn" style={{ backgroundColor: '#fef08a' }}>
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
