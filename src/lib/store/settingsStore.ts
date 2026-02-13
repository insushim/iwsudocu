import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SettingsStore {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      soundEnabled: true,

      setTheme: (theme) => {
        set({ theme });
      },

      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
    }),
    {
      name: 'numero-quest-settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
