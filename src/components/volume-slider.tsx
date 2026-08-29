import React, { useEffect, useRef, useState } from "react";
import { PanResponder, View } from "react-native";

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 10;
const THROTTLE_MS = 60;

interface VolumeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  color?: string;
  disabled?: boolean;
}

export function VolumeSlider({
  value,
  onValueChange,
  color = "#f59e0b",
  disabled = false,
}: VolumeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [internalValue, setInternalValue] = useState(
    disabled ? 0 : Math.max(0, Math.min(1, value))
  );

  const isDragging = useRef(false);
  const trackWidthRef = useRef(0);
  const initialTouchVal = useRef(0);
  const lastCommitTime = useRef(0);
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  // Sync external value when not dragging
  useEffect(() => {
    if (!isDragging.current) {
      setInternalValue(disabled ? 0 : Math.max(0, Math.min(1, value)));
    }
  }, [value, disabled]);

  const updateFromPosition = (dx: number, isFinal = false) => {
    const usableWidth = Math.max(trackWidthRef.current - THUMB_SIZE, 1);
    const startOffset = initialTouchVal.current * usableWidth;
    const currentOffset = Math.max(0, Math.min(usableWidth, startOffset + dx));
    const nextVal = Math.round((currentOffset / usableWidth) * 100) / 100;

    setInternalValue(nextVal);

    const now = Date.now();
    if (isFinal || now - lastCommitTime.current >= THROTTLE_MS) {
      lastCommitTime.current = now;
      onValueChangeRef.current(nextVal);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt) => {
        isDragging.current = true;
        const usableWidth = Math.max(trackWidthRef.current - THUMB_SIZE, 1);
        const tapX = evt.nativeEvent.locationX;
        const clampedTapX = Math.max(
          0,
          Math.min(usableWidth, tapX - THUMB_SIZE / 2)
        );
        const val = Math.round((clampedTapX / usableWidth) * 100) / 100;

        initialTouchVal.current = val;
        setInternalValue(val);
        lastCommitTime.current = Date.now();
        onValueChangeRef.current(val);
      },
      onPanResponderMove: (_evt, gestureState) => {
        updateFromPosition(gestureState.dx, false);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        updateFromPosition(gestureState.dx, true);
        isDragging.current = false;
      },
      onPanResponderTerminate: (_evt, gestureState) => {
        updateFromPosition(gestureState.dx, true);
        isDragging.current = false;
      },
    })
  ).current;

  const usableWidth = Math.max(trackWidth - THUMB_SIZE, 0);
  const currentProgress = disabled ? 0 : internalValue;
  const fillWidth = usableWidth * currentProgress + THUMB_SIZE / 2;
  const thumbLeft = usableWidth * currentProgress;
  const activeColor = disabled ? "#52525b" : color;

  return (
    <View
      {...panResponder.panHandlers}
      style={{
        height: 38,
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
      }}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        trackWidthRef.current = width;
        setTrackWidth(width);
      }}
    >
      {/* Track Background */}
      <View
        style={{
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: "rgba(20, 15, 10, 0.75)",
          borderColor: "rgba(245, 158, 11, 0.35)",
          borderWidth: 1.5,
        }}
      />
      {/* Track Active Fill */}
      <View
        style={{
          position: "absolute",
          left: 0,
          width: fillWidth,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: activeColor,
        }}
      />
      {/* Themed Thumb */}
      <View
        style={{
          position: "absolute",
          left: thumbLeft,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: "#fef3c7",
          borderWidth: 3,
          borderColor: activeColor,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 4,
        }}
      >
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: activeColor,
          }}
        />
      </View>
    </View>
  );
}