import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioPlayer, type AudioStatus } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";
import { useScoreStore } from "@/store/use-score-store";
import { pauseNarration, playNarration } from "@/lib/narration";

// Initialize audio session at module load time so the Android MediaSession is
// ready before any AudioPlayer instance is constructed (prevents NullPointerException).
interface WordItem {
  id: string;
  source: any;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  aspect: number;
  text: string;
}

const ALL_WORDS: WordItem[] = [
  {
    id: "word1",
    source: require("../../assets/images/antas4/question2/word1.png"),
    cropX: 602,
    cropY: 183,
    cropW: 661,
    cropH: 624,
    aspect: 661 / 624,
    text: "sa",
  },
  {
    id: "word2",
    source: require("../../assets/images/antas4/question2/word2.png"),
    cropX: 588,
    cropY: 190,
    cropW: 736,
    cropH: 700,
    aspect: 736 / 700,
    text: "si",
  },
  {
    id: "word3",
    source: require("../../assets/images/antas4/question2/word3.png"),
    cropX: 311,
    cropY: 302,
    cropW: 1361,
    cropH: 476,
    aspect: 1361 / 476,
    text: "dahil",
  },
  {
    id: "word4",
    source: require("../../assets/images/antas4/question2/word4.png"),
    cropX: 159,
    cropY: 193,
    cropW: 1602,
    cropH: 727,
    aspect: 1602 / 727,
    text: "maaga",
  },
  {
    id: "word5",
    source: require("../../assets/images/antas4/question2/word5.png"),
    cropX: 108,
    cropY: 256,
    cropW: 1670,
    cropH: 569,
    aspect: 1670 / 569,
    text: "pumasok",
  },
  {
    id: "word6",
    source: require("../../assets/images/antas4/question2/word6.png"),
    cropX: 126,
    cropY: 285,
    cropW: 1668,
    cropH: 510,
    aspect: 1668 / 510,
    text: "pagsusulit",
  },
  {
    id: "word7",
    source: require("../../assets/images/antas4/question2/word7.png"),
    cropX: 161,
    cropY: 243,
    cropW: 1598,
    cropH: 560,
    aspect: 1598 / 560,
    text: "paaralan",
  },
  {
    id: "word8",
    source: require("../../assets/images/antas4/question2/word8.png"),
    cropX: 247,
    cropY: 150,
    cropW: 1433,
    cropH: 759,
    aspect: 1433 / 759,
    text: "anna",
  },
  {
    id: "word9",
    source: require("../../assets/images/antas4/question2/word9.png"),
    cropX: 346,
    cropY: 90,
    cropW: 1273,
    cropH: 870,
    aspect: 1273 / 870,
    text: "may",
  },
];

// Correct order: word4 maaga > word5 pumasok > word2 si > word8 anna > word1 sa > word7 paaralan > word3 dahil > word9 may > word6 pagsusulit
const CORRECT_ORDER = ["word4", "word5", "word2", "word8", "word1", "word7", "word3", "word9", "word6"];

/**
 * Reusable component to render an uncropped 1920x1080 PNG layer precisely fitted to target dimensions
 */
function CroppedImage({
  source,
  cropX,
  cropY,
  cropW,
  cropH,
  targetWidth,
  targetHeight,
}: {
  source: any;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  targetWidth: number;
  targetHeight: number;
}) {
  const scaleX = targetWidth / cropW;
  const scaleY = targetHeight / cropH;
  const renderedImgW = 1920 * scaleX;
  const renderedImgH = 1080 * scaleY;
  const offsetX = -cropX * scaleX;
  const offsetY = -cropY * scaleY;

  return (
    <View
      style={{
        width: targetWidth,
        height: targetHeight,
        overflow: "hidden",
      }}
      pointerEvents="none"
    >
      <Image
        source={source}
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: renderedImgW,
          height: renderedImgH,
        }}
        contentFit="fill"
        transition={0}
      />
    </View>
  );
}

