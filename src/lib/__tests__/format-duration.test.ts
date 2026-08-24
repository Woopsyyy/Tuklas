import { describe, expect, it } from "@jest/globals";

import { formatDuration } from "../format-duration";

describe("formatDuration", () => {
  it("formats zero milliseconds", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats sub-second durations without rounding up", () => {
    expect(formatDuration(59999)).toBe("0:59");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(65000)).toBe("1:05");
  });

  it("pads seconds to two digits", () => {
    expect(formatDuration(61000)).toBe("1:01");
  });

  it("handles negative input as zero", () => {
    expect(formatDuration(-250)).toBe("0:00");
  });
});
