import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  theme: ThemePreference;
  soundEnabled: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleSound: () => void;
}

export const SETTINGS_STORAGE_KEY = "tuklas-settings";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      soundEnabled: true,
      setTheme: (theme) => set({ theme }),
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
