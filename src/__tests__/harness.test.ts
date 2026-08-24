import { describe, expect, it } from "@jest/globals";

describe("test harness", () => {
  it("executes tests through the jest-expo preset", () => {
    expect(1 + 1).toBe(2);
  });
});
