"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { resolveMediaAssetUrl } from "@/presentation/components/editor/canvas/media-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Music, Trash2, Play, Pause, Volume2, Scissors } from "lucide-react";
import { buildWaveformPeaks } from "./waveform-utils";

interface AudioAsset {
  id: string;
  fileName: string;
  url: string;
  durationMs: number | null;
}

interface WaveformData {
  peaks: number[];
  duration: number;
}

export function EnhancedAudioPanel() {
  const { slideshow, addAudioTrack, removeAudioTrack, updateAudioTrack } = useEditorStore();
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [waveforms, setWaveforms] = useState<Record<string, WaveformData>>({});
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    fetch("/api/media?type=audio")
      .then((r) => r.json())
      .then((data) => setAudioAssets(data.items ?? []))
      .catch(() => {});
  }, []);

  const generateSimpleWaveform = useCallback(async (mediaAssetId: string, trackId: string) => {
    try {
      const assetUrl = await resolveMediaAssetUrl(mediaAssetId);
      const response = await fetch(assetUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      const peaks = buildWaveformPeaks(audioBuffer.getChannelData(0), 80);

      setWaveforms((prev) => ({
        ...prev,
        [trackId]: { peaks, duration: audioBuffer.duration },
      }));

      await audioContext.close();
    } catch {
      // Silent fail
    }
  }, []);

  const generateWaveform = useCallback(async (mediaAssetId: string, trackId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaAssetId}/waveform`);
      if (response.ok) {
        const data = await response.json();
        setWaveforms((prev) => ({ ...prev, [trackId]: data }));
      } else {
        generateSimpleWaveform(mediaAssetId, trackId);
      }
    } catch {
      generateSimpleWaveform(mediaAssetId, trackId);
    }
  }, [generateSimpleWaveform]);

  // Generate waveform data when tracks are added
  useEffect(() => {
    if (!slideshow) return;

    slideshow.audioTracks.forEach((track) => {
      if (!waveforms[track.id]) {
        generateWaveform(track.mediaAssetId, track.id);
      }
    });
  }, [slideshow, waveforms, generateWaveform]);

  if (!slideshow) return null;

  const slideshowId = slideshow.id;
  const totalFrames = slideshow.slides.reduce((sum, s) => sum + s.durationFrames, 0);
  const fps = slideshow.fps;
  const trackCount = slideshow.audioTracks.length;

  async function handleAddTrack(asset: AudioAsset) {
    const track = {
      id: crypto.randomUUID(),
      slideshowId,
      mediaAssetId: asset.id,
      trackIndex: trackCount,
      startFrame: 0,
      endFrame: asset.durationMs ? Math.round((asset.durationMs / 1000) * fps) : totalFrames,
      volume: 100,
      fadeInFrames: 0,
      fadeOutFrames: 0,
      createdAt: new Date(),
    };

    addAudioTrack(track);

    await fetch(`/api/slideshows/${slideshowId}/audio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(track),
    });
  }

  async function handleRemoveTrack(trackId: string) {
    removeAudioTrack(trackId);
    await fetch(`/api/slideshows/${slideshowId}/audio?trackId=${trackId}`, {
      method: "DELETE",
    });
    setSelectedTrackId(null);
  }

  const togglePlayback = async (trackId: string, mediaAssetId: string) => {
    if (playingTrackId === trackId) {
      // Pause
      const audio = audioRefs.current[trackId];
      if (audio) {
        audio.pause();
      }
      setPlayingTrackId(null);
    } else {
      // Stop any playing track
      if (playingTrackId && audioRefs.current[playingTrackId]) {
        audioRefs.current[playingTrackId].pause();
        audioRefs.current[playingTrackId].currentTime = 0;
      }
      
      // Play new track
      let audio = audioRefs.current[trackId];
      if (!audio) {
        audio = new Audio(await resolveMediaAssetUrl(mediaAssetId));
        audio.crossOrigin = "anonymous";
        audioRefs.current[trackId] = audio;
      }
      
      const track = slideshow.audioTracks.find((t) => t.id === trackId);
      if (track) {
        audio.currentTime = track.startFrame / fps;
        audio.volume = track.volume / 100;
        audio.play();
        setPlayingTrackId(trackId);
        
        audio.addEventListener("ended", () => {
          setPlayingTrackId(null);
        }, { once: true });
      }
    }
  };

  const updateTrackTrim = async (trackId: string, field: 'startFrame' | 'endFrame', value: number) => {
    const track = slideshow.audioTracks.find((t) => t.id === trackId);
    if (!track) return;

    updateAudioTrack(trackId, { [field]: value });

    await fetch(`/api/slideshows/${slideshowId}/audio/${trackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...track, [field]: value }),
    });
  };

  const updateTrackVolume = async (trackId: string, volume: number) => {
    const track = slideshow.audioTracks.find((t) => t.id === trackId);
    if (!track) return;

    updateAudioTrack(trackId, { volume });

    if (audioRefs.current[trackId]) {
      audioRefs.current[trackId].volume = volume / 100;
    }

    await fetch(`/api/slideshows/${slideshowId}/audio/${trackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...track, volume }),
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold text-slate-300">Audio Tracks</h3>

      {slideshow.audioTracks.length > 0 && (
        <div className="space-y-3">
          {slideshow.audioTracks.map((track, i) => {
            const asset = audioAssets.find((a) => a.id === track.mediaAssetId);
            const waveform = waveforms[track.id];
            const isSelected = selectedTrackId === track.id;
            const isPlaying = playingTrackId === track.id;
            
            return (
              <div
                key={track.id}
                className={`rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-rose-500/50 bg-rose-500/5"
                    : "border-white/[0.08] bg-white/[0.02]"
                }`}
                onClick={() => setSelectedTrackId(track.id)}
              >
                {/* Track Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Music className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-300 truncate max-w-[120px]">
                      {asset?.fileName ?? `Track ${i + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayback(track.id, track.mediaAssetId);
                      }}
                      className="h-6 w-6 text-slate-400 hover:text-slate-200"
                    >
                      {isPlaying ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrack(track.id);
                      }}
                      className="h-6 w-6 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Waveform Visualization */}
                {waveform && (
                  <div className="mb-3">
                    <WaveformVisualizer
                      peaks={waveform.peaks}
                      startFrame={track.startFrame}
                      endFrame={track.endFrame}
                      totalFrames={track.endFrame - track.startFrame}
                      fps={fps}
                    />
                  </div>
                )}

                {/* Track Info */}
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>
                    Start: {(track.startFrame / fps).toFixed(1)}s
                  </span>
                  <span>
                    End: {(track.endFrame / fps).toFixed(1)}s
                  </span>
                  <span>
                    Vol: {track.volume}%
                  </span>
                </div>

                {/* Expanded Controls */}
                {isSelected && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-white/[0.08]">
                    {/* Trim Controls */}
                    <div className="flex items-center gap-2">
                      <Scissors className="h-3 w-3 text-slate-500" />
                      <span className="text-[10px] text-slate-400">Trim:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[9px] text-slate-500">Start (s)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                          value={(track.startFrame / fps).toFixed(1)}
                          onChange={(e) => {
                            const seconds = Number(e.target.value);
                            updateTrackTrim(track.id, 'startFrame', Math.round(seconds * fps));
                          }}
                          className="h-6 text-xs bg-white/[0.04]"
                        />
                      </div>
                      <div>
                        <Label className="text-[9px] text-slate-500">End (s)</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.1}
                          value={(track.endFrame / fps).toFixed(1)}
                          onChange={(e) => {
                            const seconds = Number(e.target.value);
                            updateTrackTrim(track.id, 'endFrame', Math.round(seconds * fps));
                          }}
                          className="h-6 text-xs bg-white/[0.04]"
                        />
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Volume2 className="h-3 w-3 text-slate-500" />
                        <span className="text-[10px] text-slate-400">Volume</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={track.volume}
                          onChange={(e) => {
                            const volume = Number(e.target.value);
                            updateTrackVolume(track.id, volume);
                          }}
                          className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 w-10 text-right">
                          {track.volume}%
                        </span>
                      </div>
                    </div>

                    {/* Fade Controls */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[9px] text-slate-500">Fade In (frames)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={track.fadeInFrames}
                          onChange={(e) => {
                            const frames = Number(e.target.value);
                            updateAudioTrack(track.id, { fadeInFrames: frames });
                            fetch(`/api/slideshows/${slideshowId}/audio/${track.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...track, fadeInFrames: frames }),
                            });
                          }}
                          className="h-6 text-xs bg-white/[0.04]"
                        />
                      </div>
                      <div>
                        <Label className="text-[9px] text-slate-500">Fade Out (frames)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={track.fadeOutFrames}
                          onChange={(e) => {
                            const frames = Number(e.target.value);
                            updateAudioTrack(track.id, { fadeOutFrames: frames });
                            fetch(`/api/slideshows/${slideshowId}/audio/${track.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ...track, fadeOutFrames: frames }),
                            });
                          }}
                          className="h-6 text-xs bg-white/[0.04]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Separator className="bg-white/[0.08]" />

      {/* Available Audio */}
      <div className="space-y-2">
        <h4 className="text-xs text-slate-400">Available Audio</h4>
        {audioAssets.length === 0 ? (
          <p className="text-xs text-slate-500">Upload audio files first</p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {audioAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleAddTrack(asset)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Music className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{asset.fileName}</span>
                </div>
                {asset.durationMs && (
                  <span className="text-[10px] text-slate-500">
                    {(asset.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface WaveformVisualizerProps {
  peaks: number[];
  startFrame: number;
  endFrame: number;
  totalFrames: number;
  fps: number;
}

function WaveformVisualizer({ peaks, startFrame, endFrame, fps }: WaveformVisualizerProps) {
  return (
    <div className="h-10 w-full bg-white/[0.04] rounded overflow-hidden relative">
      {/* Waveform bars */}
      <div className="absolute inset-0 flex items-center gap-[1px] px-1">
        {peaks.map((peak, i) => (
          <div
            key={i}
            className="flex-1 bg-rose-500/60 rounded-sm"
            style={{
              height: `${peak * 100}%`,
              minHeight: '2px',
            }}
          />
        ))}
      </div>
      
      {/* Trim indicators */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50"
          title={`Start: ${(startFrame / fps).toFixed(1)}s`}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-1 bg-red-500/50"
          title={`End: ${(endFrame / fps).toFixed(1)}s`}
        />
      </div>
    </div>
  );
}
