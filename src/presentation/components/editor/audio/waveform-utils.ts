export function buildWaveformPeaks(
  channelData: Float32Array,
  buckets = 60
): number[] {
  if (channelData.length === 0 || buckets <= 0) {
    return [];
  }

  const bucketSize = Math.max(Math.floor(channelData.length / buckets), 1);
  const peaks: number[] = [];

  for (let bucketIndex = 0; bucketIndex < buckets; bucketIndex++) {
    const start = bucketIndex * bucketSize;
    const end = Math.min(start + bucketSize, channelData.length);
    let max = 0;

    for (let index = start; index < end; index++) {
      max = Math.max(max, Math.abs(channelData[index]));
    }

    peaks.push(Math.max(max, 0.02));
  }

  return peaks;
}
