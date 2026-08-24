import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View, useColorScheme } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { SwipeableCard } from "@/components/swipeable-card";
import { ThemePreference, useSettingsStore } from "@/store/use-settings-store";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function useIsDark() {
  const scheme = useColorScheme();
  const preference = useSettingsStore((state) => state.theme);
  if (preference === "system") {
    return scheme === "dark";
  }
  return preference === "dark";
}

export default function HomeScreen() {
  const router = useRouter();
  const isDark = useIsDark();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  const surface = isDark ? "bg-zinc-950" : "bg-white";
  const surfaceAlt = isDark ? "bg-zinc-900" : "bg-zinc-100";
  const primaryText = isDark ? "text-zinc-50" : "text-zinc-900";
  const secondaryText = isDark ? "text-zinc-400" : "text-zinc-500";

  return (
    <View className={`flex-1 ${surface}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1 gap-8 px-6 pt-8">
        <Animated.View entering={FadeInDown.duration(500)} className="gap-1">
          <Text className={`text-4xl font-bold ${primaryText}`}>Tuklas</Text>
          <Text className={`text-base ${secondaryText}`}>
            discover something new
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          className="gap-3"
        >
          <Text className={`text-sm font-semibold uppercase ${secondaryText}`}>
            Theme
          </Text>
          <View className={`flex-row rounded-2xl p-1 ${surfaceAlt}`}>
            {THEME_OPTIONS.map((option) => {
              const active = theme === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setTheme(option.value)}
                  className={`flex-1 items-center rounded-xl py-2 ${
                    active ? "bg-sky-500" : ""
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      active ? "text-white" : secondaryText
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="gap-3"
        >
          <Text className={`text-sm font-semibold uppercase ${secondaryText}`}>
            Sound
          </Text>
          <Pressable
            onPress={toggleSound}
            className={`flex-row items-center justify-between rounded-2xl px-4 py-4 ${surfaceAlt}`}
          >
            <Text className={`text-base font-medium ${primaryText}`}>
              Sound effects
            </Text>
            <View
              className={`h-7 w-12 items-center rounded-full px-1 ${
                soundEnabled
                  ? "justify-end bg-emerald-500"
                  : "justify-start bg-zinc-400"
              }`}
            >
              <View className="h-5 w-5 rounded-full bg-white" />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SwipeableCard
            label="Swipe me to dismiss"
            onDismiss={() => router.navigate("/audio")}
          />
          <Text className={`mt-2 text-center text-xs ${secondaryText}`}>
            swiping the card opens the audio demo
          </Text>
        </Animated.View>

        <Pressable
          onPress={() => router.navigate("/audio")}
          className="items-center rounded-2xl bg-sky-500 py-4"
        >
          <Text className="text-base font-semibold text-white">
            Open Audio Demo
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
