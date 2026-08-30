import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Pressable, useWindowDimensions, View, Image as RNImage } from "react-native";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

export default function Antas3Level3Screen() {
  const router = useRouter();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narration = useAudioPlayer(require("../../assets/audio/antas3 level3.mp3"));
  const timerRef = useRef<any>(null);

  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  // Header icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Text 1 — large passage box at top (increased by 50% and moved down 10% + 3%, left 5%)
  const text1W = screenW * 0.72 * 1.50;
  const text1H = screenH * 0.52 * 1.50;
  const text1Left = bgOffsetX + 30 * bgScale - 0.05 * screenW;
  const text1Top = bgOffsetY + 20 * bgScale + 0.10 * screenH + 0.03 * screenH;

  // Choice images — side by side in the middle (matching level 1 layout and padding alignment)
  const choiceW = screenW * 0.38;
  const choiceH = choiceW * (1080 / 1920);
  const choiceGap = 20 * bgScale;
  const totalChoicesW = choiceW * 2 + choiceGap;
  const choiceTop = bgOffsetY + 310 * bgScale + 0.05 * screenH + 0.10 * screenH + 0.10 * screenH;
  const choiceATop = choiceTop;
  const choiceBTop = choiceTop - (39 - 22) / 1080 * choiceH;
  const choiceALeft = (screenW - totalChoicesW) / 2 - 0.03 * screenW;
  const choiceBLeft = choiceALeft + choiceW + choiceGap;

  // Separate Feedback / Button Overlays (independent from image sizes)
  // Green Choice (A - Correct) - reduced by 15%
  const greenBtnW = choiceW * 0.85;
  const greenBtnH = choiceH * 0.85;
  const greenBtnLeft = choiceALeft + (choiceW - greenBtnW) / 2;
  const greenBtnTop = choiceATop + (choiceH - greenBtnH) / 2;

  // Red Choice (B - Wrong) - matched to tight artwork framing
  const redBtnW = choiceW * 0.81;
  const redBtnH = choiceH * 0.81;
  const redBtnLeft = choiceBLeft + (choiceW - redBtnW) / 2 + 0.05 * choiceW;
  const redBtnTop = choiceBTop + (choiceH - redBtnH) / 2 + 0.06 * choiceH;

  // Text 2 — question bar at the bottom
  const text2W = screenW * 0.80 * 2 * 1.70;
  const text2H = screenH * 0.20 * 2 * 1.70;
  const text2Left = bgOffsetX + (DESIGN_W - (text2W / bgScale)) / 2 * bgScale;
  const text2Top = bgOffsetY + 860 * bgScale - 0.10 * screenH - 0.10 * screenH + 0.20 * screenH;

  // Signpost (right side)
  const signLeft = bgOffsetX + 1660 * bgScale + 0.05 * screenW - 0.05 * screenW + 0.03 * screenW;
  const signW = 210 * bgScale;
  const nextTop = bgOffsetY + 630 * bgScale - 0.03 * screenH - 0.02 * screenH + 0.10 * screenH + 0.05 * screenH + 0.05 * screenH;
  const nextH = 92 * bgScale;
  const backTop = bgOffsetY + 735 * bgScale - 0.02 * screenH - 0.02 * screenH + 0.10 * screenH + 0.05 * screenH + 0.05 * screenH;
  const backSignH = 92 * bgScale;

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    try {
      setAudioModeAsync({ playsInSilentMode: true });
      narration.loop = false;
      narration.volume = 1;
      narration.muted = !soundEnabled;
      narration.play();
    } catch (e) {
      console.warn("Antas3Level3 narration setup error:", e);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [narration]);

  useEffect(() => {
    try {
      narration.muted = !soundEnabled;
    } catch (e) {
      console.warn("Antas3Level3 narration mute error:", e);
    }
  }, [soundEnabled, narration]);

  const handlePlayNarration = () => {
    try {
      narration.play();
    } catch (e) {
      console.warn("Antas3Level3 narration play error:", e);
    }
  };

  const handleSelectChoice = (choice: "A" | "B") => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 300 }), withTiming(1, { duration: 300 })),
      3, true
    );
    // Correct answer is A
    if (choice === "A") {
      timerRef.current = setTimeout(() => {
        router.navigate("/antas4" as any);
      }, 2000);
    }
  };

  const handleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.navigate("/antas4" as any);
  };

  const handleBack = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.back();
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

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
        {/* Top Header Bar */}
        <View style={{ position: "absolute", top: Math.max(insets.top, 12), left: Math.max(insets.left, 16), right: Math.max(insets.right, 16), flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 30 }}>
          <Pressable onPress={handleBack} hitSlop={12} className="active:opacity-70">
            <RNImage source={require("../../assets/images/ui/back.png")} style={{ width: backW, height: backH }} resizeMode="contain" />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0.03 * screenW }}>
            <Pressable onPress={handlePlayNarration} hitSlop={12} className="active:opacity-70">
              <RNImage
                source={require("../../assets/images/ui/sound.png")}
                style={{ width: soundW, height: soundH, opacity: soundEnabled ? 1 : 0.5 }}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <RNImage source={require("../../assets/images/ui/settings.png")} style={{ width: settingsW, height: settingsH }} resizeMode="contain" />
            </Pressable>
          </View>
        </View>

        {/* Text 1 — Passage box (top) */}
        <Animated.View entering={FadeInUp.duration(600)} style={{ position: "absolute", top: text1Top, left: text1Left, width: text1W, height: text1H, zIndex: 20 }} pointerEvents="none">
          <Image source={require("../../assets/images/antas3/question3/text1.png")} style={{ width: "100%", height: "100%" }} contentFit="contain"
            transition={0} />
        </Animated.View>

        {/* Choice A — Image (CORRECT) */}
        <Animated.View entering={FadeIn.duration(600).delay(200)} style={{ position: "absolute", left: choiceALeft, top: choiceATop, width: choiceW, height: choiceH, zIndex: 40 }} pointerEvents="none">
          <Image source={require("../../assets/images/antas3/question3/A.png")} style={{ width: "100%", height: "100%" }} contentFit="contain"
            transition={0} />
        </Animated.View>

        {/* Choice A / Green Choice Interactive Button & Border */}
        <Animated.View entering={FadeIn.duration(600).delay(200)} style={[{ position: "absolute", left: greenBtnLeft, top: greenBtnTop, width: greenBtnW, height: greenBtnH, zIndex: 50 }, (selectedChoice === "A" || selectedChoice === "B") && animatedPulseStyle]}>
          <Pressable onPress={() => handleSelectChoice("A")} disabled={selectedChoice !== null} style={{ width: "100%", height: "100%", borderRadius: 10 * bgScale, borderWidth: selectedChoice !== null ? 4 : 0, borderColor: selectedChoice !== null ? "#22c55e" : "transparent", backgroundColor: selectedChoice !== null ? "rgba(34,197,94,0.22)" : "transparent", overflow: "hidden" }} className="active:opacity-80" />
        </Animated.View>

        {/* Choice B — Image (WRONG) */}
        <Animated.View entering={FadeIn.duration(600).delay(250)} style={{ position: "absolute", left: choiceBLeft, top: choiceBTop, width: choiceW, height: choiceH, zIndex: 40 }} pointerEvents="none">
          <Image source={require("../../assets/images/antas3/question3/B.png")} style={{ width: "100%", height: "100%" }} contentFit="contain"
            transition={0} />
        </Animated.View>

        {/* Choice B / Red Choice Interactive Button & Border */}
        <Animated.View entering={FadeIn.duration(600).delay(250)} style={[{ position: "absolute", left: redBtnLeft, top: redBtnTop, width: redBtnW, height: redBtnH, zIndex: 50 }, selectedChoice === "B" && animatedPulseStyle]}>
          <Pressable onPress={() => handleSelectChoice("B")} disabled={selectedChoice !== null} style={{ width: "100%", height: "100%", borderRadius: 10 * bgScale, borderWidth: selectedChoice === "B" ? 4 : 0, borderColor: selectedChoice === "B" ? "#ef4444" : "transparent", backgroundColor: selectedChoice === "B" ? "rgba(239,68,68,0.22)" : "transparent", overflow: "hidden" }} className="active:opacity-80" />
        </Animated.View>

        {/* Text 2 — Question bar (bottom) */}
        <Animated.View entering={FadeIn.duration(700).delay(100)} style={{ position: "absolute", top: text2Top, left: text2Left, width: text2W, height: text2H, zIndex: 20 }} pointerEvents="none">
          <Image source={require("../../assets/images/antas3/question3/text2.png")} style={{ width: "100%", height: "100%" }} contentFit="contain"
            transition={0} />
        </Animated.View>

        {/* Signpost Next */}
        <Animated.View entering={FadeIn.duration(600)} style={{ position: "absolute", left: signLeft - 0.03 * screenW, top: nextTop, width: signW, height: nextH, zIndex: 25 }}>
          <Pressable onPress={handleNext} hitSlop={8} className="w-full h-full active:scale-95 active:opacity-80">
            <RNImage source={require("../../assets/images/ui/next.png")} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          </Pressable>
        </Animated.View>

        {/* Signpost Back */}
        <Animated.View entering={FadeIn.duration(600)} style={{ position: "absolute", left: signLeft - 0.03 * screenW, top: backTop, width: signW * 0.95, height: backSignH * 0.95, zIndex: 25 }}>
          <Pressable onPress={handleBack} hitSlop={8} className="w-full h-full active:scale-95 active:opacity-80">
            <RNImage source={require("../../assets/images/ui/back-green.png")} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