export default function Antas4Level2Screen() {
  const router = useRouter();
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const setScore = useScoreStore((state) => state.setScore);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const wordAudios: Record<string, ReturnType<typeof useAudioPlayer>> = {
    sa: useAudioPlayer(require("../../assets/audio/level2 sa.mp3")),
    si: useAudioPlayer(require("../../assets/audio/level2 si.mp3")),
    dahil: useAudioPlayer(require("../../assets/audio/level2 dahil.mp3")),
    maaga: useAudioPlayer(require("../../assets/audio/level2 maaga.mp3")),
    pumasok: useAudioPlayer(require("../../assets/audio/level2 pumasok.mp3")),
    pagsusulit: useAudioPlayer(require("../../assets/audio/level2 pagsusulit.mp3")),
    paaralan: useAudioPlayer(require("../../assets/audio/level2 paaralan.mp3")),
    anna: useAudioPlayer(require("../../assets/audio/level2 anna.mp3")),
    may: useAudioPlayer(require("../../assets/audio/level2 may.mp3")),
  };

  const firstAnswerAudio = useAudioPlayer(require("../../assets/audio/second answer.mp3"));

  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answerChainCleanupRef = useRef<(() => void) | null>(null);
  const isScreenActiveRef = useRef(false);
  const wordAudiosRef = useRef(wordAudios);
  const firstAnswerAudioRef = useRef(firstAnswerAudio);
  wordAudiosRef.current = wordAudios;
  firstAnswerAudioRef.current = firstAnswerAudio;

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.min(screenW / DESIGN_W, screenH / DESIGN_H);
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
  const TEXT1_CROP_X = 64;
  const TEXT1_CROP_Y = 369;
  const TEXT1_CROP_W = 1791;
  const TEXT1_CROP_H = 129;
  const text1W = Math.min(screenW * 0.74, 860 * bgScale) * 1.68;
  const text1H = text1W * (TEXT1_CROP_H / TEXT1_CROP_W);
  const text1Left = (screenW - text1W) / 2 + 0.05 * screenW;
  const text1Top = Math.max(insets.top + 8, bgOffsetY + 28 * bgScale) * 1.2 * 1.6 * 1.6 * 2.2;

  // NPC character (npc.png)
  const NPC_CONTENT_X = 822;
  const NPC_CONTENT_Y = 49;
  const NPC_CONTENT_W = 296;
  const NPC_CONTENT_H = 993;
  const npcDesiredH = screenH * 0.72 * 1.2;
  const npcClipW = npcDesiredH * (NPC_CONTENT_W / NPC_CONTENT_H);
  const npcClipH = npcDesiredH;
  const npcLeft = Math.max(insets.left + 4, bgOffsetX + 16 * bgScale);
  const npcTop = screenH - npcClipH + 8 * bgScale;

  // Signpost (right side)
  const signLeft = bgOffsetX + 1680 * bgScale;
  const signW = 210 * bgScale;
  const nextTop = bgOffsetY + 700 * bgScale + 0.03 * screenH + 0.02 * screenH;
  const nextH = 92 * bgScale;
  const backTop = bgOffsetY + 800 * bgScale + 0.05 * screenH + 0.01 * screenH;
  const backSignH = 92 * bgScale;

  // Wooden Board (board.png)
  const BOARD_CROP_X = 25;
  const BOARD_CROP_Y = 294;
  const BOARD_CROP_W = 1870;
  const BOARD_CROP_H = 413;
  const BOARD_ASPECT = BOARD_CROP_W / BOARD_CROP_H;
  const boardH = Math.min(screenH * 0.31, 165 * bgScale * 1.4) * 1.44;
  const boardW = boardH * BOARD_ASPECT;
  const availableLeft = npcLeft + npcClipW + 12 * bgScale;
  const availableRight = screenW - (screenW * 0.12);
  const boardLeft = availableLeft + (availableRight - availableLeft - boardW) / 2;
  const boardTop = screenH - boardH - Math.max(insets.bottom + 2, 10 * bgScale);

  // Words inside the board
  const wordH = boardH * 0.38;
  const gap = 12 * bgScale;

  // Row 1: word1 (sa), word2 (si), word3 (dahil), word4 (maagang), word5 (pagsusulit)
  const row1Words = [ALL_WORDS[0], ALL_WORDS[1], ALL_WORDS[2], ALL_WORDS[3], ALL_WORDS[4]];
  const row1TotalW = row1Words.reduce((acc, w) => acc + wordH * w.aspect, 0) + (row1Words.length - 1) * gap;
  const row1StartLeft = boardLeft + (boardW - row1TotalW) / 2;
  const row1Top = boardTop + boardH * 0.08;

  // Row 2: word6 (pumasok), word7 (paaralan), word8 (ana), word9 (may)
  const row2Words = [ALL_WORDS[5], ALL_WORDS[6], ALL_WORDS[7], ALL_WORDS[8]];
  const row2TotalW = row2Words.reduce((acc, w) => acc + wordH * w.aspect, 0) + (row2Words.length - 1) * gap;
  const row2StartLeft = boardLeft + (boardW - row2TotalW) / 2;
  const row2Top = boardTop + boardH * 0.52;

  // Sentence Line (line.png) - ensure entire line with both left & right bullets is completely visible
  const LINE_CROP_X = 306;
  const LINE_CROP_Y = 578;
  const LINE_CROP_W = 1308;
  const LINE_CROP_H = 17;
  const lineW = Math.min(screenW * 0.75, 820 * bgScale) * 1.96;
  const lineH = 14 * bgScale * 1.96;
  const lineLeft = boardLeft + (boardW - lineW) / 2;
  const lineTop = boardTop - 20 * bgScale;

  // Pulsing animation
  const pulseScale = useSharedValue(1);

  const clearAnswerChain = useCallback(() => {
    if (answerChainCleanupRef.current) {
      answerChainCleanupRef.current();
      answerChainCleanupRef.current = null;
    }
  }, []);

  const stopAllAudio = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearAnswerChain();
    Object.values(wordAudiosRef.current).forEach((p) => {
      pauseNarration(p);
    });
    pauseNarration(firstAnswerAudioRef.current);
  }, [clearAnswerChain]);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      isScreenActiveRef.current = false;
      stopAllAudio();
    };
  }, [stopAllAudio]);

  useFocusEffect(
    useCallback(() => {
      isScreenActiveRef.current = true;
      return () => {
        isScreenActiveRef.current = false;
        stopAllAudio();
      };
    }, [stopAllAudio])
  );

  const checkSentence = (newPlaced: string[]) => {
    const validOrders = [
      ["word4", "word5", "word2", "word8", "word1", "word7", "word3", "word9", "word6"], // word4 maaga > word5 pumasok > word2 si > word8 anna > word1 sa > word7 paaralan > word3 dahil > word9 may > word6 pagsusulit
      ["word4", "word5", "word1", "word7", "word2", "word8", "word3", "word9", "word6"], // maaga pumasok sa paaralan si anna dahil may pagsusulit
      ["word2", "word8", "word4", "word5", "word1", "word7", "word3", "word9", "word6"], // si anna maaga pumasok sa paaralan dahil may pagsusulit
      ["word2", "word8", "word1", "word7", "word4", "word5", "word3", "word9", "word6"], // si anna sa paaralan maaga pumasok dahil may pagsusulit
      ["word3", "word9", "word6", "word4", "word5", "word2", "word8", "word1", "word7"], // dahil may pagsusulit maaga pumasok si anna sa paaralan
      ["word3", "word9", "word6", "word2", "word8", "word4", "word5", "word1", "word7"], // dahil may pagsusulit si anna maaga pumasok sa paaralan
    ];

    if (newPlaced.length === ALL_WORDS.length) {
      const isMatched = validOrders.some(
        (order) => order.every((id, idx) => id === newPlaced[idx])
      );
      setScore("antas4Level2", isMatched);
      if (isMatched) {
        setIsCorrect(true);
        setIsWrong(false);
        pulseScale.value = withRepeat(
          withSequence(withTiming(1.05, { duration: 300 }), withTiming(1, { duration: 300 })),
          3,
          true
        );
        const lastId = newPlaced[newPlaced.length - 1];
        const lastItem = ALL_WORDS.find((w) => w.id === lastId);
        const lastPlayer = lastItem ? wordAudios[lastItem.text] : undefined;
        if (lastPlayer) {
          chainFirstAnswerAfter(lastPlayer);
        } else {
          playFirstAnswer();
        }
        timerRef.current = null;
      } else {
        setIsCorrect(false);
        setIsWrong(true);
        pulseScale.value = withRepeat(
          withSequence(withTiming(1.03, { duration: 200 }), withTiming(1, { duration: 200 })),
          2,
          true
        );
      }
    } else {
      setIsCorrect(false);
      setIsWrong(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      clearAnswerChain();
    }
  };

  const playWordAudio = (text: string) => {
    if (!isScreenActiveRef.current) return;
    const player = wordAudiosRef.current[text];
    if (!player) return;
    if (!isScreenActiveRef.current) return;
    Object.values(wordAudiosRef.current).forEach((p) => {
      if (p !== player) {
        pauseNarration(p);
      }
    });
    pauseNarration(firstAnswerAudioRef.current);
    playNarration(player, narrationVolume);
  };

  const playFirstAnswer = () => {
    if (!isScreenActiveRef.current) return;
    Object.values(wordAudiosRef.current).forEach((p) => {
      pauseNarration(p);
    });
    const player = firstAnswerAudioRef.current;
    if (!isScreenActiveRef.current) return;
    playNarration(player, narrationVolume);
  };

  const handlePlayNarration = () => {
    playFirstAnswer();
  };

  const chainFirstAnswerAfter = (player: ReturnType<typeof useAudioPlayer>) => {
    clearAnswerChain();
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let done = false;
    const cleanup = () => {
      done = true;
      try {
        player.removeListener("playbackStatusUpdate", onStatus);
      } catch (e) {
        // ignore if already released
      }
      if (fallbackTimer) clearTimeout(fallbackTimer);
      fallbackTimer = null;
    };
    const finish = () => {
      if (done) return;
      cleanup();
      if (!isScreenActiveRef.current) return;
      playFirstAnswer();
    };
    const onStatus = (status: AudioStatus) => {
      if (status.didJustFinish) finish();
    };
    try {
      player.addListener("playbackStatusUpdate", onStatus);
    } catch (e) {
      // ignore if already released
    }
    const ms = player.duration && player.duration > 0 ? player.duration * 1000 + 400 : 2500;
    fallbackTimer = setTimeout(finish, ms);
    answerChainCleanupRef.current = cleanup;
  };

  const handleWordClick = (id: string) => {
    const item = ALL_WORDS.find((w) => w.id === id);
    if (item) playWordAudio(item.text);

    if (placedWords.includes(id)) {
      const newPlaced = placedWords.filter((wId) => wId !== id);
      setPlacedWords(newPlaced);
      checkSentence(newPlaced);
    } else {
      const newPlaced = [...placedWords, id];
      setPlacedWords(newPlaced);
      checkSentence(newPlaced);
    }
  };

  const handleNext = () => {
    isScreenActiveRef.current = false;
    stopAllAudio();
    router.navigate("/antas5" as any);
  };

  const handleBack = () => {
    isScreenActiveRef.current = false;
    stopAllAudio();
    router.back();
  };

  const handleSettings = () => {
    isScreenActiveRef.current = false;
    stopAllAudio();
    router.navigate("/settings");
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Placed words layout strictly ABOVE the line (fits within lineW with bullets visible on both ends)
  const placedWordH = Math.min(46 * bgScale, (lineW * 0.90) / 16.6) * 1.68;
  const placedGap = 4 * bgScale;
  const placedTotalW =
    placedWords.reduce((acc, id) => {
      const item = ALL_WORDS.find((w) => w.id === id);
      return acc + (item ? placedWordH * item.aspect : 0);
    }, 0) + Math.max(0, placedWords.length - 1) * placedGap;
  const placedStartLeft = lineLeft + (lineW - placedTotalW) / 2;
  const placedTop = (lineTop - placedWordH - 4 * bgScale) * 0.97;

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
      <StatusBar hidden={true} />

      {/* Background */}
      <Image
        source={require("../../assets/images/antas4/background.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        contentFit="cover"
        transition={0}
      />

      <View className="flex-1">
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0.03 * screenW }}>
            <Pressable onPress={handlePlayNarration} hitSlop={12} className="active:opacity-70">
              <RNImage
                source={require("../../assets/images/ui/sound.png")}
                style={{ width: soundW, height: soundH, opacity: soundEnabled ? 1 : 0.5 }}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable onPress={handleSettings} hitSlop={12} className="active:opacity-70">
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
          <CroppedImage
            source={require("../../assets/images/antas4/question1/text1.png")}
            cropX={TEXT1_CROP_X}
            cropY={TEXT1_CROP_Y}
            cropW={TEXT1_CROP_W}
            cropH={TEXT1_CROP_H}
            targetWidth={text1W}
            targetHeight={text1H}
          />
        </Animated.View>

        {/* NPC Character (Left) */}
        <Animated.View
          entering={FadeIn.duration(600).delay(100)}
          style={{
            position: "absolute",
            top: npcTop,
            left: npcLeft,
            width: npcClipW,
            height: npcClipH,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <CroppedImage
            source={require("../../assets/images/antas4/question1/npc.png")}
            cropX={NPC_CONTENT_X}
            cropY={NPC_CONTENT_Y}
            cropW={NPC_CONTENT_W}
            cropH={NPC_CONTENT_H}
            targetWidth={npcClipW}
            targetHeight={npcClipH}
          />
        </Animated.View>

        {/* Sentence Target Line with left & right bullet points */}
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
          <CroppedImage
            source={require("../../assets/images/antas4/question1/line.png")}
            cropX={LINE_CROP_X}
            cropY={LINE_CROP_Y}
            cropW={LINE_CROP_W}
            cropH={LINE_CROP_H}
            targetWidth={lineW}
            targetHeight={lineH}
          />
        </Animated.View>

        {/* Words placed ABOVE the line with Green / Red feedback borders */}
        {placedWords.length > 0 && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: placedTop,
                left: placedStartLeft,
                flexDirection: "row",
                alignItems: "center",
                gap: placedGap,
                zIndex: 35,
                paddingHorizontal: 4 * bgScale,
                paddingVertical: 2 * bgScale,
                borderRadius: 10 * bgScale,
                borderWidth: isCorrect || isWrong ? 3 : 0,
                borderColor: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "transparent",
                backgroundColor: isCorrect
                  ? "rgba(34, 197, 94, 0.22)"
                  : isWrong
                  ? "rgba(239, 68, 68, 0.22)"
                  : "transparent",
              },
              (isCorrect || isWrong) && animatedPulseStyle,
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
                    borderRadius: 8 * bgScale,
                    overflow: "hidden",
                  }}
                  className="active:scale-95 active:opacity-80"
                >
                  <CroppedImage
                    source={item.source}
                    cropX={item.cropX}
                    cropY={item.cropY}
                    cropW={item.cropW}
                    cropH={item.cropH}
                    targetWidth={width}
                    targetHeight={placedWordH}
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
          <CroppedImage
            source={require("../../assets/images/antas4/question1/board.png")}
            cropX={BOARD_CROP_X}
            cropY={BOARD_CROP_Y}
            cropW={BOARD_CROP_W}
            cropH={BOARD_CROP_H}
            targetWidth={boardW}
            targetHeight={boardH}
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
              <View style={{ flex: 1, opacity: isPlaced ? 0.22 : 1 }}>
                <Pressable
                  onPress={() => handleWordClick(item.id)}
                  disabled={isPlaced}
                  hitSlop={6}
                  style={{ width: "100%", height: "100%" }}
                  className="active:scale-95 active:opacity-80"
                >
                  <CroppedImage
                    source={item.source}
                    cropX={item.cropX}
                    cropY={item.cropY}
                    cropW={item.cropW}
                    cropH={item.cropH}
                    targetWidth={item.width}
                    targetHeight={wordH}
                  />
                </Pressable>
              </View>
            </Animated.View>
          );
        })}

        {/* Wooden Signpost Next Button */}
        <Animated.View style={{ position: "absolute", left: signLeft - 0.05 * screenW + 0.02 * screenW + signW * 1.90 - 0.05 * screenW,
            top: nextTop * 1.03 - 0.04 * screenH,
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
              source={require("../../assets/images/ui/next.png")} fadeDuration={0}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>

        {/* Wooden Signpost Back Button */}
        <Animated.View style={{ position: "absolute", left: signLeft - 0.03 * screenW + 0.01 * screenW + signW * 1.81 - 0.05 * screenW,
            top: backTop * 1.03 * 1.05 * 0.97 * 1.02 * 0.98 - 0.04 * screenH,
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
              source={require("../../assets/images/ui/back-green.png")} fadeDuration={0}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
