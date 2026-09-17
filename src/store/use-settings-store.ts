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
  narrationPlaying: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleSound: () => void;
  setNarrationVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  toggleMusicMute: () => void;
  setNarrationPlaying: (playing: boolean) => void;
  resetToDefaults: () => void;
}

export const SETTINGS_STORAGE_KEY = "tuklas-settings";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      soundEnabled: true,
      narrationVolume: 1.0,
      musicVolume: 0.2,
      musicMuted: false,
      narrationPlaying: false,
      setTheme: (theme) => set({ theme }),
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
      setNarrationVolume: (narrationVolume) => set({ narrationVolume }),
      setMusicVolume: (musicVolume) => set({ musicVolume }),
      toggleMusicMute: () =>
        set((state) => ({ musicMuted: !state.musicMuted })),
      setNarrationPlaying: (playing) => set({ narrationPlaying: playing }),
      resetToDefaults: () =>
        set({
          theme: "system",
          soundEnabled: true,
          narrationVolume: 1.0,
          musicVolume: 0.2,
          musicMuted: false,
          narrationPlaying: false,
        }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // musicVolume always resets to the 20% default on each app launch so
      // background music never drowns out narration. In-session changes still
      // apply (the user can raise it up to 100%), but they are not persisted.
      partialize: (state) => ({
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        narrationVolume: state.narrationVolume,
        musicMuted: state.musicMuted,
      }),
      merge: (persistedState, currentState) => {
        const {
          musicVolume: _ignored,
          ...rest
        } = (persistedState ?? {}) as Partial<SettingsState>;
        return { ...currentState, ...rest, musicVolume: 0.2 };
      },
    }
  )
);
