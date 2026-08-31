import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

export default function Antas5Slide1Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const narration = useAudioPlayer(require("../../assets/audio/Ang Munting Hakbang.mp3"));

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);

  // Header icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase;
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Sign (sign.png) â€” centered in the middle
  // Source 128x56
  const signW = 700 * bgScale * 1.5 * 1.2;
  const signH = signW * (56 / 128);
  const signLeft = (screenW - signW) / 2;
  const signTop = (screenH - signH) / 2;

  // Next button (antas5-next.png) â€” absolute, fixed position so it doesn't move
  // when other components are added or change
  // Source 128x56
  const nextW = 420 * bgScale * 0.8;
  const nextH = nextW * (56 / 128);
  const nextLeft = (screenW - nextW) / 2 + 0.50 * screenW - 0.10 * screenW - 0.05 * screenW;
  const nextTop = (screenH + 700 * bgScale * (56 / 128)) / 2 + 60 * bgScale + 0.20 * screenH - 0.05 * screenH;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          narration.pause();
          narration.seekTo(0);
        } catch (e) {
          // ignore if already released
        }
      };
    }, [narration])
  );

  const handleNext = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate("/antas5-slide2");
  };

  const handleBack = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.back();
  };

  const handleReplayNarration = async () => {
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      narration.loop = false;
      narration.volume = Number.isFinite(narrationVolume) && narrationVolume > 0 ? narrationVolume : 1.0;
      narration.muted = false;
      narration.seekTo(0);
      narration.play();
    } catch (e) {
      console.warn("Antas5Slide1 narration replay error:", e);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

      {/* Full-screen Background */}
      <Image
        source={require("../../assets/images/antas5/background.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        contentFit="cover"
        transition={0}
      />

      <View className="flex-1">
        {/* Top Header Bar */}
        <View
          style={{
            position: "absolute",
            top: Math.max(insets.top, 12),
            left: Math.max(insets.left, 16),
            right: Math.max(insets.right, 16),
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <Pressable onPress={handleBack} hitSlop={12} className="active:opacity-70">
            <Image
              source={require("../../assets/images/ui/back.png")}
              style={{ width: backW, height: backH }}
              contentFit="contain"
              transition={0}
            />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0.03 * screenW }}>
            <Pressable onPress={handleReplayNarration} hitSlop={12} className="active:opacity-70">
              <Image
                source={require("../../assets/images/ui/sound.png")}
                style={{ width: soundW, height: soundH }}
                contentFit="contain"
                transition={0}
              />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <Image
                source={require("../../assets/images/ui/settings.png")}
                style={{ width: settingsW, height: settingsH }}
                contentFit="contain"
                transition={0}
              />
            </Pressable>
          </View>
        </View>

        {/* Sign â€” centered in the middle */}
        <Animated.View
          entering={FadeIn.duration(700)}
          style={{
            position: "absolute",
            top: signTop,
            left: signLeft,
            width: signW,
            height: signH,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas5/slide1/sign.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Next button â€” navigates to slide2 */}
        <Animated.View
          entering={FadeIn.duration(700).delay(150)}
          style={{
            position: "absolute",
            top: nextTop,
            left: nextLeft,
            width: nextW,
            height: nextH,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleNext}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-90"
          >
            <Image
              source={require("../../assets/images/ui/antas5-next.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={0}
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

