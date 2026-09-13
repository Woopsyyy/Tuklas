import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";
import { playNarration } from "@/lib/narration";
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

  const bgScale = Math.min(screenW / DESIGN_W, screenH / DESIGN_H);
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

  // Boy NPC: placed on the left side of the fitted 16:9 play area.
  const npcH = Math.min(screenH * 0.74, 745 * bgScale) * 1.5;
  const npcW = npcH * (250 / 745);
  const npcLeft = Math.max(insets.left + 12, bgOffsetX + 80 * bgScale) + npcW * 0.5;
  const npcTop = (screenH - Math.max(insets.bottom, 8) - npcH * 0.94) * 2.86 + screenH * 0.10;

  const safeTop = Math.max(insets.top, 10);
  const safeBottom = Math.max(insets.bottom, 10);
  const contentTop = Math.max(safeTop + iconBase + 8, bgOffsetY + 170 * bgScale);
  const contentBottom = screenH - safeBottom - 8;
  const contentGap = Math.max(8, 18 * bgScale);

  const actionBtnW = Math.min(screenW * 0.34, Math.max(220, 360 * bgScale));
  const actionBtnH = actionBtnW * (239 / 1392);

  const maxScrollH = Math.max(120, contentBottom - contentTop - contentGap - actionBtnH);
  const scrollH = Math.min(825 * bgScale, screenH * 0.6, maxScrollH) * 1.1;
  const scrollW = Math.min(scrollH * (885 / 825), screenW * 0.56);
  const scrollTop = contentTop * 0.44;
  const scrollLeft = (screenW - scrollW) / 2 + screenW * 0.04;

  const actionBtnLeft = (screenW - actionBtnW) / 2 + screenW * 0.04;
  const actionBtnTop = Math.min(contentBottom - actionBtnH, scrollTop + scrollH + contentGap) * 1.1;

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

  const handlePlayNarration = () => {
    playNarration(narration, narrationVolume);
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
