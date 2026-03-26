import { Audio, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { AudioTrack } from "@/domain/slideshow/entities/audio-track";

type AudioLayerProps = {
  tracks: AudioTrack[];
};

function AudioTrackItem({ track }: { track: AudioTrack }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInDuration = track.fadeInFrames;
  const fadeOutStart = track.endFrame - track.startFrame - track.fadeOutFrames;
  const totalDuration = track.endFrame - track.startFrame;

  const volume = interpolate(
    frame,
    [0, fadeInDuration, fadeOutStart, totalDuration],
    [0, track.volume, track.volume, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <Audio
      src={track.mediaAssetId}
      volume={volume}
      trimBefore={track.startFrame}
      trimAfter={track.endFrame}
    />
  );
}

export function AudioLayer({ tracks }: AudioLayerProps) {
  return (
    <>
      {tracks.map((track) => (
        <Sequence key={track.id} from={track.startFrame} layout="none">
          <AudioTrackItem track={track} />
        </Sequence>
      ))}
    </>
  );
}
