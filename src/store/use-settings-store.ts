import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  theme: ThemePreference;
  soundEnabled: boolean;
  narrationVolume: number;
  musicVolume: number;
  musicMuted: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleSound: () => void;
  setNarrationVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  toggleMusicMute: () => void;
  resetToDefaults: () => void;
}

export const SETTINGS_STORAGE_KEY = "tuklas-settings";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      soundEnabled: true,
      narrationVolume: 1.0,
      musicVolume: 0.7,
      musicMuted: false,
      setTheme: (theme) => set({ theme }),
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
      setNarrationVolume: (narrationVolume) => set({ narrationVolume }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      toggleMusicMute: () =>
        set((state) => ({ musicMuted: !state.musicMuted })),
      resetToDefaults: () =>
        set({
          theme: "system",
          soundEnabled: true,
          narrationVolume: 1.0,
          musicVolume: 0.7,
          musicMuted: false,
        }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
