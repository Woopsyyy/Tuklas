import { Image } from "expo-image";
import { View, type StyleProp, type ViewStyle } from "react-native";

type Crop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CroppedCanvasImageProps = {
  source: any;
  crop: Crop;
  width: number;
  height: number;
  canvasWidth?: number;
  canvasHeight?: number;
  style?: StyleProp<ViewStyle>;
};

export function CroppedCanvasImage({
  source,
  crop,
  width,
  height,
  canvasWidth = 1920,
  canvasHeight = 1080,
  style,
}: CroppedCanvasImageProps) {
  const scaleX = width / crop.width;
  const scaleY = height / crop.height;

  return (
    <View style={[{ width, height, overflow: "hidden" }, style]} pointerEvents="none">
      <Image
        source={source}
        style={{
          position: "absolute",
          left: -crop.x * scaleX,
          top: -crop.y * scaleY,
          width: canvasWidth * scaleX,
          height: canvasHeight * scaleY,
        }}
        contentFit="fill"
        transition={0}
      />
    </View>
  );
}