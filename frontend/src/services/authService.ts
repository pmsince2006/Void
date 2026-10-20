import { apiClient } from './api';
import { AuthUser, AuthResponse } from '../types/auth';

export const authService = {
  /**
   * Registers a new account and sets HttpOnly session cookie on backend.
   */
  async signup(name: string, email: string, password: string): Promise<AuthUser> {
    const res = await apiClient<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    if (!res.user) {
      throw new Error(res.message || 'Registration failed');
    }
    return res.user;
  },

  /**
   * Verifies credentials and sets HttpOnly session cookie on backend.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!res.user) {
      throw new Error(res.message || 'Login failed');
    }
    return res.user;
  },

  /**
   * Restores user profile from server session. Returns null if unauthenticated.
   * NEVER trusts localStorage for authentication state.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const res = await apiClient<{ status: string; user: AuthUser }>('/auth/me', {
        method: 'GET'
      });
      return res.user || null;
    } catch {
      // 401 or network disconnect means unauthenticated session
      return null;
    }
  },

  /**
   * Invalidates backend session and clears cookie.
   */
  async logout(): Promise<void> {
    await apiClient<{ status: string; message: string }>('/auth/logout', {
      method: 'POST'
    });
  }
};
