import { useEffect } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { VolumeSlider } from "@/components/volume-slider";
import { useSettingsStore } from "@/store/use-settings-store";

type VolumeIconName = keyof typeof MaterialIcons.glyphMap;

function getVolumeIcon(volume: number, muted = false): VolumeIconName {
  if (muted || volume <= 0) return "volume-off";
  if (volume < 0.5) return "volume-down";
  return "volume-up";
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const screenH = Math.min(width, height);

  // Store bindings
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const musicMuted = useSettingsStore((state) => state.musicMuted);

  const setNarrationVolume = useSettingsStore(
    (state) => state.setNarrationVolume
  );
  const setMusicVolume = useSettingsStore((state) => state.setMusicVolume);
  const toggleMusicMute = useSettingsStore((state) => state.toggleMusicMute);

  // Sound test audio player
  const testAudioPlayer = useAudioPlayer(
    require("../../assets/audio/tone.wav")
  );
  const testAudioStatus = useAudioPlayerStatus(testAudioPlayer);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setAudioModeAsync({ playsInSilentMode: true });

    return () => {
      try {
        testAudioPlayer.release();
      } catch (e) {
        console.warn("Error releasing test audio player:", e);
      }
    };
  }, [testAudioPlayer]);

  // Update test tone volume dynamically
  useEffect(() => {
    try {
      if (testAudioPlayer) {
        testAudioPlayer.volume = Number.isFinite(narrationVolume)
          ? Math.max(0, Math.min(1, narrationVolume))
          : 0.8;
      }
    } catch (e) {
      console.warn("Test audio volume error:", e);
    }
  }, [narrationVolume, testAudioPlayer]);

  const handleTestSound = () => {
    try {
      if (testAudioStatus.playing) {
        testAudioPlayer.pause();
      } else {
        testAudioPlayer.seekTo(0);
        testAudioPlayer.play();
      }
    } catch (e) {
      console.warn("Error playing test sound:", e);
    }
  };

  // Sizing relative to landscape screen
  const iconBase = Math.max(34, Math.min(46, screenH * 0.09));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;

  const musicIcon = getVolumeIcon(musicVolume, musicMuted);
  const narrationIcon = getVolumeIcon(narrationVolume, narrationVolume <= 0);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

      {/* Jungle / Forest Background matching Tuklas */}
      <Image
        source={require("../../assets/images/slide3/slide3-background.png")}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />

      {/* Ambient Vignette Overlay */}
      <View className="absolute inset-0 bg-black/55" />

      <SafeAreaView
        className="flex-1"
        edges={["top", "bottom", "left", "right"]}
      >
        {/* Top Header Bar */}
        <View
          style={{
            paddingHorizontal: Math.max(insets.left + 16, 20),
            paddingTop: Math.max(insets.top, 8),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            zIndex: 30,
          }}
        >
          {/* Tuklas Back Button */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="flex-row items-center gap-2 active:scale-95 active:opacity-80"
          >
            <Image
              source={require("../../assets/images/ui/back.png")}
              style={{ width: backW, height: backH }}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* Main Settings Body */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: Math.max(insets.left + 16, 20),
            paddingBottom: Math.max(insets.bottom + 12, 16),
            paddingTop: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-xl">
            {/* Musika at Salaysay (Music & Narration Settings) Card */}
            <Animated.View
              entering={FadeInUp.delay(100).duration(500)}
              className="w-full rounded-3xl border-2 border-amber-600/40 bg-[#211208]/90 p-5 shadow-2xl"
            >
              <View className="mb-4 flex-row items-center gap-2.5 border-b border-amber-900/60 pb-3">
                <View className="rounded-xl bg-amber-500/20 p-2">
                  <MaterialIcons name="music-note" size={22} color="#f59e0b" />
                </View>
                <View>
                  <Text className="text-base font-bold text-amber-100">
                    Musika at Salaysay
                  </Text>
                  <Text className="text-xs text-amber-300/70">
                    Kontrolin ang lakas ng musika at boses
                  </Text>
                </View>
              </View>

              <View className="gap-4">
                {/* 1. Background Music Volume & Mute */}
                <View className="gap-2 rounded-2xl border border-amber-900/40 bg-[#160b05]/70 p-3.5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5">
                      <MaterialIcons
                        name={musicIcon}
                        size={22}
                        color={musicMuted || musicVolume === 0 ? "#71717a" : "#f59e0b"}
                      />
                      <Text className="text-sm font-bold text-zinc-100">
                        Musika sa Likod (BGM)
                      </Text>
                    </View>
                    <Text className="text-xs font-semibold text-amber-400">
                      {musicMuted ? "Naka-mute" : `${Math.round(musicVolume * 100)}%`}
                    </Text>
                  </View>

                  <VolumeSlider
                    value={musicVolume}
                    onValueChange={setMusicVolume}
                    color="#f59e0b"
                    disabled={musicMuted}
                  />

                  {/* Mute/Unmute toggle button */}
                  <Pressable
                    onPress={toggleMusicMute}
                    className={`mt-1 flex-row items-center justify-center gap-2 rounded-xl py-2.5 active:scale-98 ${
                      musicMuted
                        ? "border border-amber-500/50 bg-amber-950/70"
                        : "border border-emerald-600/40 bg-emerald-950/60"
                    }`}
                  >
                    <MaterialIcons
                      name={musicMuted ? "volume-off" : "volume-up"}
                      size={18}
                      color={musicMuted ? "#fbbf24" : "#34d399"}
                    />
                    <Text
                      className={`text-xs font-bold ${
                        musicMuted ? "text-amber-300" : "text-emerald-300"
                      }`}
                    >
                      {musicMuted ? "I-unmute ang Musika (Unmute Music)" : "I-mute ang Musika (Mute Music)"}
                    </Text>
                  </Pressable>
                </View>

                {/* 2. Narration / Voice Volume */}
                <View className="gap-2 rounded-2xl border border-amber-900/40 bg-[#160b05]/70 p-3.5">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5">
                      <MaterialIcons
                        name={narrationIcon}
                        size={22}
                        color={narrationVolume === 0 ? "#71717a" : "#38bdf8"}
                      />
                      <Text className="text-sm font-bold text-zinc-100">
                        Boses at Salaysay (Narration)
                      </Text>
                    </View>
                    <Text className="text-xs font-semibold text-sky-400">
                      {`${Math.round(narrationVolume * 100)}%`}
                    </Text>
                  </View>

                  <VolumeSlider
                    value={narrationVolume}
                    onValueChange={setNarrationVolume}
                    color="#38bdf8"
                  />

                  {/* Test Tone Preview Button */}
                  <Pressable
                    onPress={handleTestSound}
                    className={`mt-1 flex-row items-center justify-center gap-2 rounded-xl py-2.5 active:scale-98 ${
                      testAudioStatus.playing
                        ? "border border-sky-400/60 bg-sky-900/70"
                        : "border border-sky-600/40 bg-sky-950/60"
                    }`}
                  >
                    <MaterialIcons
                      name={testAudioStatus.playing ? "pause" : "play-arrow"}
                      size={18}
                      color="#38bdf8"
                    />
                    <Text className="text-xs font-bold text-sky-300">
                      {testAudioStatus.playing
                        ? "Itigil ang Subok ng Tunog"
                        : "Subukan ang Tunog (Test Audio)"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}