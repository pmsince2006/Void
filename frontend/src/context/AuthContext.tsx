import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../types/auth';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  // On page load / refresh: verify session with backend GET /api/auth/me
  // Server-managed HttpOnly cookie is the single source of truth (zero localStorage tokens)
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      addToast(`ACCESS GRANTED. WELCOME BACK, ${loggedInUser.name.toUpperCase()}.`, 'success', 'AUTHENTICATED');
    },
    [addToast]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const newUser = await authService.signup(name, email, password);
      setUser(newUser);
      addToast(`IDENTITY INITIALIZED. WELCOME TO VOID, ${newUser.name.toUpperCase()}.`, 'success', 'ACCOUNT CREATED');
    },
    [addToast]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      addToast('IDENTITY DECOUPLED. SESSION TERMINATED.', 'info', 'LOGGED OUT');
    }
  }, [addToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
