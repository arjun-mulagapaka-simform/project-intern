import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AuthTokens } from '../types/auth';
import { User } from '../types/user';
import { userApi } from '../api/userApi';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {
        // Ignore errors during logout cleanup
      });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const refetchUser = useCallback(async () => {
    try {
      const userData = await userApi.getMe();
      setUser(userData);
    } catch {
      logout();
    }
  }, [logout]);

  const login = useCallback(
    async (tokens: AuthTokens) => {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      await refetchUser();
    },
    [refetchUser]
  );

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const userData = await userApi.getMe();
          setUser(userData);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for global unauthorized events dispatched by axios interceptor
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUser,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
