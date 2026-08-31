import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// One slot per level — true = got it correct, false/undefined = wrong/unanswered
export interface ScoreState {
  // Antas 1
  antas1Level1: boolean;
  antas1Level2: boolean;
  antas1Level3: boolean;
  // Antas 2
  antas2Level1: boolean;
  antas2Level2: boolean;
  antas2Level3: boolean;
  // Antas 3
  antas3Level1: boolean;
  antas3Level2: boolean;
  antas3Level3: boolean;
  // Antas 4
  antas4Level1: boolean;
  antas4Level2: boolean;
  // Antas 5
  antas5Level1: boolean;
  antas5Level2: boolean;
  antas5Level3: boolean;

  setScore: (key: ScoreKey, correct: boolean) => void;
  resetScores: () => void;
}

export type ScoreKey =
  | "antas1Level1" | "antas1Level2" | "antas1Level3"
  | "antas2Level1" | "antas2Level2" | "antas2Level3"
  | "antas3Level1" | "antas3Level2" | "antas3Level3"
  | "antas4Level1" | "antas4Level2"
  | "antas5Level1" | "antas5Level2" | "antas5Level3";

const DEFAULT_SCORES = {
  antas1Level1: false,
  antas1Level2: false,
  antas1Level3: false,
  antas2Level1: false,
  antas2Level2: false,
  antas2Level3: false,
  antas3Level1: false,
  antas3Level2: false,
  antas3Level3: false,
  antas4Level1: false,
  antas4Level2: false,
  antas5Level1: false,
  antas5Level2: false,
  antas5Level3: false,
};

export const SCORE_STORAGE_KEY = "tuklas-scores";

export const useScoreStore = create<ScoreState>()(
  persist(
    (set) => ({
      ...DEFAULT_SCORES,
      setScore: (key, correct) =>
        set((state) => {
          // Only upgrade false → true, never downgrade a correct answer
          if (correct && !state[key]) return { [key]: true };
          if (!correct && !state[key]) return { [key]: false };
          return {};
        }),
      resetScores: () => set({ ...DEFAULT_SCORES }),
    }),
    {
      name: SCORE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Counts how many levels have been answered correctly */
export function countCorrect(state: ScoreState): number {
  const keys: ScoreKey[] = [
    "antas1Level1", "antas1Level2", "antas1Level3",
    "antas2Level1", "antas2Level2", "antas2Level3",
    "antas3Level1", "antas3Level2", "antas3Level3",
    "antas4Level1", "antas4Level2",
    "antas5Level1", "antas5Level2", "antas5Level3",
  ];
  return keys.filter((k) => state[k]).length;
}

export const TOTAL_LEVELS = 14;
