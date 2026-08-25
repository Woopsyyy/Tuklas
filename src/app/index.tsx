import { ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/images/title/1.jpg")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 bg-black/50">
          <SafeAreaView className="flex-1 items-center justify-center px-6">
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="gap-4"
            >
              <Pressable
                onPress={() => router.navigate("/audio")}
                className="flex-row items-center justify-center gap-2 rounded-2xl bg-sky-500 px-8 py-4"
              >
                <MaterialIcons name="play-arrow" size={24} color="white" />
                <Text className="text-lg font-semibold text-white">Start</Text>
              </Pressable>
            </Animated.View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}
