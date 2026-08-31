import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  // Settings icon size (top-right)
  const settingsSize = Math.max(34, Math.min(44, screenH * 0.095));

  // START button sizing (matches reference image: ~8.8% height, 2.53 aspect ratio)
  const startBtnH = Math.max(34, Math.min(48, screenH * 0.088));
  const startBtnW = startBtnH * (1709 / 675);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden={true} />

      {/* Full-screen Background */}
      <Image
        source={require("../../assets/images/slide1/slide1.png")}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />

      <View className="flex-1">
        {/* Settings button — top right only */}
        <View
          style={{
            position: "absolute",
            top: Math.max(insets.top, 10),
            right: Math.max(insets.right, 14),
            zIndex: 30,
          }}
        >
          <Pressable
            onPress={() => router.navigate("/settings")}
            hitSlop={12}
            className="active:opacity-70"
          >
            <Image
              source={require("../../assets/images/ui/settings.png")}
              style={{ width: settingsSize, height: settingsSize }}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* START button — positioned directly in the dark bush area */}
        <View
          style={{
            position: "absolute",
            bottom: Math.max(insets.bottom + 12, screenH * 0.06),
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 20,
          }}
        >
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Pressable
              onPress={() => router.navigate("/slide2")}
              hitSlop={12}
              className="active:scale-95"
            >
              <Image
                source={require("../../assets/images/ui/start.png")}
                style={{ width: startBtnW, height: startBtnH }}
                resizeMode="contain"
              />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
