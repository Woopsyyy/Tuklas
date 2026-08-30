import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Pressable, useWindowDimensions, View, Image as RNImage } from "react-native";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsStore } from "@/store/use-settings-store";

type ChoiceType = "A" | "B" | "C" | "D";

export default function Antas5Level1Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  const [selectedChoice, setSelectedChoice] = useState<ChoiceType | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
  const soundW = iconBase;
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Signboard (sign.png: 624 x 521) — hangs from ceiling at top center
  const signW = Math.min(screenW * 0.38, 680 * bgScale);
  const signH = signW * (521 / 624);
  const signLeft = (screenW - signW) / 2;
  const signTop = Math.min(0, bgOffsetY);

  // Choice cards (A: 757x133, B/C/D: 757x142)
  const choiceW = Math.min(screenW * 0.41, 760 * bgScale);
  const choiceH = choiceW * (142 / 757);
  const choiceAH = choiceW * (133 / 757);

  // Column positions (2 columns x 2 rows)
  const marginX = Math.max(insets.left + 24, bgOffsetX + 120 * bgScale);
  const col1Left = marginX;
  const col2Left = screenW - marginX - choiceW;

  const row1Top = bgOffsetY + 530 * bgScale;
  const row2Top = row1Top + choiceH + 34 * bgScale;

  // Next button (antas5-next.png: 1920x1080 canvas / badge at bottom right)
  const nextW = 230 * bgScale;
  const nextH = nextW * (56 / 128) * 2.2;
  const nextRight = Math.max(insets.right + 20, 30 * bgScale);
  const nextBottom = Math.max(insets.bottom + 16, 20 * bgScale) - 0.10 * screenH - 0.10 * screenH;

  // Pulse animation for selection
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelectChoice = (choice: ChoiceType) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);

    pulseScale.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 250 }), withTiming(1, { duration: 250 })),
      3,
      true
    );

    // Correct answer is "B"
    if (choice === "B") {
      timerRef.current = setTimeout(() => {
        router.navigate("/antas5-level2");
      }, 2000);
    }
  };

  const handleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.navigate("/antas5-level2");
  };

  const handleBack = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.back();
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const getChoiceFeedbackStyle = (choice: ChoiceType) => {
    if (selectedChoice === null) {
      return {
        borderWidth: 0,
        borderColor: "transparent",
        backgroundColor: "transparent",
      };
    }
    // Correct answer (B) turns green
    if (choice === "B") {
      return {
        borderWidth: 4,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.24)",
      };
    }
    // Selected wrong answer turns red
    if (selectedChoice === choice) {
      return {
        borderWidth: 4,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.24)",
      };
    }
    return {
      borderWidth: 0,
      borderColor: "transparent",
      backgroundColor: "transparent",
    };
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
            <Image
              source={require("../../assets/images/ui/back.png")}
              style={{ width: backW, height: backH }}
              contentFit="contain"
              transition={0}
            />
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
              <Image
                source={require("../../assets/images/ui/settings.png")}
                style={{ width: settingsW, height: settingsH }}
                contentFit="contain"
                transition={0}
              />
            </Pressable>
          </View>
        </View>

        {/* Question Hanging Signboard (sign.png) */}
        <Animated.View
          entering={FadeInDown.duration(600)}
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
            source={require("../../assets/images/antas5/question1/sign.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Choice A (Top-Left) */}
        <Animated.View
          entering={FadeIn.duration(600).delay(100)}
          style={[
            {
              position: "absolute",
              top: row1Top + (choiceH - choiceAH) / 2,
              left: col1Left,
              width: choiceW,
              height: choiceAH,
              zIndex: 25,
            },
            (selectedChoice === "A" || (selectedChoice !== null && selectedChoice !== "B")) && animatedPulseStyle,
          ]}
        >
          <Pressable
            onPress={() => handleSelectChoice("A")}
            disabled={selectedChoice !== null}
            style={[
              {
                width: "100%",
                height: "100%",
                borderRadius: 14 * bgScale,
                overflow: "hidden",
              },
              getChoiceFeedbackStyle("A"),
            ]}
            className="active:scale-[0.98] active:opacity-90"
          >
            <Image
              source={require("../../assets/images/antas5/question1/A.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={0}
            />
          </Pressable>
        </Animated.View>

        {/* Choice B (Bottom-Left) — CORRECT */}
        <Animated.View
          entering={FadeIn.duration(600).delay(200)}
          style={[
            {
              position: "absolute",
              top: row2Top,
              left: col1Left,
              width: choiceW,
              height: choiceH,
              zIndex: 25,
            },
            selectedChoice !== null && animatedPulseStyle,
          ]}
        >
          <Pressable
            onPress={() => handleSelectChoice("B")}
            disabled={selectedChoice !== null}
            style={[
              {
                width: "100%",
                height: "100%",
                borderRadius: 14 * bgScale,
                overflow: "hidden",
              },
              getChoiceFeedbackStyle("B"),
            ]}
            className="active:scale-[0.98] active:opacity-90"
          >
            <Image
              source={require("../../assets/images/antas5/question1/B.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={0}
            />
          </Pressable>
        </Animated.View>

        {/* Choice C (Top-Right) */}
        <Animated.View
          entering={FadeIn.duration(600).delay(150)}
          style={[
            {
              position: "absolute",
              top: row1Top,
              left: col2Left,
              width: choiceW,
              height: choiceH,
              zIndex: 25,
            },
            selectedChoice === "C" && animatedPulseStyle,
          ]}
        >
          <Pressable
            onPress={() => handleSelectChoice("C")}
            disabled={selectedChoice !== null}
            style={[
              {
                width: "100%",
                height: "100%",
                borderRadius: 14 * bgScale,
                overflow: "hidden",
              },
              getChoiceFeedbackStyle("C"),
            ]}
            className="active:scale-[0.98] active:opacity-90"
          >
            <Image
              source={require("../../assets/images/antas5/question1/C.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={0}
            />
          </Pressable>
        </Animated.View>

        {/* Choice D (Bottom-Right) */}
        <Animated.View
          entering={FadeIn.duration(600).delay(250)}
          style={[
            {
              position: "absolute",
              top: row2Top,
              left: col2Left,
              width: choiceW,
              height: choiceH,
              zIndex: 25,
            },
            selectedChoice === "D" && animatedPulseStyle,
          ]}
        >
          <Pressable
            onPress={() => handleSelectChoice("D")}
            disabled={selectedChoice !== null}
            style={[
              {
                width: "100%",
                height: "100%",
                borderRadius: 14 * bgScale,
                overflow: "hidden",
              },
              getChoiceFeedbackStyle("D"),
            ]}
            className="active:scale-[0.98] active:opacity-90"
          >
            <Image
              source={require("../../assets/images/antas5/question1/D.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={0}
            />
          </Pressable>
        </Animated.View>

        {/* Next button — positioned at bottom right */}
        <Animated.View
          entering={FadeIn.duration(700).delay(300)}
          style={{
            position: "absolute",
            bottom: nextBottom,
            right: nextRight,
            width: nextW,
            height: nextH,
            zIndex: 35,
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
      </SafeAreaView>
    </View>
  );
}

