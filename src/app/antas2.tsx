import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";
import { CroppedCanvasImage } from "@/components/cropped-canvas-image";

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

  const bgScale = Math.min(screenW / DESIGN_W, screenH / DESIGN_H);
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

  const titleCrop = { x: 82, y: 328, width: 1789, height: 369 };
  const storyCrop = { x: 28, y: 262, width: 1863, height: 419 };
  const buttonCrop = { x: 210, y: 336, width: 1601, height: 275 };
  const npcCrop = { x: 872, y: 68, width: 285, height: 973 };

  // NPC: keep the visible character inside the left side on narrow phones.
  const npcH = Math.min(screenH * 0.88, 900 * bgScale);
  const npcW = npcH * (npcCrop.width / npcCrop.height);
  const npcLeft = Math.max(insets.left + 8, bgOffsetX + 44 * bgScale);
  const npcTop = screenH - Math.max(insets.bottom, 0) - npcH * 0.97;

  // Title, story, and button are cropped from padded 1920x1080 artwork.
  const titleW = Math.min(screenW * 0.62, 1080 * bgScale);
  const titleH = titleW * (titleCrop.height / titleCrop.width);
  const titleLeft = (screenW - titleW) / 2 + screenW * 0.05;
  const titleTop = Math.max(insets.top + 4, bgOffsetY + 36 * bgScale);

const text2W = Math.min(screenW * 0.66, 1120 * bgScale) * 1.5;
  const text2H = text2W * (storyCrop.height / storyCrop.width);
  const text2Left = (screenW - text2W) / 2 + screenW * 0.05;
  const text2Top = Math.max(titleTop + titleH + Math.max(8, 16 * bgScale), screenH * 0.35);

  const buttonW = Math.min(screenW * 0.32, Math.max(220, 560 * bgScale));
  const buttonH = buttonW * (buttonCrop.height / buttonCrop.width);
  const buttonLeft = (screenW - buttonW) / 2 + screenW * 0.05;
const buttonTop = bgOffsetY + 855 * bgScale;

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
      <StatusBar hidden={true} />

      {/* Full-screen Background (assets/images/antas2/background.png) — zoomed in by 5% */}
      <Image
        source={require("../../assets/images/antas2/background.png")}
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
          <CroppedCanvasImage
            source={require("../../assets/images/antas2/text1.png")}
            crop={titleCrop}
            width={titleW}
            height={titleH}
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
          <CroppedCanvasImage
            source={require("../../assets/images/antas2/npc.png")}
            crop={npcCrop}
            width={npcW}
            height={npcH}
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
          <CroppedCanvasImage
            source={require("../../assets/images/antas2/text2.png")}
            crop={storyCrop}
            width={text2W}
            height={text2H}
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
            <CroppedCanvasImage
              source={require("../../assets/images/antas2/buttons.png")}
              crop={buttonCrop}
              width={buttonW}
              height={buttonH}
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

