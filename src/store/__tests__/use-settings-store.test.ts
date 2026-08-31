import { beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SETTINGS_STORAGE_KEY, useSettingsStore } from "../use-settings-store";

describe("useSettingsStore", () => {
  beforeEach(() => {
    AsyncStorage.clear();
    useSettingsStore.setState({ theme: "system", soundEnabled: true });
  });

  it("starts with system theme and sound enabled", () => {
    const state = useSettingsStore.getState();
    expect(state.theme).toBe("system");
    expect(state.soundEnabled).toBe(true);
  });

  it("setTheme updates the theme", () => {
    act(() => {
      useSettingsStore.getState().setTheme("dark");
    });
    expect(useSettingsStore.getState().theme).toBe("dark");
  });

  it("toggleSound flips soundEnabled", () => {
    act(() => {
      useSettingsStore.getState().toggleSound();
    });
    expect(useSettingsStore.getState().soundEnabled).toBe(false);

    act(() => {
      useSettingsStore.getState().toggleSound();
    });
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
  });

  it("persists changes to AsyncStorage", async () => {
    act(() => {
      useSettingsStore.getState().toggleSound();
    });
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    expect(JSON.parse(raw ?? "")).toMatchObject({
      state: { soundEnabled: false },
      version: 0,
    });
  });

  it("updates volume settings and toggles mute", () => {
    act(() => {
      useSettingsStore.getState().setNarrationVolume(0.9);
      useSettingsStore.getState().setMusicVolume(0.4);
      useSettingsStore.getState().toggleMusicMute();
    });

    const state = useSettingsStore.getState();
    expect(state.narrationVolume).toBe(0.9);
    expect(state.musicVolume).toBe(0.4);
    expect(state.musicMuted).toBe(true);
  });

  it("resetToDefaults restores initial settings", () => {
    act(() => {
      useSettingsStore.getState().setTheme("dark");
      useSettingsStore.getState().setNarrationVolume(0.2);
      useSettingsStore.getState().setMusicVolume(0.1);
      useSettingsStore.getState().toggleSound();
      useSettingsStore.getState().toggleMusicMute();
      useSettingsStore.getState().resetToDefaults();
    });

    const state = useSettingsStore.getState();
    expect(state.theme).toBe("system");
    expect(state.soundEnabled).toBe(true);
    expect(state.narrationVolume).toBe(1.0);
    expect(state.musicVolume).toBe(0.7);
    expect(state.musicMuted).toBe(false);
  });
});
