import { Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const DISMISS_THRESHOLD = 120;

interface SwipeableCardProps {
  label: string;
  onDismiss: () => void;
}

export function SwipeableCard({ label, onDismiss }: SwipeableCardProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((event) => {
      translateX.value = event.translationX;
    })
    .onFinalize((event) => {
      if (Math.abs(event.translationX) > DISMISS_THRESHOLD) {
        translateX.value = withTiming(
          event.translationX > 0 ? 500 : -500,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(onDismiss)();
            }
          }
        );
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          cardStyle,
          {
            alignSelf: "stretch",
            borderRadius: 24,
            paddingVertical: 32,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text className="text-lg font-semibold">{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}
