import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
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

export default function Antas2Level2Screen() {
  const router = useRouter();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);
  const { width, height } = useWindowDimensions();
const insets = useSafeAreaInsets();
  const narration = useAudioPlayer(require("../../assets/audio/antas2 question2.mp3"));

  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  // Design canvas reference: 1920 x 1080 (16:9)
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

  // Text 1 (Situation prompt)
  const text1W = 1200 * 1.6 * 1.4 * bgScale;
  const text1H = 220 * 1.6 * 1.4 * bgScale;
  const text1Left = bgOffsetX + (DESIGN_W - 1200 * 1.6 * 1.4) / 2 * bgScale;
  const text1Top = bgOffsetY + 70 * bgScale + 0.05 * screenH;

  // Text 2 (Question box)
  const text2W = 950 * 1.5 * bgScale;
  const text2H = 210 * 1.5 * bgScale;
  const text2Left = bgOffsetX + (DESIGN_W - 950 * 1.5) / 2 * bgScale;
  const text2Top = bgOffsetY + 300 * bgScale + 0.1 * screenH;

  // Choices A and B frames
  const choiceW = 500 * 1.5 * bgScale;
  const choiceH = 320 * 1.5 * bgScale;
  const choiceTop = bgOffsetY + 550 * bgScale + 0.05 * screenH;

  const choiceALeft = bgOffsetX + 200 * bgScale;
  const choiceBLeft = bgOffsetX + 970 * bgScale;

  // Wooden signpost Next & Back
  const signLeft = bgOffsetX + 1660 * bgScale + 0.05 * screenW - 0.05 * screenW + 0.03 * screenW;
  const signW = 210 * bgScale;
  const nextTop = bgOffsetY + 630 * bgScale - 0.03 * screenH - 0.10 * screenH + 0.10 * screenH + 0.05 * screenH + 0.05 * screenH;
  const nextH = 92 * bgScale;
  const backTop = bgOffsetY + 735 * bgScale - 0.02 * screenH - 0.10 * screenH + 0.10 * screenH + 0.05 * screenH + 0.05 * screenH;
  const backSignH = 92 * bgScale;

  // Pulsing animation for feedback
  const pulseScale = useSharedValue(1);

useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
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
        console.warn("Antas2Level2 narration setup error:", e);
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

  const handlePlayNarration = () => {
    try {
      narration.seekTo(0);
      narration.play();
    } catch (e) {
      console.warn("Antas2Level2 narration play error:", e);
    }
  };

  const handleSelectChoice = (choice: "A" | "B") => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);

    pulseScale.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 300 }), withTiming(1, { duration: 300 })),
      3,
      true
);
  };

  const handleNext = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    if (timerRef.current) clearTimeout(timerRef.current);
    router.navigate("/antas2-level3" as any);
  };

  const handleBack = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    if (timerRef.current) clearTimeout(timerRef.current);
    router.back();
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

{/* Full-screen Question Background (antas2/background.png) */}
      <Image
        source={require("../../assets/images/antas2/background.png")}
        resizeMode="contain"
        style={{
          position: "absolute",
          left: bgOffsetX + (DESIGN_W * bgScale * 0.02) / 2 - 0.02 * screenW,
          top: bgOffsetY + (DESIGN_H * bgScale * 0.02) / 2,
          width: DESIGN_W * bgScale * 0.98,
          height: DESIGN_H * bgScale * 0.98,
        }}
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom", "left", "right"]}>
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
            <RNImage source={require("../../assets/images/ui/back.png")} style={{ width: backW, height: backH }} resizeMode="contain" />
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
              <RNImage source={require("../../assets/images/ui/settings.png")} style={{ width: settingsW, height: settingsH }} resizeMode="contain" />
            </Pressable>
          </View>
        </View>

        {/* Text 1 Box — Situation prompt */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={{
            position: "absolute",
            top: text1Top,
            left: text1Left,
            width: text1W,
            height: text1H,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas2/question2/text1.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Text 2 Box — Question box */}
        <Animated.View
          entering={FadeIn.duration(600).delay(150)}
          style={{
            position: "absolute",
            top: text2Top,
            left: text2Left,
            width: text2W,
            height: text2H,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas2/question2/text2.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Choice A Image & Interactive Frame (WRONG ANSWER) */}
        <Animated.View
          entering={FadeIn.duration(600).delay(250)}
          style={{
            position: "absolute",
            left: choiceALeft,
            top: choiceTop,
            width: choiceW,
            height: choiceH,
            zIndex: 40,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas2/question2/A.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Choice A Transparent Interactive Overlay / Tight Feedback Border */}
        <Animated.View
          entering={FadeIn.duration(600).delay(250)}
          style={[
            {
              position: "absolute",
              left: choiceALeft + 0.27 * choiceW,
              top: choiceTop + 0.18 * choiceH,
              width: choiceW * 0.48,
              height: choiceH * 0.43,
              zIndex: 50,
            },
            selectedChoice === "A" && animatedPulseStyle,
          ]}
        >
          <Pressable
            onPress={() => handleSelectChoice("A")}
            disabled={selectedChoice !== null}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8 * bgScale,
              borderWidth: selectedChoice === "A" ? 4 : 0,
              borderColor: selectedChoice === "A" ? "#ef4444" : "transparent",
              backgroundColor:
                selectedChoice === "A"
                  ? "rgba(239, 68, 68, 0.22)"
                  : "transparent",
              overflow: "hidden",
            }}
            className="active:opacity-80"
          />
        </Animated.View>

        {/* Choice B Image & Interactive Frame (CORRECT ANSWER) */}
        <Animated.View
          entering={FadeIn.duration(600).delay(250)}
          style={{
            position: "absolute",
            left: choiceBLeft,
            top: choiceTop,
            width: choiceW,
            height: choiceH,
            zIndex: 40,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas2/question2/B.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Choice B Transparent Interactive Overlay / Tight Feedback Border */}
        <Animated.View
          entering={FadeIn.duration(600).delay(250)}
          style={[
            {
              position: "absolute",
              left: choiceBLeft + 0.27 * choiceW,
              top: choiceTop + 0.18 * choiceH,
              width: choiceW * 0.48,
              height: choiceH * 0.43,
              zIndex: 50,
            },
            (selectedChoice === "B" || selectedChoice === "A") && animatedPulseStyle,
          ]}
        >
          <Pressable
            onPress={() => handleSelectChoice("B")}
            disabled={selectedChoice !== null}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8 * bgScale,
              borderWidth: selectedChoice !== null ? 4 : 0,
              borderColor: selectedChoice !== null ? "#22c55e" : "transparent",
              backgroundColor:
                selectedChoice !== null
                  ? "rgba(34, 197, 94, 0.22)"
                  : "transparent",
              overflow: "hidden",
            }}
            className="active:opacity-80"
          />
        </Animated.View>

        {/* Wooden Signpost Next Button */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            position: "absolute",
            left: signLeft - 0.03 * screenW - 0.01 * screenW,
            top: nextTop,
            width: signW,
            height: nextH,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleNext}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-80"
          >
            <RNImage source={require("../../assets/images/ui/next.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>

{/* Wooden Signpost Back Button */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            position: "absolute",
            left: signLeft - 0.03 * screenW - 0.02 * screenW + 0.01 * screenW,
            top: backTop - 0.01 * screenH,
            width: signW * 0.95,
            height: backSignH * 0.95,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-80"
          >
            <RNImage source={require("../../assets/images/ui/back-green.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
