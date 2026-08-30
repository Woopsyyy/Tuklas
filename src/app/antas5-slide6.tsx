import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsStore } from "@/store/use-settings-store";

export default function Antas5Slide6Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;

  // Header icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase;
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Next button (antas5-next.png) — same as slide1
  const nextW = 420 * bgScale * 0.8;
  const nextH = nextW * (56 / 128);
  const nextLeft = (screenW - nextW) / 2 + 0.50 * screenW - 0.10 * screenW - 0.05 * screenW;
  const nextTop = (screenH + 700 * bgScale * (56 / 128)) / 2 + 60 * bgScale + 0.20 * screenH - 0.05 * screenH;

  // Text1 (text1.png) — centered in the middle at 80% size
  // Source 1544x607
  const text1W = 700 * bgScale * 1.3 * 1.5 * 0.8;
  const text1H = text1W * (607 / 1544);
  const text1Left = (screenW - text1W) / 2;
  const text1Top = (screenH - text1H) / 2;

  // NPC (npc.png) — girl on the left side at 50% size
  // Source 330x1033
  const npcH = screenH * 0.80 * 1.5 * 0.5 * 1.5 * 1.4;
  const npcW = npcH * (330 / 1033);
  const npcLeft = bgOffsetX - npcW * 0.30;
  const npcTop = (screenH - npcH) / 2;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

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
          <Pressable onPress={() => router.back()} hitSlop={12} className="active:opacity-70">
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

        {/* NPC — girl on the left side */}
        <Animated.View
          entering={FadeIn.duration(700)}
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
            source={require("../../assets/images/antas5/slide6/npc.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Text1 — centered in the middle */}
        <Animated.View
          entering={FadeIn.duration(700).delay(100)}
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
            source={require("../../assets/images/antas5/slide6/text1.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Next button — final slide, returns to antas5 */}
        <Animated.View
          entering={FadeIn.duration(700)}
          style={{
            position: "absolute",
            top: nextTop,
            left: nextLeft,
            width: nextW,
            height: nextH,
            zIndex: 25,
          }}
        >
          <Pressable
            onPress={() => router.navigate("/antas5")}
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
