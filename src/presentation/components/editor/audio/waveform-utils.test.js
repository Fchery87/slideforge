import { describe, expect, test } from "bun:test";
import { buildWaveformPeaks } from "@/presentation/components/editor/audio/waveform-utils";

describe("buildWaveformPeaks", () => {
  test("builds a peak array for evenly sized buckets", () => {
    const channelData = new Float32Array([0, 0.5, -0.1, 0.2, -0.9, 0.3, 0.1, -0.4]);
    const peaks = buildWaveformPeaks(channelData, 4);

    expect(peaks.map((value) => Number(value.toFixed(2)))).toEqual([0.5, 0.2, 0.9, 0.4]);
  });

  test("returns a minimum visible peak for silent buckets", () => {
    const channelData = new Float32Array([0, 0, 0, 0]);
    const peaks = buildWaveformPeaks(channelData, 2);

    expect(peaks).toEqual([0.02, 0.02]);
  });
});
