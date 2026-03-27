"use client";

import { memo, useMemo } from "react";
import { Volume2, Music } from "lucide-react";
import type { AudioTrack } from "@/domain/slideshow/entities/audio-track";

interface AudioTrackLaneProps {
  audioTracks: AudioTrack[];
  pixelsPerFrame: number;
  totalFrames: number;
}

function generateWaveformBars(seed: number, count: number): number[] {
  const bars: number[] = [];
  let value = 0.3;
  for (let i = 0; i < count; i++) {
    const noise = Math.sin(seed + i * 0.3) * 0.4 + Math.sin(seed + i * 0.7) * 0.3;
    value = Math.max(0.08, Math.min(1, 0.5 + noise));
    bars.push(value);
  }
  return bars;
}

export const AudioTrackLane = memo(function AudioTrackLane({
  audioTracks,
  pixelsPerFrame,
  totalFrames,
}: AudioTrackLaneProps) {
  if (audioTracks.length === 0) return null;

  return (
    <div className="absolute inset-y-0 left-0 flex items-center px-2" style={{ top: "36px" }}>
      {audioTracks.map((track, index) => (
        <AudioTrackBlock
          key={track.id}
          track={track}
          index={index}
          pixelsPerFrame={pixelsPerFrame}
        />
      ))}
    </div>
  );
});

interface AudioTrackBlockProps {
  track: AudioTrack;
  index: number;
  pixelsPerFrame: number;
}

const AudioTrackBlock = memo(function AudioTrackBlock({
  track,
  index,
  pixelsPerFrame,
}: AudioTrackBlockProps) {
  const left = track.startFrame * pixelsPerFrame;
  const width = (track.endFrame - track.startFrame) * pixelsPerFrame;

  const waveformBars = useMemo(() => {
    const barCount = Math.max(Math.floor(width / 4), 20);
    return generateWaveformBars(index * 100, barCount);
  }, [width, index]);

  return (
    <div
      className="absolute flex items-center gap-1.5 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 backdrop-blur-sm"
      style={{ left, width: Math.max(width, 60) }}
    >
      <Music className="h-3 w-3 shrink-0 text-violet-400" />
      
      {/* Waveform visualization */}
      <div className="flex h-4 flex-1 items-end gap-[2px] overflow-hidden">
        {waveformBars.map((height, i) => (
          <div
            key={i}
            className="w-[2px] rounded-full bg-violet-400/50 transition-all"
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>

      {/* Volume indicator */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Volume2 className="h-2.5 w-2.5 text-violet-400/70" />
        <span className="text-[9px] text-violet-300/70">{track.volume}%</span>
      </div>
    </div>
  );
});
