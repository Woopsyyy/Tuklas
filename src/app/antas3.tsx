import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

export default function Antas3Screen() {
  const router = useRouter();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narration = useAudioPlayer(require("../../assets/audio/antas3.mp3"));

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Title (text1.png)
  const titleW = 900 * 2.2 * bgScale;
  const titleH = 200 * 2.2 * bgScale;
  const titleLeft = bgOffsetX + (DESIGN_W - 900 * 2.2) / 2 * bgScale;
  const titleTop = Math.max(insets.top - 20, bgOffsetY - 10 * bgScale) - 0.05 * screenH;

  // Dialogue box (text2.png)
  const text2W = 1200 * 2.2 * bgScale;
  const text2H = 310 * 2.2 * bgScale;
  const text2Left = bgOffsetX + (DESIGN_W - 1200 * 2.2) / 2 * bgScale + 120 * bgScale - 0.05 * screenW;
  const text2Top = bgOffsetY + 450 * bgScale - 0.10 * screenH;

  // Action button (button.png)
  const buttonW = 460 * 1.375 * 1.3 * 1.2 * bgScale;
  const buttonH = 100 * 1.375 * 1.3 * 1.2 * bgScale;
  const buttonLeft = bgOffsetX + (DESIGN_W - 460 * 1.375 * 1.3 * 1.2) / 2 * bgScale - 30 * bgScale + 0.08 * screenW - 0.05 * screenW;
  const buttonTop = bgOffsetY + 870 * bgScale;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useFocusEffect(
    useCallback(() => {
      try {
        setAudioModeAsync({ playsInSilentMode: true });
        narration.loop = false;
        narration.volume = 1;
        narration.muted = !soundEnabled;
        narration.seekTo(0);
        narration.play();
      } catch (e) {
        console.warn("Antas3 narration setup error:", e);
      }

      return () => {
        try {
          narration.pause();
          narration.seekTo(0);
        } catch (e) {
          // ignore if already released
        }
      };
    }, [narration, soundEnabled])
  );

  const handleStartMission = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate("/antas3-level1" as any);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />
      {/* Full-screen Background */}
      <Image
        source={require("../../assets/images/antas3/background.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        contentFit="cover"
        transition={0}
      />
      <SafeAreaView className="flex-1" edges={["top", "bottom", "left", "right"]}>
        <View style={{ position: "absolute", top: Math.max(insets.top, 12), left: Math.max(insets.left, 16), right: Math.max(insets.right, 16), flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 30 }}>
          <Pressable onPress={() => router.back()} hitSlop={12} className="active:opacity-70">
            <Image source={require("../../assets/images/ui/back.png")} style={{ width: backW, height: backH }} contentFit="contain" transition={0} />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0.03 * screenW }}>
            <Pressable onPress={toggleSound} hitSlop={12} className="active:opacity-70">
              <Image
                source={require("../../assets/images/ui/sound.png")}
                style={{ width: soundW, height: soundH, opacity: soundEnabled ? 1 : 0.5 }}
                contentFit="contain"
                transition={0}
              />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <Image source={require("../../assets/images/ui/settings.png")} style={{ width: settingsW, height: settingsH }} contentFit="contain" transition={0} />
            </Pressable>
          </View>
        </View>
        <Animated.View entering={FadeInUp.duration(600)} style={{ position: "absolute", top: titleTop, left: titleLeft, width: titleW, height: titleH, zIndex: 20 }} pointerEvents="none">
          <Image source={require("../../assets/images/antas3/text1.png")} style={{ width: "100%", height: "100%" }} contentFit="contain" transition={0} />
        </Animated.View>
        <Animated.View entering={FadeIn.duration(700)} style={{ position: "absolute", top: text2Top, left: text2Left, width: text2W, height: text2H, zIndex: 15 }} pointerEvents="none">
          <Image source={require("../../assets/images/antas3/text2.png")} style={{ width: "100%", height: "100%" }} contentFit="contain" transition={0} />
        </Animated.View>
        <Animated.View entering={FadeIn.duration(700).delay(200)} style={{ position: "absolute", top: buttonTop, left: buttonLeft, width: buttonW, height: buttonH, zIndex: 25 }}>
          <Pressable onPress={handleStartMission} hitSlop={8} className="w-full h-full active:scale-95 active:opacity-90">
            <Image source={require("../../assets/images/antas3/button.png")} style={{ width: "100%", height: "100%" }} contentFit="contain" transition={0} />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
