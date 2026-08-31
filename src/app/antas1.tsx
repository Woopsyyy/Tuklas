import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

export default function Antas1Screen() {
  const router = useRouter();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narration = useAudioPlayer(require("../../assets/audio/antas1 intro.mp3"));

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  // Design canvas: 1920 x 1080 (same as antas1-background.png)
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  // Top icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Boy NPC: 250x745 — placed on ground at bottom-left
  const npcW = 250 * bgScale;
  const npcH = 745 * bgScale;
  const npcLeft = Math.max(insets.left + 16, bgOffsetX + 60 * bgScale) + 0.5 * screenW - 0.3 * screenW - 0.1 * screenW;
  const npcTop = screenH - Math.max(insets.bottom, 8) - npcH * 0.94 + 0.05 * screenH + 0.1 * screenH;

  // Parchment Scroll (885x825) & Button (1392x239)
  const safeTop = Math.max(insets.top, 10);
  const safeBottom = Math.max(insets.bottom, 10);
  const availH = screenH - safeTop - safeBottom;

  // Scale scroll proportionally to fit with title above and button below
  const scrollScale = Math.min(bgScale, (availH * 0.76) / 825);
  const scrollW = 885 * scrollScale * 1.5;
  const scrollH = 825 * scrollScale * 1.5 * 0.95;

  // Position parchment right below the title "GUBAT NG MGA SALITA"
  const scrollTop = Math.max(bgOffsetY + 185 * bgScale, safeTop + 8);
  const scrollLeft = bgOffsetX + (DESIGN_W / 2 - scrollW / 2) * bgScale - 0.1 * screenW;

  // "Simulan ang Misyon" Button — enlarged and placed prominently below parchment
  const actionBtnW = Math.min(500 * bgScale, 460) * 0.5 * 1.2;
  const actionBtnH = actionBtnW * (239 / 1392);
  const actionBtnLeft = bgOffsetX + (DESIGN_W / 2 - actionBtnW / 2) * bgScale - 0.05 * screenW;
  const actionBtnTop = Math.min(
    screenH - safeBottom - actionBtnH - 6,
    scrollTop + scrollH + 16 * bgScale
  ) + 0.5 * screenH - 0.3 * screenH;

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
      try {
        narration.seekTo(0);
      } catch (_) {}
      narration.play();
    } catch (e) {
      console.warn("Antas1 narration play error:", e);
    }
  };

  const handleStartMission = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate("/antas1-level1");
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden={true} />

      {/* Full-screen Background */}
      <Image
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
          <Pressable onPress={() => router.back()} hitSlop={12} className="active:opacity-70">
            <Image source={require("../../assets/images/ui/back.png")} style={{ width: backW, height: backH }} resizeMode="contain" />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0.03 * screenW }}>
            <Pressable onPress={handlePlayNarration} hitSlop={12} className="active:opacity-70">
              <Image
                source={require("../../assets/images/ui/sound.png")}
                style={{ width: soundW, height: soundH }}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <Image source={require("../../assets/images/ui/settings.png")} style={{ width: settingsW, height: settingsH }} resizeMode="contain" />
            </Pressable>
          </View>
        </View>

        {/* Boy NPC Character — pinned bottom-left on ground */}
        <Animated.View
          entering={FadeInLeft.duration(600)}
          style={{
            position: "absolute",
            top: npcTop,
            left: npcLeft,
            width: npcW,
            height: npcH,
            zIndex: 15,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas1/antas1-npc.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Parchment Story Scroll — centered */}
        <Animated.View
          entering={FadeIn.duration(700)}
          style={{
            position: "absolute",
            top: scrollTop,
            left: scrollLeft,
            width: scrollW,
            height: scrollH,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas1/antas1-text.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* "Simulan ang Misyon" Button — placed directly below the story text */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(600)}
          style={{
            position: "absolute",
            top: actionBtnTop,
            left: actionBtnLeft,
            width: actionBtnW,
            height: actionBtnH,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleStartMission}
            hitSlop={10}
            className="w-full h-full active:scale-95 active:opacity-85"
          >
            <Image
              source={require("../../assets/images/antas1/antas1-button.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}