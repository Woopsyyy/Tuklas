import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsStore } from "@/store/use-settings-store";

export default function Antas1Level2Screen() {
  const router = useRouter();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

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

  // Choice A and B frame coordinates in 1920x1080 design
  const choiceW = 480 * bgScale;
  const choiceH = 335 * bgScale;
  const choiceTop = bgOffsetY + 625 * bgScale;

  const choiceALeft = bgOffsetX + 430 * bgScale;
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

  const handleSelectChoice = (choice: "A" | "B") => {
    if (selectedChoice !== null) return; // already answered
    setSelectedChoice(choice);

    pulseScale.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 300 }), withTiming(1, { duration: 300 })),
      3,
      true
    );

    // Only proceed to the next level when the correct answer (A) is chosen
    if (choice === "A") {
      timerRef.current = setTimeout(() => {
        router.navigate("/antas1-level3");
      }, 2000);
    }
  };

  const handleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.navigate("/antas1-level3");
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

      {/* Full-screen Question Background (antas1-background.png) */}
      <RNImage
        source={require("../../assets/images/antas1/antas1-background.png")}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <RNImage source={require("../../assets/images/ui/settings.png")} style={{ width: settingsW, height: settingsH }} resizeMode="contain" />
            </Pressable>
          </View>
        </View>

        {/* Choice A Interactive Button (CORRECT ANSWER) */}
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
            (selectedChoice === "A" || selectedChoice === "B") && animatedPulseStyle,
          ]}
        >
          <Pressable
            onPress={() => handleSelectChoice("A")}
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

        {/* Choice B Interactive Button (WRONG ANSWER) */}
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
            selectedChoice === "B" && animatedPulseStyle,
          ]}
        >
          <Pressable
            onPress={() => handleSelectChoice("B")}
            disabled={selectedChoice !== null}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 16 * bgScale,
              borderWidth: selectedChoice === "B" ? 5 : selectedChoice !== null ? 2 : 0,
              borderColor: selectedChoice === "B" ? "#ef4444" : "transparent",
              backgroundColor:
                selectedChoice === "B"
                  ? "rgba(239, 68, 68, 0.25)"
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
            left: signLeft - 0.05 * screenW + 0.02 * screenW + 0.01 * screenW + 0.05 * screenW - 0.05 * screenW,
            top: nextTop + 0.005 * screenH + 0.02 * screenH - 0.01 * screenH,
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
            left: signLeft - 0.05 * screenW + 0.02 * screenW + 0.01 * screenW + 0.05 * screenW - 0.05 * screenW,
            top: backTop + 0.01 * screenH + 0.02 * screenH - 0.01 * screenH,
            width: signW * 0.98 * 0.98 * 0.98,
            height: backH2 * 0.98 * 0.98 * 0.98,
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
            top: screenH * 0.25 + 0.4 * screenH - 0.1 * screenH + 0.02 * screenH + 0.01 * screenH,
            width: screenW * 0.5,
            height: screenH * 0.5,
            zIndex: 40,
          }}
          className="active:opacity-70"
        >
          <Image
            source={require("../../assets/images/antas1/question2/A.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            recyclingKey="antas1-q2-A"
            transition={0}
          />
        </Pressable>

        {/* B.png button — correct answer */}
        <Pressable
          onPress={() => handleSelectChoice("B")}
          disabled={selectedChoice !== null}
          style={{
            position: "absolute",
            left: screenW * 0.25 - 0.4 * screenW + 0.2 * screenW + 0.05 * screenW + screenW * 0.5 + 0.2 * screenW - 0.4 * screenW - 0.1 * screenW + 0.05 * screenW + 0.03 * screenW,
            top: screenH * 0.25 + 0.4 * screenH - 0.1 * screenH + 0.02 * screenH + 0.01 * screenH,
            width: screenW * 0.5,
            height: screenH * 0.5,
            zIndex: 40,
          }}
          className="active:opacity-70"
        >
          <Image
            source={require("../../assets/images/antas1/question2/B.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            recyclingKey="antas1-q2-B"
            transition={0}
          />
        </Pressable>

        {/* Arrow.png — decorative, not a button */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: screenW * 0.5 - screenW * 0.25 + 0.3 * screenW + 0.1 * screenW + 0.1 * screenW,
            top: screenH * 0.25 + 0.4 * screenH - 0.1 * screenH + 0.02 * screenH + 0.01 * screenH + 0.2 * screenH,
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
            top: screenH * 0.25 + 0.4 * screenH - 0.1 * screenH + 0.02 * screenH + 0.01 * screenH + 0.2 * screenH,
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
            top: screenH * 0.5 - screenH * 0.25,
            width: screenW * 0.5 * 1.2,
            height: screenH * 0.5 * 1.2,
            zIndex: 25,
          }}
        >
          <Image
            source={require("../../assets/images/antas1/question2/text2.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            recyclingKey="antas1-q2-text2"
            transition={0}
          />
        </View>

        {/* text.png — decorative text image */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: screenW * 0.5 - screenW * 0.25 - 0.1 * screenW + 0.05 * screenW,
            top: screenH * 0.5 - screenH * 0.25 - 0.1 * screenH - 0.4 * screenH + 0.2 * screenH + 0.05 * screenH - 0.02 * screenH,
            width: screenW * 0.5 * 1.2,
            height: screenH * 0.5 * 1.2,
            zIndex: 25,
          }}
        >
          <Image
            source={require("../../assets/images/antas1/question2/text.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            recyclingKey="antas1-q2-text1"
            transition={0}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
