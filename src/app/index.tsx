import { ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/images/title/1.jpg")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 bg-black/50">
          <SafeAreaView className="flex-1 justify-between px-6 py-10">
            <Animated.View
              entering={FadeIn.duration(600)}
              className="items-center gap-4"
            >
              <Animated.Image
                source={require("../../assets/images/icon.png")}
                entering={FadeIn.delay(100).duration(500)}
                className="h-24 w-24 rounded-3xl"
              />
              <Animated.View
                entering={FadeInDown.delay(200).duration(500)}
                className="items-center gap-1"
              >
                <Text className="text-4xl font-bold text-white">Tuklas</Text>
                <Text className="text-lg text-white/70">sa Pagbasa</Text>
              </Animated.View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).duration(500)}
              className="gap-4"
            >
              <Pressable
                onPress={() => router.navigate("/audio")}
                className="items-center rounded-2xl bg-sky-500 py-4"
              >
                <Text className="text-lg font-semibold text-white">
                  Start Exploring
                </Text>
              </Pressable>
              <Text className="text-center text-sm text-white/50">
                discover something new
              </Text>
            </Animated.View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}
