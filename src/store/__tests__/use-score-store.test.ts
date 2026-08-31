import { beforeEach, describe, expect, it } from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act } from "@testing-library/react-native";
import { countCorrect, SCORE_STORAGE_KEY, TOTAL_LEVELS, useScoreStore } from "../use-score-store";

describe("useScoreStore", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useScoreStore.getState().resetScores();
  });

  it("initializes with zero correct scores", () => {
    const state = useScoreStore.getState();
    expect(countCorrect(state)).toBe(0);
    expect(TOTAL_LEVELS).toBe(14);
  });

  it("records a correct score and counts accurately", () => {
    act(() => {
      useScoreStore.getState().setScore("antas1Level1", true);
      useScoreStore.getState().setScore("antas5Level3", true);
    });

    const state = useScoreStore.getState();
    expect(state.antas1Level1).toBe(true);
    expect(state.antas5Level3).toBe(true);
    expect(countCorrect(state)).toBe(2);
  });

  it("does not downgrade a previously correct score", () => {
    act(() => {
      useScoreStore.getState().setScore("antas2Level1", true);
      useScoreStore.getState().setScore("antas2Level1", false);
    });

    const state = useScoreStore.getState();
    expect(state.antas2Level1).toBe(true);
    expect(countCorrect(state)).toBe(1);
  });

  it("resets all scores back to false", () => {
    act(() => {
      useScoreStore.getState().setScore("antas1Level1", true);
      useScoreStore.getState().setScore("antas3Level2", true);
      useScoreStore.getState().resetScores();
    });

    const state = useScoreStore.getState();
    expect(countCorrect(state)).toBe(0);
  });
});
