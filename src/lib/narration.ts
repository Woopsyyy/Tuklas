import type { AudioPlayer } from "expo-audio";

/**
 * Clamp a stored volume into a usable 0..1 range.
 * Falls back to `fallback` for NaN / infinity / zero so narration is never
 * rendered inaudible by a corrupted setting.
 */
export function safeVolume(
  volume: number | undefined | null,
  fallback = 1
): number {
  return Number.isFinite(volume) && (volume as number) > 0
    ? Math.min(1, volume as number)
    : fallback;
}

/**
 * Restart a narration player from the beginning with sane defaults.
 *
 * Why this exists: on slow Android devices (e.g. low-end Tecno/MediaTek
 * phones) an ExoPlayer that has not finished preparing can silently swallow
 * `seekTo(0)` followed immediately by `play()`, leaving no sound even though
 * the tap registered. Setting loop/muted/volume first and pausing before
 * seeking keeps the player in a known state before playback starts.
 */
export function playNarration(
  player: AudioPlayer,
  volume: number | undefined,
  loop = false
): void {
  try {
    player.loop = loop;
    player.muted = false;
    player.volume = safeVolume(volume);
    try {
      player.pause();
    } catch {}
    try {
      player.seekTo(0);
    } catch {}
    player.play();
  } catch (e) {
    console.warn("playNarration error:", e);
  }
}

/**
 * Pause a narration player and rewind it to the start.
 * Safe to call for already-released players.
 */
export function pauseNarration(
  player: AudioPlayer | null | undefined
): void {
  if (!player) return;
  try {
    player.pause();
    player.seekTo(0);
  } catch {}
}