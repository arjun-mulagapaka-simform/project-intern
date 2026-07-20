import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, ShieldCheck, Loader2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/auth';

export const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = 'Username is required!';
    if (!email.trim()) errors.email = 'Email address is required!';
    if (!password) errors.password = 'Password is required!';
    if (password !== password2) errors.password2 = 'Passwords do not match!';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await authApi.register({ username, email, password, password2 });
      const tokens = await authApi.login({ username, password });
      await login(tokens);
      navigate('/me', { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status && axiosError.response.status >= 500) {
        setGeneralError(
          typeof axiosError.response.data?.detail === 'string'
            ? axiosError.response.data.detail
            : `Server Error (${axiosError.response.status}): Backend server error. Please try again later.`
        );
      } else if (axiosError.response?.data) {
        const data = axiosError.response.data;
        const newFieldErrors: Record<string, string> = {};

        if (typeof data === 'object' && data !== null) {
          Object.keys(data).forEach((key) => {
            const val = (data as Record<string, unknown>)[key];
            if (Array.isArray(val)) {
              newFieldErrors[key] = val[0] as string;
            } else if (typeof val === 'string') {
              newFieldErrors[key] = val;
            }
          });
        }

        if (data.detail) {
          setGeneralError(data.detail);
        } else if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
        } else {
          setGeneralError('Registration failed. Please check your inputs!');
        }
      } else {
        setGeneralError('Network Error: Unable to connect to server.');
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
          <span>CHAPTER • CREATE ACCOUNT</span>
        </div>

        <h1 className="slambook-title">Create Account 📝</h1>
        <p className="slambook-subtitle">
          Already have an account?{' '}
          <Link to="/login" className="slambook-link">
            Sign in 🔑
          </Link>
        </p>

        {generalError && (
          <div className="slam-alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{generalError}</div>
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
                className={`slam-input ${fieldErrors.username ? 'slam-input-error' : ''}`}
                placeholder="johndoe"
              />
            </div>
            {fieldErrors.username && <p className="slam-error-text">{fieldErrors.username}</p>}
          </div>

          <div className="slam-field">
            <label className="slam-label">Email Address</label>
            <div className="slam-input-wrapper">
              <Mail className="slam-input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`slam-input ${fieldErrors.email ? 'slam-input-error' : ''}`}
                placeholder="john@example.com"
              />
            </div>
            {fieldErrors.email && <p className="slam-error-text">{fieldErrors.email}</p>}
          </div>

          <div className="slam-field">
            <label className="slam-label">Password</label>
            <div className="slam-input-wrapper">
              <Lock className="slam-input-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`slam-input ${fieldErrors.password ? 'slam-input-error' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password && <p className="slam-error-text">{fieldErrors.password}</p>}
          </div>

          <div className="slam-field">
            <label className="slam-label">Confirm Password</label>
            <div className="slam-input-wrapper">
              <ShieldCheck className="slam-input-icon" />
              <input
                type="password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className={`slam-input ${fieldErrors.password2 ? 'slam-input-error' : ''}`}
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password2 && <p className="slam-error-text">{fieldErrors.password2}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="slam-btn">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
