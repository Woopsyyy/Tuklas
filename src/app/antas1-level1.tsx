import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, useWindowDimensions, View, Image as RNImage } from "react-native";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";
import { useScoreStore } from "@/store/use-score-store";

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

export default function Antas1Level1Screen() {
  const router = useRouter();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const setScore = useScoreStore((state) => state.setScore);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narration = useAudioPlayer(require("../../assets/audio/antas1 level1.mp3"));

  const [selectedChoice, setSelectedChoice] = useState<"A" | "B" | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  // Design canvas reference: 1920 x 1080 (16:9)
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.min(screenW / DESIGN_W, screenH / DESIGN_H);
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

  // Choice A and B frame coordinates in 1920x1080 design
  const choiceW = 480 * bgScale * 1.44 * 0.8;
  const choiceH = 335 * bgScale * 1.44 * 0.8;
  const choiceTop = bgOffsetY + 625 * bgScale;

  const choiceALeft = (bgOffsetX + 430 * bgScale) * 0.76;
  const choiceBLeft = bgOffsetX + 985 * bgScale;

  // Wooden signpost Next & Back
  const signLeft = bgOffsetX + 1670 * bgScale;
  const signW = 200 * bgScale;
  const nextTop = bgOffsetY + 635 * bgScale + 0.08 * screenH + 0.04 * screenH + 0.02 * screenH;
  const nextH = 88 * bgScale;
  const backTop = bgOffsetY + 735 * bgScale + 0.05 * screenH + 0.05 * screenH + 0.05 * screenH;
  const backH2 = 88 * bgScale;

  // Pulsing animation for correct answer
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
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
      console.warn("Antas1Level1 narration play error:", e);
    }
  };

  const handleSelectChoice = (choice: "A" | "B") => {
    if (selectedChoice !== null) return; // already answered
    setSelectedChoice(choice);
    setScore("antas1Level1", choice === "B");

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
    router.navigate("/antas1-level2");
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
      <StatusBar hidden={true} />

      {/* Full-screen Question Background (antas1-background.png) */}
      <RNImage
        source={require("../../assets/images/antas1/antas1-background.png")}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
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
            <RNImage source={require("../../assets/images/ui/back.png")} style={{ width: backW, height: backH }} resizeMode="contain" />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0.03 * screenW }}>
            <Pressable onPress={handlePlayNarration} hitSlop={12} className="active:opacity-70">
              <RNImage
                source={require("../../assets/images/ui/sound.png")}
                style={{ width: soundW, height: soundH }}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <RNImage source={require("../../assets/images/ui/settings.png")} style={{ width: settingsW, height: settingsH }} resizeMode="contain" />
            </Pressable>
          </View>
        </View>

        {/* Choice A Interactive Button */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[
            {
              position: "absolute",
              left: choiceALeft,
              top: choiceTop,
              width: choiceW,
              height: choiceH,
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
              borderRadius: 16 * bgScale,
              borderWidth: selectedChoice === "A" ? 5 : selectedChoice !== null ? 2 : 0,
              borderColor: selectedChoice === "A" ? "#ef4444" : "transparent",
              backgroundColor:
                selectedChoice === "A"
                  ? "rgba(239, 68, 68, 0.25)"
                  : "transparent",
              overflow: "hidden",
            }}
            className="active:opacity-80"
          />
        </Animated.View>

        {/* Choice B Interactive Button (CORRECT ANSWER) */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[
            {
              position: "absolute",
              left: choiceBLeft,
              top: choiceTop,
              width: choiceW,
              height: choiceH,
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
              borderRadius: 16 * bgScale,
              borderWidth: selectedChoice !== null ? 6 : 0,
              borderColor: selectedChoice !== null ? "#22c55e" : "transparent",
              backgroundColor:
                selectedChoice !== null
                  ? "rgba(34, 197, 94, 0.28)"
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
            left: signLeft - 0.05 * screenW + 0.02 * screenW + 0.01 * screenW + 0.05 * screenW - 0.05 * screenW + signW * 1.8,
            top: (nextTop + 0.005 * screenH + 0.02 * screenH - 0.01 * screenH) * 0.97335,
            width: signW * 1.2,
            height: nextH * 1.2,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleNext}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-80"
          >
            <RNImage
              source={require("../../assets/images/ui/next.png")}
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
            left: signLeft - 0.05 * screenW + 0.02 * screenW + 0.01 * screenW + 0.05 * screenW - 0.05 * screenW + signW * 1.8,
            top: backTop + 0.01 * screenH + 0.02 * screenH - 0.01 * screenH,
            width: signW * 0.98 * 0.98 * 0.98 * 1.2,
            height: backH2 * 0.98 * 0.98 * 0.98 * 1.2,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-80"
          >
            <RNImage
              source={require("../../assets/images/ui/back-green.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>

        {/* A.png button — wrong answer */}
        <Pressable
          onPress={() => handleSelectChoice("A")}
          disabled={selectedChoice !== null}
          style={{
            position: "absolute",
            left: screenW * 0.25 - 0.4 * screenW + 0.2 * screenW + 0.05 * screenW,
            top: (screenH * 0.25 + 0.4 * screenH - 0.1 * screenH + 0.02 * screenH + 0.01 * screenH) * 0.9,
            width: screenW * 0.5 * 0.8,
            height: screenH * 0.5 * 0.8,
            zIndex: 40,
          }}
          className="active:opacity-70"
        >
          <Image
            source={require("../../assets/images/antas1/question1/A.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            recyclingKey="antas1-q1-A"
            transition={0}
          />
        </Pressable>

        {/* B.png button — correct answer with confirmation triangle */}
        <Pressable
          onPress={() => handleSelectChoice("B")}
          disabled={selectedChoice !== null}
          style={{
            position: "absolute",
            left: screenW * 0.25 - 0.4 * screenW + 0.2 * screenW + 0.05 * screenW + screenW * 0.5 + 0.2 * screenW - 0.4 * screenW - 0.1 * screenW + 0.05 * screenW + 0.03 * screenW,
            top: (screenH * 0.25 + 0.4 * screenH - 0.1 * screenH + 0.02 * screenH + 0.01 * screenH) * 0.9,
            width: screenW * 0.5 * 0.8,
            height: screenH * 0.5 * 0.8,
            zIndex: 40,
          }}
          className="active:opacity-70"
        >
          <Image
            source={require("../../assets/images/antas1/question1/b.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            recyclingKey="antas1-q1-B"
            transition={0}
          />
        </Pressable>

        {/* Arrow.png — decorative, not a button */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: screenW * 0.5 - screenW * 0.25 + 0.3 * screenW + 0.1 * screenW + 0.1 * screenW,
            top: (screenH * 0.25 + 0.4 * screenH - 0.1 * screenH + 0.02 * screenH + 0.01 * screenH + 0.2 * screenH) * 0.9,
            width: screenW * 0.25 * 0.5,
            height: screenH * 0.25 * 0.5,
            zIndex: 20,
          }}
        >
          <RNImage
            source={require("../../assets/images/ui/arrow.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>

        {/* Arrow.png — mirrored copy on the left side, decorative */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: screenW * (1 - (0.25 + 0.3 + 0.1 + 0.1 + 0.25 * 0.5)),
            top: (screenH * 0.25 + 0.4 * screenH - 0.1 * screenH + 0.02 * screenH + 0.01 * screenH + 0.2 * screenH) * 0.9,
            width: screenW * 0.25 * 0.5,
            height: screenH * 0.25 * 0.5,
            zIndex: 20,
            transform: [{ rotate: "180deg" }],
          }}
        >
          <RNImage
            source={require("../../assets/images/ui/arrow.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>

        {/* text2.png — decorative text image */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: screenW * 0.5 - screenW * 0.25 - 0.1 * screenW + 0.05 * screenW,
            top: (screenH * 0.5 - screenH * 0.25) * 0.648,
            width: screenW * 0.5 * 1.2,
            height: screenH * 0.5 * 1.2,
            zIndex: 25,
          }}
        >
          <Image
            source={require("../../assets/images/antas1/question1/text2.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            recyclingKey="antas1-q1-text2"
            transition={0}
          />
        </View>

        {/* text1.png — decorative text image */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: screenW * 0.5 - screenW * 0.25 - 0.1 * screenW + 0.05 * screenW,
            top: (screenH * 0.5 - screenH * 0.25 - 0.1 * screenH - 0.4 * screenH + 0.2 * screenH + 0.05 * screenH - 0.02 * screenH) * 5.94,
            width: screenW * 0.5 * 1.2,
            height: screenH * 0.5 * 1.2,
            zIndex: 25,
          }}
        >
          <Image
            source={require("../../assets/images/antas1/question1/text1.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            recyclingKey="antas1-q1-text1"
            transition={0}
          />
        </View>
      </View>
    </View>
  );
}
