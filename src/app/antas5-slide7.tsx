import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

export default function Antas5Slide7Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const narration = useAudioPlayer(require("../../assets/audio/end.mp3"));

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

  // Dialogue Speech Bubble (sign.png: 1169 x 381) — top-center, tail pointing left
  const signW = Math.min(screenW * 0.62, 1169 * bgScale * 0.95);
  const signH = signW * (381 / 1169);
  const signLeft = (screenW - signW) / 2 + 0.04 * screenW;
  const signTop = Math.max(insets.top + 8, bgOffsetY + 80 * bgScale + 0.04 * screenH);

  // NPC Explorers (npc.png: 387 x 726) — bottom left
  const npcH = Math.min(screenH * 0.64, 726 * bgScale * 0.85);
  const npcW = npcH * (387 / 726);
  const npcLeft = Math.max(insets.left + 16, bgOffsetX + 50 * bgScale + 0.02 * screenW);
  const npcBottom = Math.max(insets.bottom + 12, 20 * bgScale);

  // Glowing Treasure Chest (chest.png: 406 x 341) — center clearing
  const chestW = Math.min(screenW * 0.24, 406 * bgScale * 1.05);
  const chestH = chestW * (341 / 406);
  const chestLeft = (screenW - chestW) / 2 + 0.03 * screenW;
  const chestTop = signTop + signH + 0.02 * screenH;

  // Action Button (button.png: 780 x 97) — "Buksan ang kaban ng kayamanan"
  const buttonW = Math.min(screenW * 0.40, 780 * bgScale * 0.85);
  const buttonH = buttonW * (97 / 780);
  const buttonLeft = (screenW - buttonW) / 2 + 0.03 * screenW;
  const buttonBottom = Math.max(insets.bottom + 18, 25 * bgScale) - 0.03 * screenH;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Auto-play narration when screen enters
      const playTimer = setTimeout(() => {
        handlePlayNarration();
      }, 300);

      return () => {
        clearTimeout(playTimer);
        try {
          narration.pause();
          narration.seekTo(0);
        } catch (e) {}
      };
    }, [narration, narrationVolume])
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
      console.warn("Antas5Slide7 narration play error:", e);
    }
  };

  const handleOpenChest = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    // Returns to Antas selection screen
    router.navigate("/antas5");
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
      <StatusBar style="light" hidden={false} />

      {/* Full-screen Background */}
      <Image
        source={require("../../assets/images/antas5/slide7/background.png")}
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

        {/* Speech Bubble (sign.png) */}
        <Animated.View
          entering={FadeInDown.duration(700)}
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
            source={require("../../assets/images/antas5/slide7/sign.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* NPC Explorers (npc.png) — left side */}
        <Animated.View
          entering={FadeInLeft.duration(700).delay(150)}
          style={{
            position: "absolute",
            bottom: npcBottom,
            left: npcLeft,
            width: npcW,
            height: npcH,
            zIndex: 22,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas5/slide7/npc.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Glowing Treasure Chest (chest.png) — center clearing */}
        <Animated.View
          entering={FadeIn.duration(800).delay(250)}
          style={{
            position: "absolute",
            top: chestTop,
            left: chestLeft,
            width: chestW,
            height: chestH,
            zIndex: 21,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas5/slide7/chest.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Action Button (button.png) — "Buksan ang kaban ng kayamanan" */}
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
            onPress={handleOpenChest}
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
      </SafeAreaView>
    </View>
  );
}
