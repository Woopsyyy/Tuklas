import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Pressable, useWindowDimensions, View, Image as RNImage } from "react-native";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsStore } from "@/store/use-settings-store";

interface WordItem {
  id: string;
  source: any;
  aspect: number;
  text: string;
}

const ALL_WORDS: WordItem[] = [
  { id: "word1", source: require("../../assets/images/antas4/question1/word1.png"), aspect: 2.86, text: "nagdala" },
  { id: "word2", source: require("../../assets/images/antas4/question1/word2.png"), aspect: 2.21, text: "dahil" },
  { id: "word3", source: require("../../assets/images/antas4/question1/word3.png"), aspect: 3.44, text: "umuulan" },
  { id: "word4", source: require("../../assets/images/antas4/question1/word4.png"), aspect: 1.47, text: "si" },
  { id: "word5", source: require("../../assets/images/antas4/question1/word5.png"), aspect: 2.86, text: "payong" },
  { id: "word6", source: require("../../assets/images/antas4/question1/word6.png"), aspect: 1.89, text: "ng" },
  { id: "word7", source: require("../../assets/images/antas4/question1/word7.png"), aspect: 1.89, text: "liza" },
];

export default function Antas4Level1Screen() {
  const router = useRouter();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const toggleSound = useSettingsStore((state) => state.toggleSound);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;
  const bgOffsetY = (screenH - DESIGN_H * bgScale) / 2;

  // Header icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase * (917 / 798);
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // Title / Instruction banner (text1.png)
  const text1W = 1450 * bgScale * 7.2;
  const text1H = text1W * (129 / 1790);
  const text1Left = (screenW - text1W) / 2;
  const text1Top = bgOffsetY + 240 * bgScale - 0.1 * screenH - 0.05 * screenH;

  // NPC character (npc.png) — image is full 1920×1080 canvas; character content is at
  // x: 822–1117 (w=296), y: 49–1041 (h=993) in design pixels.
  // We crop it using overflow:hidden + negative image offset so no padding is visible.
  const NPC_CONTENT_X = 822; // leftmost opaque pixel in design px
  const NPC_CONTENT_Y = 49;  // topmost opaque pixel in design px
  const NPC_CONTENT_W = 296; // content width in design px
  const NPC_CONTENT_H = 993; // content height in design px
  const NPC_IMG_W = 1920;    // full image width in design px
  const NPC_IMG_H = 1080;    // full image height in design px

  // Desired on-screen height of the character
  const npcDesiredH = screenH * 0.864;
  // Scale factor: how much we stretch the full image so NPC_CONTENT_H maps to npcDesiredH
  const npcImgScale = npcDesiredH / (NPC_CONTENT_H * bgScale);

  // Rendered (clipped) container size — just the character content area
  const npcClipW = NPC_CONTENT_W * bgScale * npcImgScale;
  const npcClipH = npcDesiredH;

  // Full image rendered size inside the container
  const npcImgRenderedW = NPC_IMG_W * bgScale * npcImgScale;
  const npcImgRenderedH = NPC_IMG_H * bgScale * npcImgScale;

  // Negative offset to push the image so the character content starts at (0,0) in the container
  const npcImgOffsetX = -(NPC_CONTENT_X * bgScale * npcImgScale);
  const npcImgOffsetY = -(NPC_CONTENT_Y * bgScale * npcImgScale);

  // Position the container on the left side, grounded at the bottom
  const npcLeft = bgOffsetX - 10 * bgScale + 0.05 * screenW; // flush left with small margin
  const npcTop = screenH - npcClipH + 10 * bgScale + 0.1 * screenH + 0.05 * screenH;

  // Line (line.png)
  const lineW = 1320 * bgScale * 54;
  const lineH = lineW * (17 / 1308);
  const lineLeft = (screenW - lineW) / 2;
  const lineTop = bgOffsetY + 580 * bgScale - 0.1 * screenH - 0.5 * screenH;

  // Wooden Board (board.png)
  const boardW = 1320 * bgScale * 2.268;
  const boardH = boardW * (413 / 1870);
  const boardLeft = (screenW - boardW) / 2;
  const boardTop = bgOffsetY + 730 * bgScale - 0.05 * screenH - 0.05 * screenH - 0.05 * screenH - 0.1 * screenH;

  // Words inside board
  const wordH = 92 * bgScale;
  const gap = 20 * bgScale;

  // Row 1: word1 (nagdala), word2 (dahil), word3 (umuulan)
  const row1Words = [ALL_WORDS[0], ALL_WORDS[1], ALL_WORDS[2]];
  const row1TotalW = row1Words.reduce((acc, w) => acc + wordH * w.aspect, 0) + (row1Words.length - 1) * gap;
  const row1StartLeft = boardLeft + (boardW - row1TotalW) / 2;
  const row1Top = boardTop + 35 * bgScale;

  // Row 2: word4 (si), word5 (payong), word6 (ng), word7 (liza)
  const row2Words = [ALL_WORDS[3], ALL_WORDS[4], ALL_WORDS[5], ALL_WORDS[6]];
  const row2TotalW = row2Words.reduce((acc, w) => acc + wordH * w.aspect, 0) + (row2Words.length - 1) * gap;
  const row2StartLeft = boardLeft + (boardW - row2TotalW) / 2;
  const row2Top = boardTop + 155 * bgScale;

  // Signpost (right side)
  const signLeft = bgOffsetX + 1680 * bgScale;
  const signW = 210 * bgScale;
  const nextTop = bgOffsetY + 700 * bgScale + 0.03 * screenH + 0.01 * screenH + 0.02 * screenH;
  const nextH = 92 * bgScale;
  const backTop = bgOffsetY + 800 * bgScale + 0.1 * screenH - 0.04 * screenH;
  const backSignH = 92 * bgScale;

  // Pulsing animation
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const checkSentence = (newPlaced: string[]) => {
    // Correct sentence sequences:
    // "nagdala si liza ng payong dahil umuulan"
    // "dahil umuulan nagdala si liza ng payong"
    // "nagdala ng payong si liza dahil umuulan"
    // "dahil umuulan si liza ay nagdala ng payong" (without ay: dahil umuulan si liza nagdala ng payong)
    const validOrders = [
      ["word1", "word4", "word7", "word6", "word5", "word2", "word3"], // Nagdala si Liza ng payong dahil umuulan
      ["word1", "word6", "word5", "word4", "word7", "word2", "word3"], // Nagdala ng payong si Liza dahil umuulan
      ["word2", "word3", "word1", "word4", "word7", "word6", "word5"], // Dahil umuulan nagdala si Liza ng payong
      ["word2", "word3", "word1", "word6", "word5", "word4", "word7"], // Dahil umuulan nagdala ng payong si Liza
      ["word2", "word3", "word4", "word7", "word1", "word6", "word5"], // Dahil umuulan si Liza nagdala ng payong
      ["word4", "word7", "word1", "word6", "word5", "word2", "word3"], // Si Liza nagdala ng payong dahil umuulan
    ];

    if (newPlaced.length === ALL_WORDS.length) {
      const isMatched = validOrders.some(
        (order) => order.every((id, idx) => id === newPlaced[idx])
      );
      if (isMatched) {
        setIsCorrect(true);
        pulseScale.value = withRepeat(
          withSequence(withTiming(1.04, { duration: 300 }), withTiming(1, { duration: 300 })),
          3,
          true
        );
      }
    } else {
      setIsCorrect(false);
    }
  };

  const handleWordClick = (id: string) => {
    if (placedWords.includes(id)) {
      // Remove from line back to board
      const newPlaced = placedWords.filter((wId) => wId !== id);
      setPlacedWords(newPlaced);
      checkSentence(newPlaced);
    } else {
      // Place on line
      const newPlaced = [...placedWords, id];
      setPlacedWords(newPlaced);
      checkSentence(newPlaced);
    }
  };

  const handleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.navigate("/antas4" as any);
  };

  const handleBack = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.back();
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Calculate placed words layout along the sentence line
  const placedWordH = 75 * bgScale;
  const placedGap = 12 * bgScale;
  const placedTotalW = placedWords.reduce((acc, id) => {
    const item = ALL_WORDS.find((w) => w.id === id);
    return acc + (item ? placedWordH * item.aspect : 0);
  }, 0) + Math.max(0, placedWords.length - 1) * placedGap;
  const placedStartLeft = lineLeft + (lineW - placedTotalW) / 2;

  // Helper to compute position for row 1 words on the board
  let currentR1Left = row1StartLeft;
  const r1Positions = row1Words.map((item) => {
    const width = wordH * item.aspect;
    const left = currentR1Left;
    currentR1Left += width + gap;
    return { ...item, width, left, top: row1Top };
  });

  // Helper to compute position for row 2 words on the board
  let currentR2Left = row2StartLeft;
  const r2Positions = row2Words.map((item) => {
    const width = wordH * item.aspect;
    const left = currentR2Left;
    currentR2Left += width + gap;
    return { ...item, width, left, top: row2Top };
  });

  const allBoardPositions = [...r1Positions, ...r2Positions];

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

      {/* Background */}
      <Image
        source={require("../../assets/images/antas4/background.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        contentFit="cover"
        transition={0}
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
            zIndex: 50,
          }}
        >
          <Pressable onPress={handleBack} hitSlop={12} className="active:opacity-70">
            <RNImage
              source={require("../../assets/images/ui/back.png")}
              style={{ width: backW, height: backH }}
              resizeMode="contain"
            />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Pressable onPress={toggleSound} hitSlop={12} className="active:opacity-70">
              <RNImage
                source={require("../../assets/images/ui/sound.png")}
                style={{ width: soundW, height: soundH, opacity: soundEnabled ? 1 : 0.5 }}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <RNImage
                source={require("../../assets/images/ui/settings.png")}
                style={{ width: settingsW, height: settingsH }}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>

        {/* Title: AYUSIN ANG MGA SALITA UPANG MAKABUO NG WASTONG PANGUNGUSAP: */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={{
            position: "absolute",
            top: text1Top,
            left: text1Left,
            width: text1W,
            height: text1H,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas4/question1/text1.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* NPC Character (Left) — overflow:hidden crops the uncropped canvas padding */}
        <Animated.View
          entering={FadeIn.duration(600).delay(100)}
          style={{
            position: "absolute",
            top: npcTop,
            left: npcLeft,
            width: npcClipW,
            height: npcClipH,
            overflow: "hidden",
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas4/question1/npc.png")}
            style={{
              position: "absolute",
              left: npcImgOffsetX,
              top: npcImgOffsetY,
              width: npcImgRenderedW,
              height: npcImgRenderedH,
            }}
            contentFit="fill"
            transition={0}
          />
        </Animated.View>

        {/* Sentence Target Line */}
        <Animated.View
          entering={FadeIn.duration(600).delay(150)}
          style={{
            position: "absolute",
            top: lineTop,
            left: lineLeft,
            width: lineW,
            height: lineH,
            zIndex: 15,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas4/question1/line.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Words placed on the line */}
        {placedWords.length > 0 && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: lineTop - placedWordH * 0.85,
                left: placedStartLeft,
                flexDirection: "row",
                alignItems: "center",
                gap: placedGap,
                zIndex: 35,
              },
              isCorrect && animatedPulseStyle,
            ]}
          >
            {placedWords.map((id) => {
              const item = ALL_WORDS.find((w) => w.id === id);
              if (!item) return null;
              const width = placedWordH * item.aspect;
              return (
                <Pressable
                  key={`placed-${id}`}
                  onPress={() => handleWordClick(id)}
                  style={{
                    width,
                    height: placedWordH,
                  }}
                  className="active:scale-95 active:opacity-80"
                >
                  <Image
                    source={item.source}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                    transition={0}
                  />
                </Pressable>
              );
            })}
          </Animated.View>
        )}

        {/* Wooden Board Container */}
        <Animated.View
          entering={FadeIn.duration(600).delay(200)}
          style={{
            position: "absolute",
            top: boardTop,
            left: boardLeft,
            width: boardW,
            height: boardH,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas4/question1/board.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Word Badges on the Board */}
        {allBoardPositions.map((item) => {
          const isPlaced = placedWords.includes(item.id);
          return (
            <Animated.View
              key={item.id}
              entering={FadeIn.duration(600).delay(250)}
              style={{
                position: "absolute",
                top: item.top,
                left: item.left,
                width: item.width,
                height: wordH,
                zIndex: 30,
              }}
            >
              {/* opacity separated from entering to avoid Reanimated layout-animation conflict */}
              <View style={{ flex: 1, opacity: isPlaced ? 0.25 : 1 }}>
                <Pressable
                  onPress={() => handleWordClick(item.id)}
                  disabled={isPlaced}
                  hitSlop={6}
                  style={{ width: "100%", height: "100%" }}
                  className="active:scale-95 active:opacity-80"
                >
                  <Image
                    source={item.source}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                    transition={0}
                  />
                </Pressable>
              </View>
            </Animated.View>
          );
        })}

        {/* Wooden Signpost Next Button */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            position: "absolute",
            left: signLeft - 0.03 * screenW + 0.02 * screenW,
            top: nextTop,
            width: signW,
            height: nextH,
            zIndex: 35,
          }}
        >
          <Pressable
            onPress={handleNext}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-80"
          >
            <RNImage
              source={require("../../assets/images/ui/next.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>

        {/* Wooden Signpost Back Button */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            position: "absolute",
            left: signLeft - 0.01 * screenW,
            top: backTop,
            width: signW * 0.95,
            height: backSignH * 0.95,
            zIndex: 35,
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            className="w-full h-full active:scale-95 active:opacity-80"
          >
            <RNImage
              source={require("../../assets/images/ui/back-green.png")}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
