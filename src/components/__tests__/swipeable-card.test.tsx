import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { SwipeableCard } from "../swipeable-card";

describe("SwipeableCard", () => {
  it("renders its label", async () => {
    await render(<SwipeableCard label="Swipe me away" onDismiss={() => {}} />);
    expect(screen.getByText("Swipe me away")).toBeOnTheScreen();
  });
});
