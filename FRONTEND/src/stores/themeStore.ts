import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'default' | 'zinc' | 'blue' | 'emerald' | 'rose' | 'amber' | 'violet';

interface ThemeStore {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      color: 'default',
      setColor: (color) => {
         set({ color });
         const root = document.documentElement;
         // remove all possible theme classes
         root.classList.remove('theme-zinc', 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-amber', 'theme-violet');
         if (color !== 'default') {
             root.classList.add(`theme-${color}`);
         }
      },
    }),
    {
      name: 'opg-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const root = document.documentElement;
          root.classList.remove('theme-zinc', 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-amber', 'theme-violet');
          if (state.color !== 'default') {
             root.classList.add(`theme-${state.color}`);
          }
        }
      }
    }
  )
);

// Helper to trigger hydration on load
export const initializeTheme = () => {
    useThemeStore.getState();
};
