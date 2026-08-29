import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Antas5Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

      {/* Background — reuse antas1 background until individual backgrounds are added */}
      <Image
        source={require("../../assets/images/antas1/antas1-background.png")}
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
          <Pressable onPress={() => router.back()} hitSlop={12} className="active:opacity-70">
            <Image source={require("../../assets/images/ui/back.png")} style={{ width: backW, height: backH }} resizeMode="contain" />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <Image source={require("../../assets/images/ui/settings.png")} style={{ width: settingsW, height: settingsH }} resizeMode="contain" />
            </Pressable>
          </View>
        </View>

        {/* Coming Soon Placeholder */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "System",
              fontSize: 48 * bgScale,
              fontWeight: "900",
              color: "#fff",
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 8,
              letterSpacing: 2,
            }}
          >
            ANTAS 5
          </Text>
          <Text
            style={{
              fontFamily: "System",
              fontSize: 20 * bgScale,
              color: "#ffe066",
              marginTop: 12,
              textShadowColor: "rgba(0,0,0,0.6)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 4,
            }}
          >
            Paparating na...
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
