import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatDuration } from "@/lib/format-duration";
import { useSettingsStore } from "@/store/use-settings-store";

export default function AudioScreen() {
  const player = useAudioPlayer(require("../../assets/audio/tone.wav"));
  const status = useAudioPlayerStatus(player);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);

  const playing = status.playing;

  const handleTogglePlayback = () => {
    if (!soundEnabled) {
      return;
    }
    if (playing) {
      player.pause();
    } else {
      player.seekTo(0);
      player.play();
    }
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <SafeAreaView className="flex-1 items-center justify-center gap-6 px-6">
        <Text className="text-3xl font-bold text-zinc-50">Sound Check</Text>
        <Text className="text-base text-zinc-400">
          {status.duration
            ? `${formatDuration(status.currentTime)} / ${formatDuration(
                status.duration
              )}`
            : "loading…"}
        </Text>
        <Pressable
          onPress={handleTogglePlayback}
          disabled={!soundEnabled}
          className={`rounded-full px-10 py-4 ${
            soundEnabled ? "bg-sky-500" : "bg-zinc-700"
          }`}
        >
          <Text className="text-lg font-semibold text-white">
            {!soundEnabled ? "Sound disabled" : playing ? "Pause" : "Play tone"}
          </Text>
        </Pressable>
        <Pressable onPress={toggleSound} className="py-2">
          <Text className="text-sm text-zinc-400 underline">
            {soundEnabled ? "Turn sound off" : "Turn sound on"}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
