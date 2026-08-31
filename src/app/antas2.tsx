import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

export default function Antas2Screen() {
  const router = useRouter();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narration = useAudioPlayer(require("../../assets/audio/antas2.mp3"));

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  // Design canvas: 1920 x 1080 (16:9)
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  // Top header icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // NPC: Girl Explorer on the left (moved left by 7%, up by 4%)
  const npcW = 420 * 3.24 * bgScale;
  const npcH = 840 * 3.24 * bgScale;
  const npcLeft = bgOffsetX - 230 * bgScale - 0.07 * screenW;
  const npcTop = screenH - Math.max(insets.bottom, 0) - npcH * 0.95 + 0.4 * npcH - 0.04 * screenH;

  // Header Title Text (text1.png) — "ANTAS 2 / TULAY NG PANGUNGUSAP" (moved right by 5%)
  const titleW = 900 * 2.2 * bgScale;
  const titleH = 200 * 2.2 * bgScale;
  const titleLeft = bgOffsetX + (DESIGN_W - 900 * 2.2) / 2 * bgScale + 0.05 * screenW;
  const titleTop = Math.max(insets.top - 20, bgOffsetY - 10 * bgScale) - 0.05 * screenH;

  // Dialogue / Story text box (text2.png) — (increased by 120%)
  const text2W = 1200 * 2.2 * bgScale;
  const text2H = 310 * 2.2 * bgScale;
  const text2Left = bgOffsetX + (DESIGN_W - 1200 * 2.2) / 2 * bgScale + 120 * bgScale - 0.05 * screenW + 0.02 * screenW;
  const text2Top = bgOffsetY + 450 * bgScale;

  // Action Button (buttons.png) — "Tawirin ang Tulay" (increased by 20%)
  const buttonW = 460 * 1.375 * 1.3 * 1.2 * bgScale;
  const buttonH = 100 * 1.375 * 1.3 * 1.2 * bgScale;
  const buttonLeft = bgOffsetX + (DESIGN_W - 460 * 1.375 * 1.3 * 1.2) / 2 * bgScale - 30 * bgScale + 0.08 * screenW - 0.03 * screenW;
  const buttonTop = bgOffsetY + 870 * bgScale - 0.02 * screenH;

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
      console.warn("Antas2 narration play error:", e);
    }
  };

  const handleStartMission = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate("/antas2-level1" as any);
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

      {/* Full-screen Background (assets/images/antas2/background.png) — zoomed in by 5% */}
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

        {/* Title Image (text1.png) */}
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
            source={require("../../assets/images/antas2/text1.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Girl NPC (npc.png) */}
        <Animated.View
          entering={FadeInLeft.duration(600)}
          style={{
            position: "absolute",
            top: npcTop,
            left: npcLeft,
            width: npcW,
            height: npcH,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas2/npc.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Story Dialogue Box (text2.png) */}
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
            source={require("../../assets/images/antas2/text2.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* "Tawirin ang Tulay" Action Button (buttons.png) */}
        <Animated.View
          entering={FadeIn.duration(700).delay(200)}
          style={{
            position: "absolute",
            top: buttonTop,
            left: buttonLeft,
            width: buttonW * 1.1,
            height: buttonH * 1.1,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={handleStartMission}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-90"
          >
            <Image
              source={require("../../assets/images/antas2/buttons.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

