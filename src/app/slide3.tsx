import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInLeft } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";

export default function Slide3Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const narration = useAudioPlayer(require("../../assets/audio/pumili ng antas.mp3"));

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  // Design canvas reference: 1680 x 945 (16:9)
  const DESIGN_W = 1680;
  const DESIGN_H = 945;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  // Header icons
  const iconBase = Math.max(34, Math.min(48, 50 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Girl NPC Character + Thought Bubble (single merged image: slide3-npc.png: 423x869)
  // Scaled significantly for high prominence and large appearance
  const safeTop = Math.max(insets.top, 6);
  const safeBottom = Math.max(insets.bottom, 6);
  const npcTop = safeTop + 4;
  const npcH = Math.max(screenH - npcTop - safeBottom, 869 * bgScale * 0.98 * 0.9 * 0.9);
  const npcW = npcH * (423 / 869);

  const idealNpcLeft = bgOffsetX + 200 * bgScale + 0.05 * screenW + 0.05 * screenW + 0.05 * screenW;
  const minNpcLeft = Math.max(insets.left + 16, 20);
  const npcLeft = Math.max(minNpcLeft, idealNpcLeft);

  // ANTAS Buttons Panel (5 signboards + connector connecting 1 to 5 only)
  const safePanelTop = Math.max(insets.top + 10, 16);
  const safePanelBottom = Math.max(insets.bottom + 10, 16);
  const availPanelH = screenH - safePanelTop - safePanelBottom;

  // Spacing between each ANTAS sign
  const btnGap = Math.max(6, Math.min(14, 10 * bgScale));

  // Large button sizing to fill the right side comfortably
  const maxBtnH = (availPanelH - btnGap * 4) / 5;
  const targetBtnH = 135 * bgScale;
  const btnH = Math.min(targetBtnH, maxBtnH);

  const totalButtonsH = btnH * 5 + btnGap * 4;
  const panelTop = Math.max(safePanelTop, (screenH - totalButtonsH) / 2);

  // Widest button is ANTAS 4 (aspect 1060 / 301 = 3.52)
  const maxBtnW = btnH * (1060 / 301);
  const panelWidth = maxBtnW + 16;

  const idealPanelLeft = bgOffsetX + 820 * bgScale;
  const minPanelLeft = npcLeft + npcW + 12;
  const maxPanelLeft = screenW - panelWidth - Math.max(insets.right, 16);
  const panelLeft = Math.max(minPanelLeft, Math.min(idealPanelLeft, maxPanelLeft));

  // Wooden connector pole connecting ANTAS 1 down to ANTAS 5 (floating, no bottom extension)
  const poleW = Math.max(22, Math.min(42, 34 * bgScale));

  const antas = [
    { src: require("../../assets/images/slide3/slide3-antas1.png"), aspect: 746 / 212, route: "/antas1" },
    { src: require("../../assets/images/slide3/slide3-antas2.png"), aspect: 872 / 249, route: "/antas2" },
    { src: require("../../assets/images/slide3/slide3-antas3.png"), aspect: 1012 / 289, route: "/antas3" },
    { src: require("../../assets/images/slide3/slide3-antas4.png"), aspect: 1060 / 301, route: "/antas4" },
    { src: require("../../assets/images/slide3/slide3-antas5.png"), aspect: 979 / 279, route: "/antas5" },
  ];

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useFocusEffect(
    useCallback(() => {
      try {
        setAudioModeAsync({ playsInSilentMode: true });
        narration.loop = false;
        narration.volume = 1;
        narration.muted = !soundEnabled;
        narration.seekTo(0);
        narration.play();
      } catch (e) {
        console.warn("Slide3 narration setup error:", e);
      }

      return () => {
        try {
          narration.pause();
          narration.seekTo(0);
        } catch (e) {
          // ignore if already released
        }
      };
    }, [narration, soundEnabled])
  );

  const handleBack = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.back();
  };

  const handleNavigate = (route: string) => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate(route as any);
  };

  const handleReplayNarration = () => {
    try {
      narration.seekTo(0);
      narration.play();
    } catch (e) {
      console.warn("Slide3 narration replay error:", e);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />
      <Image
        source={require("../../assets/images/slide3/slide3-background.png")}
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
            <Image source={require("../../assets/images/ui/back.png")} style={{ width: backW, height: backH }} resizeMode="contain" />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Pressable onPress={handleReplayNarration} hitSlop={12} className="active:opacity-70">
              <Image source={require("../../assets/images/ui/sound.png")} style={{ width: soundW, height: soundH }} resizeMode="contain" />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <Image source={require("../../assets/images/ui/settings.png")} style={{ width: settingsW, height: settingsH }} resizeMode="contain" />
            </Pressable>
          </View>
        </View>

        {/* Girl NPC Character with Thought Bubble (Single Merged Picture) */}
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
            source={require("../../assets/images/slide3/slide3-npc.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Floating ANTAS Button Panel */}
        <Animated.View
          entering={FadeIn.duration(700)}
          style={{
            position: "absolute",
            top: panelTop,
            left: panelLeft,
            width: panelWidth,
            alignItems: "center",
            gap: btnGap,
            zIndex: 20,
          }}
        >
          {/* Vertical Wooden Connector Pole connecting only ANTAS 1 to ANTAS 5 */}
          <Image
            source={require("../../assets/images/slide3/slide3-connector.png")}
            style={{
              position: "absolute",
              top: btnH * 0.15,
              bottom: btnH * 0.15,
              width: poleW,
              alignSelf: "center",
              zIndex: 1,
            }}
            resizeMode="stretch"
          />

          {/* 5 ANTAS Wooden Signboards */}
          {antas.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleNavigate(item.route)}
              hitSlop={8}
              style={{ width: btnH * item.aspect, height: btnH, zIndex: 2 }}
              className="active:scale-95 active:opacity-80"
            >
              <Image source={item.src} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
            </Pressable>
          ))}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}