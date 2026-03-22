import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';
import { MOCK_CREDENTIALS } from '../data/mockData';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password: string) => {
        const match = MOCK_CREDENTIALS.find(
          (c) => c.email === email.trim().toLowerCase() && c.password === password
        );
        if (match) {
          set({ user: match.user, isAuthenticated: true });
          return { success: true, message: 'Login successful' };
        }
        return { success: false, message: 'Invalid email or password.' };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (patch) => {
        set(state => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        }));
      },
    }),
    {
      name: 'opg-auth-storage',
    }
  )
);
