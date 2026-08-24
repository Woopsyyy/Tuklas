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

  it("rehydrates persisted state", async () => {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        state: { theme: "light", soundEnabled: false },
        version: 0,
      })
    );
    await useSettingsStore.persist.rehydrate();
    const state = useSettingsStore.getState();
    expect(state.theme).toBe("light");
    expect(state.soundEnabled).toBe(false);
  });
});
