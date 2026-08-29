import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

import "../global.css";

SplashScreen.preventAutoHideAsync();

function BackgroundMusicPlayer() {
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const musicMuted = useSettingsStore((state) => state.musicMuted);
  const player = useAudioPlayer(require("../../assets/audio/background-music.mp3"));

  useEffect(() => {
    try {
      setAudioModeAsync({ playsInSilentMode: true });
      player.loop = true;
      player.play();
    } catch (e) {
      console.warn("BackgroundMusicPlayer play error:", e);
    }
  }, [player]);

  useEffect(() => {
    try {
      if (player) {
        const safeVolume = Number.isFinite(musicVolume)
          ? Math.max(0, Math.min(1, musicVolume))
          : 0.7;
        player.volume = safeVolume;
        player.muted = Boolean(musicMuted);
      }
    } catch (e) {
      console.warn("BackgroundMusicPlayer volume update error:", e);
    }
  }, [musicVolume, musicMuted, player]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BackgroundMusicPlayer />
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            animation: "fade",
            animationDuration: 1200,
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="slide2" options={{ headerShown: false }} />
          <Stack.Screen name="slide3" options={{ headerShown: false }} />
          <Stack.Screen name="antas1" options={{ headerShown: false }} />
          <Stack.Screen name="antas1-level1" options={{ headerShown: false }} />
          <Stack.Screen name="antas1-level2" options={{ headerShown: false }} />
          <Stack.Screen name="antas1-level3" options={{ headerShown: false }} />
          <Stack.Screen name="antas2" options={{ headerShown: false }} />
          <Stack.Screen name="antas2-level1" options={{ headerShown: false }} />
          <Stack.Screen name="antas2-level2" options={{ headerShown: false }} />
          <Stack.Screen name="antas2-level3" options={{ headerShown: false }} />
          <Stack.Screen name="antas3" options={{ headerShown: false }} />
          <Stack.Screen name="antas3-level1" options={{ headerShown: false }} />
          <Stack.Screen name="antas3-level2" options={{ headerShown: false }} />
          <Stack.Screen name="antas3-level3" options={{ headerShown: false }} />
          <Stack.Screen name="antas4" options={{ headerShown: false }} />
          <Stack.Screen name="antas4-level1" options={{ headerShown: false }} />
          <Stack.Screen name="antas5" options={{ headerShown: false }} />
          <Stack.Screen name="audio" options={{ title: "Audio" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
