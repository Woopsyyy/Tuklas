import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeInUp, FadeInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

export default function Antas5Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const narration = useAudioPlayer(require("../../assets/audio/antas5.mp3"));

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.min(screenW / DESIGN_W, screenH / DESIGN_H);
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

  // Title (text1.png) — "ANTAS 5 / AKLATAN NG KARUNUNGAN"
  // Source is 1456x559 approx — position top-center
  const titleW = 900 * bgScale * 1.5 * 1.4 * 1.4;
  const titleH = 220 * bgScale * 1.5 * 1.4 * 1.4;
  const titleLeft = (screenW - titleW) / 2;
  const titleTop = (bgOffsetY + 10 * bgScale - 0.05 * screenH - 0.10 * screenH + 0.40 * screenH - 0.05 * screenH - 0.10 * screenH + 0.03 * screenH) * 0.6 * 0.9 * 0.9 * 0.6;

  // NPC (npc.png) — girl on the left side
  // Source PNG is wide (1456x816) but character occupies right half
  // We show a tall portrait on the left
  const npcH = screenH * 0.80 * 1.5;
  const npcW = npcH * (1456 / 816);
  const npcLeft = bgOffsetX - npcW * 0.30;   // shift left so character visible in left area
  const npcTop = screenH - npcH + 10 * bgScale + 0.25 * screenH;

  // Dialogue card (text2.png) — center, below title
  // Source 1456x665 approx
  const cardW = screenW * 0.52 * 1.3;
  const cardH = cardW * (665 / 1456);
  const cardLeft = (screenW - cardW) / 2 + screenW * 0.03;
  const cardTop = bgOffsetY + 155 * bgScale + 0.50 * screenH - 0.20 * screenH;

  // Button (button.png) — "Basahin ang Kuwento", centered at bottom
  // Source 1296x230 approx
  const buttonW = 420 * bgScale * 1.4 * 1.5 * 1.3;
  const buttonH = buttonW * (230 / 1296);
  const buttonLeft = (screenW - buttonW) / 2 + screenW * 0.03;
  const buttonTop = bgOffsetY + 830 * bgScale;

  // Book (book.png) — bottom-right corner decoration
  const bookH = screenH * 0.32;
  const bookW = bookH * (1456 / 816);
  const bookLeft = screenW - bookW * 0.75 - 0.05 * screenW;
  const bookTop = screenH - bookH - 5 * bgScale + 0.10 * screenH + 0.05 * screenH;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          narration.pause();
          narration.seekTo(0);
        } catch (e) {}
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
      console.warn("Antas5 narration play error:", e);
    }
  };

  const handleStart = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate("/antas5-slide1");
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden={true} />

      {/* Full-screen Background */}
      <Image
        source={require("../../assets/images/antas5/background.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        contentFit="cover"
        transition={0}
      />

      {/* Book — bottom-right decoration, behind NPC layer but above bg */}
      <Animated.View
        entering={FadeIn.duration(700).delay(300)}
        style={{
          position: "absolute",
          left: bookLeft,
          top: bookTop,
          width: bookW,
          height: bookH,
          zIndex: 5,
        }}
        pointerEvents="none"
      >
        <Image
          source={require("../../assets/images/antas5/book.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          transition={0}
        />
      </Animated.View>

      {/* NPC — girl on the left */}
      <Animated.View
        entering={FadeInLeft.duration(600)}
        style={{
          position: "absolute",
          left: npcLeft,
          top: npcTop,
          width: npcW,
          height: npcH,
          zIndex: 10,
        }}
        pointerEvents="none"
      >
        <Image
          source={require("../../assets/images/antas5/npc.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          transition={0}
        />
      </Animated.View>

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

        {/* Title — ANTAS 5 / AKLATAN NG KARUNUNGAN */}
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
            source={require("../../assets/images/antas5/text1.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Dialogue card — story text */}
        <Animated.View
          entering={FadeIn.duration(700).delay(100)}
          style={{
            position: "absolute",
            top: cardTop,
            left: cardLeft,
            width: cardW,
            height: cardH,
            zIndex: 15,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas5/text2.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Action Button — "Basahin ang Kuwento" */}
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
            onPress={handleStart}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-90"
          >
            <Image
              source={require("../../assets/images/antas5/button.png")}
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
