import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/auth';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/me';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password!');
      return;
    }

    setIsSubmitting(true);
    try {
      const tokens = await authApi.login({ username, password });
      await login(tokens);
      navigate(from, { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status && axiosError.response.status >= 500) {
        setError(
          typeof axiosError.response.data?.detail === 'string'
            ? axiosError.response.data.detail
            : `Server Error (${axiosError.response.status}): Server error! Please try again later.`
        );
      } else if (axiosError.response?.data?.detail) {
        setError(axiosError.response.data.detail);
      } else if (axiosError.response?.data?.non_field_errors) {
        const nonField = axiosError.response.data.non_field_errors;
        setError(Array.isArray(nonField) ? nonField[0] : nonField);
      } else if (!axiosError.response) {
        setError('Network Error: Unable to connect to backend server.');
      } else {
        setError('Invalid username or password! Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="slambook-auth-container">
      <div className="slambook-card">
        <div className="washi-tape washi-tape-top-left" />
        <div className="washi-tape washi-tape-top-right" />
        <div className="washi-tape washi-tape-bottom-right" />

        <div className="slambook-stamp">
          <BookOpen className="w-3.5 h-3.5 inline mr-1" />
          <span>CHAPTER • SIGN IN</span>
        </div>

        <h1 className="slambook-title">Sign In ✏️</h1>
        <p className="slambook-subtitle">
          Don't have an account yet?{' '}
          <Link to="/signup" className="slambook-link">
            Create account 📖
          </Link>
        </p>

        {error && (
          <div className="slam-alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="slam-field">
            <label className="slam-label">Username</label>
            <div className="slam-input-wrapper">
              <User className="slam-input-icon" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="slam-input"
                placeholder="enter username..."
              />
            </div>
          </div>

          <div className="slam-field">
            <label className="slam-label">Password</label>
            <div className="slam-input-wrapper">
              <Lock className="slam-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="slam-input has-toggle"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="slam-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="slam-btn">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
