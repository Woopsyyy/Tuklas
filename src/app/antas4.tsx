import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

export default function Antas4Screen() {
  const router = useRouter();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narration = useAudioPlayer(require("../../assets/audio/antas4 intro.mp3"));

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  // Header icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Title: "ANTAS 4" & "KASTILYO NG MGA SALITA" (text1.png) â€” increased by 50% more
  const titleW = 750 * 1.5 * 1.5 * bgScale;
  const titleH = 220 * 1.5 * 1.5 * bgScale;
  const titleLeft = (screenW - titleW) / 2;
  const titleTop = Math.max(insets.top - 20, bgOffsetY - 10 * bgScale) - 0.05 * screenH;

  // Dialogue Box: Story card in the center (text2.png) â€” moved down by 5%
  const text2W = 1280 * 1.5 * 1.2 * 1.2 * bgScale;
  const text2H = 340 * 1.5 * 1.2 * 1.2 * bgScale;
  const text2Left = (screenW - text2W) / 2;
  const text2Top = bgOffsetY + 270 * bgScale + 0.05 * screenH;

  // Action Button: "Ayusin ang mga Salita" (button.png)
  const buttonW = 420 * 2 * 1.5 * bgScale;
  const buttonH = 80 * 2 * 1.5 * bgScale;
  const buttonLeft = (screenW - buttonW) / 2;
  const buttonTop = bgOffsetY + 820 * bgScale;

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

  const handlePlayNarration = async () => {
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      narration.loop = false;
      narration.volume = Number.isFinite(narrationVolume) && narrationVolume > 0 ? narrationVolume : 1.0;
      narration.muted = false;
      narration.seekTo(0);
      narration.play();
    } catch (e) {
      console.warn("Antas4 narration play error:", e);
    }
  };

  const handleStartMission = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    // Navigate to antas4-level1 if exists, or fallback safely
    router.navigate("/antas4-level1" as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

      {/* Background */}
      <Image
        source={require("../../assets/images/antas4/background.png")}
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

        {/* Title: ANTAS 4 - KASTILYO NG MGA SALITA (text1.png) */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={{
            position: "absolute",
            top: titleTop,
            left: titleLeft,
            width: titleW,
            height: titleH,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas4/text1.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Dialogue Box: Story Description (text2.png) */}
        <Animated.View
          entering={FadeIn.duration(700)}
          style={{
            position: "absolute",
            top: text2Top,
            left: text2Left,
            width: text2W,
            height: text2H,
            zIndex: 15,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas4/text2.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Action Button: "Ayusin ang mga Salita" (button.png) */}
        <Animated.View
          entering={FadeIn.duration(700).delay(200)}
          style={{
            position: "absolute",
            top: buttonTop,
            left: buttonLeft,
            width: buttonW,
            height: buttonH,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleStartMission}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-90"
          >
            <Image
              source={require("../../assets/images/antas4/button.png")}
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


