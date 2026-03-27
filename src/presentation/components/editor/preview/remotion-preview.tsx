"use client";

import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { SlideshowComposition } from "@/remotion/compositions/slideshow-composition";
import { getTotalDurationFrames } from "@/domain/slideshow/entities/slideshow";
import { getResolutionDimensions } from "@/domain/slideshow/value-objects/resolution";

export function RemotionPreview() {
  const playerRef = useRef<PlayerRef>(null);
  const slideshow = useEditorStore((s) => s.slideshow);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setCurrentFrame = useEditorStore((s) => s.setCurrentFrame);

  // Listen for frame updates from the player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame);
    };

    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onEnded = () => setPlaying(false);

    player.addEventListener("frameupdate", onFrameUpdate);
    player.addEventListener("pause", onPause);
    player.addEventListener("play", onPlay);
    player.addEventListener("ended", onEnded);

    return () => {
      player.removeEventListener("frameupdate", onFrameUpdate);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("ended", onEnded);
    };
  }, [setCurrentFrame, setPlaying]);

  // Sync playback state from store to player
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  // Sync frame position from store to player
  useEffect(() => {
    if (!playerRef.current) return;
    const playerCurrentFrame = playerRef.current.getCurrentFrame();
    if (Math.abs(playerCurrentFrame - currentFrame) > 1) {
      playerRef.current.seekTo(currentFrame);
    }
  }, [currentFrame]);

  if (!slideshow) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No slideshow loaded
      </div>
    );
  }

  const totalFrames = getTotalDurationFrames(slideshow);
  const { width, height } = getResolutionDimensions(slideshow.resolution);

  return (
    <div className="flex h-full w-full items-center justify-center bg-black/50 p-4">
      <Player
        ref={playerRef}
        component={SlideshowComposition}
        inputProps={{ slideshow }}
        durationInFrames={Math.max(totalFrames, 1)}
        fps={slideshow.fps}
        compositionWidth={width}
        compositionHeight={height}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: `${width} / ${height}`,
        }}
        controls={false}
        showVolumeControls={false}
        clickToPlay={false}
      />
    </div>
  );
}
