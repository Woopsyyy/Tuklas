import { useFocusEffect, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInUp } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useSettingsStore } from "@/store/use-settings-store";
import { countCorrect, TOTAL_LEVELS, useScoreStore } from "@/store/use-score-store";

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

export default function Antas5Slide10Screen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narrationVolume = useSettingsStore((state) => state.narrationVolume);
  const narration = useAudioPlayer(require("../../assets/audio/end.mp3"));

  const scoreState = useScoreStore();
  const resetScores = useScoreStore((state) => state.resetScores);

  const screenW = Math.max(width, height);
  const screenH = Math.min(width, height);

  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const bgScale = Math.max(screenW / DESIGN_W, screenH / DESIGN_H);
  const bgOffsetX = (screenW - DESIGN_W * bgScale) / 2;

  // Header icons
  const iconBase = Math.max(36, Math.min(48, 56 * bgScale));
  const backW = iconBase * (700 / 576);
  const backH = iconBase;
  const soundW = iconBase;
  const soundH = iconBase;
  const settingsW = iconBase;
  const settingsH = iconBase;

  // NPC Explorer Girl (npc.png: 417 x 977) — standing on the left
  const npcH = Math.min(screenH * 0.88 * 1.4, 977 * bgScale * 0.95 * 1.4);
  const npcW = npcH * (417 / 977);
  const npcLeft = Math.max(insets.left + 12, bgOffsetX + 60 * bgScale) + screenW * 0.05;
  const npcBottom = Math.max(insets.bottom + 4, 10 * bgScale) - screenH * 0.13;

  // Calculate scores
  const antas1Score = (scoreState.antas1Level1 ? 1 : 0) + (scoreState.antas1Level2 ? 1 : 0) + (scoreState.antas1Level3 ? 1 : 0);
  const antas2Score = (scoreState.antas2Level1 ? 1 : 0) + (scoreState.antas2Level2 ? 1 : 0) + (scoreState.antas2Level3 ? 1 : 0);
  const antas3Score = (scoreState.antas3Level1 ? 1 : 0) + (scoreState.antas3Level2 ? 1 : 0) + (scoreState.antas3Level3 ? 1 : 0);
  const antas4Score = (scoreState.antas4Level1 ? 1 : 0) + (scoreState.antas4Level2 ? 1 : 0);
  const antas5Score = (scoreState.antas5Level1 ? 1 : 0) + (scoreState.antas5Level2 ? 1 : 0) + (scoreState.antas5Level3 ? 1 : 0);

  const totalScore = countCorrect(scoreState);

  // Score badge remarks
  const getRemark = () => {
    if (totalScore === TOTAL_LEVELS) return "🌟 Perpekto! Napakahusay mo, Manlalakbay! 🌟";
    if (totalScore >= 11) return "🎉 Magaling! Halos perpekto ang iyong paglalakbay! 🎉";
    if (totalScore >= 7) return "✨ Mahusay! Marami kang natutuhan sa gubat! ✨";
    return "🌱 Magandang subok! Maaari mong ulitin upang maging mas mahusay! 🌱";
  };

  // Board layout sizing - centered in the middle
  const cardW = Math.min(screenW * 0.58, 760 * bgScale);
  const cardLeft = (screenW - cardW) / 2;
  const cardTop = Math.max(insets.top + 8, screenH * 0.07);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          narration.pause();
          narration.seekTo(0);
        } catch (e) {}
      };
    }, [narration])
  );

  const handlePlayNarration = async () => {
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      narration.loop = false;
      narration.volume = Number.isFinite(narrationVolume) && narrationVolume > 0 ? narrationVolume : 1.0;
      narration.muted = false;
      try {
        narration.seekTo(0);
      } catch (_) {}
      narration.play();
    } catch (e) {
      console.warn("Antas5Slide10 narration play error:", e);
    }
  };

  const handleBackToSelect = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate("/slide3");
  };

  const handleBackToHome = () => {
    try {
      narration.pause();
      narration.seekTo(0);
    } catch (e) {}
    router.navigate("/");
  };

  const handleResetScores = () => {
    resetScores();
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden={false} />

      {/* Full-screen Background (Same as Slide 9) */}
      <Image
        source={require("../../assets/images/antas5/slide9/background.png")}
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
            zIndex: 30,
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={12} className="active:opacity-70">
            <Image
              source={require("../../assets/images/ui/back.png")}
              style={{ width: backW, height: backH }}
              contentFit="contain"
              transition={0}
            />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0.03 * screenW }}>
            <Pressable onPress={handlePlayNarration} hitSlop={12} className="active:opacity-70">
              <Image
                source={require("../../assets/images/ui/sound.png")}
                style={{ width: soundW, height: soundH }}
                contentFit="contain"
                transition={0}
              />
            </Pressable>
            <Pressable onPress={() => router.navigate("/settings")} hitSlop={12} className="active:opacity-70">
              <Image
                source={require("../../assets/images/ui/settings.png")}
                style={{ width: settingsW, height: settingsH }}
                contentFit="contain"
                transition={0}
              />
            </Pressable>
          </View>
        </View>

        {/* NPC Explorer Girl — standing on the left */}
        <Animated.View
          entering={FadeInLeft.duration(700).delay(100)}
          style={{
            position: "absolute",
            bottom: npcBottom,
            left: npcLeft,
            width: npcW,
            height: npcH,
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../../assets/images/antas5/slide9/npc.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            transition={0}
          />
        </Animated.View>

        {/* Total Score Board Card */}
        <Animated.View
          entering={FadeInDown.duration(700)}
          style={{
            position: "absolute",
            top: cardTop,
            left: cardLeft,
            width: cardW,
            zIndex: 25,
            backgroundColor: "#fae7c9",
            borderColor: "#8c531b",
            borderWidth: 4 * bgScale,
            borderRadius: 20 * bgScale,
            paddingVertical: 12 * bgScale,
            paddingHorizontal: 18 * bgScale,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          {/* Header Title */}
          <View style={{ alignItems: "center", marginBottom: 6 * bgScale }}>
            <Text
              style={{
                fontSize: Math.max(16, 22 * bgScale),
                fontWeight: "900",
                color: "#61360c",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              🏆 KABUUANG ISKOR 🏆
            </Text>
            <Text
              style={{
                fontSize: Math.max(10, 13 * bgScale),
                color: "#854d0e",
                fontWeight: "600",
                textAlign: "center",
                marginTop: 2,
              }}
            >
              Gubat ng Karunungan
            </Text>
          </View>

          {/* Big Score Counter Display */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fef3c7",
              borderColor: "#d97706",
              borderWidth: 2 * bgScale,
              borderRadius: 14 * bgScale,
              paddingVertical: 6 * bgScale,
              paddingHorizontal: 16 * bgScale,
              marginVertical: 4 * bgScale,
              gap: 8 * bgScale,
            }}
          >
            <Text
              style={{
                fontSize: Math.max(26, 38 * bgScale),
                fontWeight: "900",
                color: "#b45309",
              }}
            >
              {totalScore}
            </Text>
            <Text
              style={{
                fontSize: Math.max(16, 22 * bgScale),
                fontWeight: "800",
                color: "#78350f",
              }}
            >
              / {TOTAL_LEVELS}
            </Text>
            <Text
              style={{
                fontSize: Math.max(11, 14 * bgScale),
                fontWeight: "700",
                color: "#059669",
                marginLeft: 6 * bgScale,
              }}
            >
              Wastong Sagot
            </Text>
          </View>

          {/* Remarks text */}
          <Text
            style={{
              fontSize: Math.max(10, 13 * bgScale),
              fontWeight: "700",
              color: "#451a03",
              textAlign: "center",
              marginVertical: 4 * bgScale,
            }}
          >
            {getRemark()}
          </Text>

          {/* Antas Breakdown Rows */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 6 * bgScale,
              marginVertical: 6 * bgScale,
            }}
          >
            <View
              style={{
                width: "48%",
                backgroundColor: "#fffbeb",
                borderColor: "#d97706",
                borderWidth: 1.5,
                borderRadius: 8 * bgScale,
                paddingVertical: 3 * bgScale,
                paddingHorizontal: 6 * bgScale,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: Math.max(9, 12 * bgScale), fontWeight: "700", color: "#78350f" }}>
                🌲 Antas 1
              </Text>
              <Text style={{ fontSize: Math.max(10, 13 * bgScale), fontWeight: "800", color: antas1Score === 3 ? "#15803d" : "#b45309" }}>
                {antas1Score}/3
              </Text>
            </View>

            <View
              style={{
                width: "48%",
                backgroundColor: "#fffbeb",
                borderColor: "#d97706",
                borderWidth: 1.5,
                borderRadius: 8 * bgScale,
                paddingVertical: 3 * bgScale,
                paddingHorizontal: 6 * bgScale,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: Math.max(9, 12 * bgScale), fontWeight: "700", color: "#78350f" }}>
                🍃 Antas 2
              </Text>
              <Text style={{ fontSize: Math.max(10, 13 * bgScale), fontWeight: "800", color: antas2Score === 3 ? "#15803d" : "#b45309" }}>
                {antas2Score}/3
              </Text>
            </View>

            <View
              style={{
                width: "48%",
                backgroundColor: "#fffbeb",
                borderColor: "#d97706",
                borderWidth: 1.5,
                borderRadius: 8 * bgScale,
                paddingVertical: 3 * bgScale,
                paddingHorizontal: 6 * bgScale,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: Math.max(9, 12 * bgScale), fontWeight: "700", color: "#78350f" }}>
                🗺️ Antas 3
              </Text>
              <Text style={{ fontSize: Math.max(10, 13 * bgScale), fontWeight: "800", color: antas3Score === 3 ? "#15803d" : "#b45309" }}>
                {antas3Score}/3
              </Text>
            </View>

            <View
              style={{
                width: "48%",
                backgroundColor: "#fffbeb",
                borderColor: "#d97706",
                borderWidth: 1.5,
                borderRadius: 8 * bgScale,
                paddingVertical: 3 * bgScale,
                paddingHorizontal: 6 * bgScale,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: Math.max(9, 12 * bgScale), fontWeight: "700", color: "#78350f" }}>
                🧩 Antas 4
              </Text>
              <Text style={{ fontSize: Math.max(10, 13 * bgScale), fontWeight: "800", color: antas4Score === 2 ? "#15803d" : "#b45309" }}>
                {antas4Score}/2
              </Text>
            </View>

            <View
              style={{
                width: "100%",
                backgroundColor: "#fffbeb",
                borderColor: "#d97706",
                borderWidth: 1.5,
                borderRadius: 8 * bgScale,
                paddingVertical: 3 * bgScale,
                paddingHorizontal: 6 * bgScale,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: Math.max(9, 12 * bgScale), fontWeight: "700", color: "#78350f" }}>
                ✨ Antas 5 (Aklatan ng Karunungan)
              </Text>
              <Text style={{ fontSize: Math.max(10, 13 * bgScale), fontWeight: "800", color: antas5Score === 3 ? "#15803d" : "#b45309" }}>
                {antas5Score}/3
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 10 * bgScale, marginTop: 8 * bgScale }}>
            <Pressable
              onPress={handleBackToSelect}
              hitSlop={8}
              style={{
                flex: 1,
                backgroundColor: "#ca8a04",
                borderColor: "#854d0e",
                borderWidth: 2,
                borderRadius: 12 * bgScale,
                paddingVertical: 8 * bgScale,
                alignItems: "center",
                justifyContent: "center",
              }}
              className="active:scale-95 active:opacity-90"
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontWeight: "900",
                  fontSize: Math.max(11, 14 * bgScale),
                }}
              >
                Pumili ng Antas
              </Text>
            </Pressable>

            <Pressable
              onPress={handleBackToHome}
              hitSlop={8}
              style={{
                flex: 1,
                backgroundColor: "#16a34a",
                borderColor: "#14532d",
                borderWidth: 2,
                borderRadius: 12 * bgScale,
                paddingVertical: 8 * bgScale,
                alignItems: "center",
                justifyContent: "center",
              }}
              className="active:scale-95 active:opacity-90"
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontWeight: "900",
                  fontSize: Math.max(11, 14 * bgScale),
                }}
              >
                Bumalik sa Simula
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
