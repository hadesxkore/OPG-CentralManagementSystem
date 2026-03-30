import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

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
