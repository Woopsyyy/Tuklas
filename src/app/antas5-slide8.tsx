import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

export default function Antas5Slide8Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const narration = useAudioPlayer(require("../../assets/audio/ang tunay.mp3"));

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.min(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  // Header icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase;
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Continue Button (button.png)
  const buttonW = Math.min(screenW * 0.40, 780 * bgScale * 0.85);
  const buttonH = buttonW * (97 / 780);
  const buttonLeft = (screenW - buttonW) / 2 + 0.03 * screenW;
  const buttonBottom = Math.max(insets.bottom + 18, 25 * bgScale) - 0.03 * screenH - 0.05 * screenH;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          narration.pause();
          narration.seekTo(0);
        } catch (e) {}
      };
    }, [narration])
  );

  const handlePlayNarration = async () => {
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      narration.loop = false;
      narration.volume = Number.isFinite(narrationVolume) && narrationVolume > 0 ? narrationVolume : 1.0;
      narration.muted = false;
      try {
        narration.seekTo(0);
      } catch (_) {}
      narration.play();
    } catch (e) {
      console.warn("Antas5Slide8 narration play error:", e);
    }
  };

  const handleContinue = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate("/antas5-slide9");
  };

  const handleBack = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden={true} />

      {/* Full-screen Background */}
      <Image
        source={require("../../assets/images/antas5/slide8/background.png")}
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
            <Pressable onPress={handlePlayNarration} hitSlop={12} className="active:opacity-70">
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

        {/* Continue Button (button.png) */}
        <Animated.View
          entering={FadeInUp.duration(700).delay(350)}
          style={{
            position: "absolute",
            bottom: buttonBottom,
            left: buttonLeft,
            width: buttonW,
            height: buttonH,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleContinue}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-90"
          >
            <Image
              source={require("../../assets/images/antas5/slide7/button.png")}
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
