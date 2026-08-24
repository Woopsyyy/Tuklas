import { Text, View } from "react-native";

export default function SmokeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-600">
      <Text className="text-3xl font-bold text-white">NativeWind OK</Text>
      <View className="mt-4 h-10 w-40 rounded-full bg-amber-400" />
    </View>
  );
}
