import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeInLeft, FadeInRight } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Slide2Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  // Design reference: 1680 x 945 (16:9)
  const DESIGN_W = 1680;
  const DESIGN_H = 945;

  // Background transform matching resizeMode="cover"
  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  // Top icon sizes
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Girl NPC (exact 1680x945 design: left = 246, top = 200, w = 354, h = 723)
  const npcW = 354 * bgScale;
  const npcH = 723 * bgScale;
  const npcLeft = bgOffsetX + 246 * bgScale;
  const npcTop = bgOffsetY + 200 * bgScale;

  // Story Scroll (exact 1680x945 design: left = 555, top = 130, w = 843, h = 591)
  const scrollW = 843 * bgScale * 0.95;
  const scrollH = 591 * bgScale * 0.95;
  const scrollLeft = bgOffsetX + 555 * bgScale;
  const scrollTop = bgOffsetY + 130 * bgScale + 0.05 * screenH + 0.1 * screenH;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

      {/* Full-screen Background */}
      <Image
        source={require("../../assets/images/slide3/slide3-background.png")}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom", "left", "right"]}>
        {/* Full-screen tap to proceed */}
        <Pressable onPress={() => router.navigate("/slide3")} className="flex-1" />

        {/* Top Header Bar */}
        <View
          style={{
            position: "absolute",
            top: Math.max(insets.top, 14),
            left: Math.max(insets.left, 18),
            right: Math.max(insets.right, 18),
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 30,
          }}
        >
          {/* Back button — top left */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="active:opacity-70"
          >
            <Image
              source={require("../../assets/images/ui/back.png")}
              style={{ width: backW, height: backH }}
              resizeMode="contain"
            />
          </Pressable>

          {/* Action buttons — top right */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Pressable
              onPress={() => router.navigate("/settings")}
              hitSlop={12}
              className="active:opacity-70"
            >
              <Image
                source={require("../../assets/images/ui/settings.png")}
                style={{ width: settingsW, height: settingsH }}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>

        {/* Girl NPC Character — left side */}
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
            source={require("../../assets/images/slide2/slide2-npc.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Story Scroll — center/right side */}
        <Animated.View
          entering={FadeInRight.duration(700)}
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
            source={require("../../assets/images/slide2/slide2-text.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
