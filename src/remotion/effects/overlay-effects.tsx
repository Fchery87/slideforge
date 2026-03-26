import { useCurrentFrame, useVideoConfig, random } from "remotion";
import type { OverlayEffect, OverlayType } from "@/domain/slideshow/value-objects/slide-effects";
import { useMemo } from "react";

interface OverlayContainerProps {
  overlay: OverlayEffect;
  children: React.ReactNode;
}

function FilmGrain({ opacity }: { opacity: number }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate pseudo-random grain pattern
  const grainStyle = useMemo(() => {
    const seed = frame * 12345;
    const grain = Array.from({ length: 100 }, (_, i) => ({
      x: random(`${seed}-${i}-x`) * 100,
      y: random(`${seed}-${i}-y`) * 100,
      size: random(`${seed}-${i}-size`) * 2 + 1,
      opacity: random(`${seed}-${i}-op`) * 0.5 + 0.2,
    }));
    return grain;
  }, [frame]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: opacity / 100,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
      }}
    />
  );
}

function Dust({ opacity }: { opacity: number }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: opacity / 100,
        background: `radial-gradient(circle at ${20 + Math.sin(frame * 0.02) * 10}% ${30 + Math.cos(frame * 0.03) * 10}%, rgba(255,255,255,0.1) 0%, transparent 50%),
                     radial-gradient(circle at ${70 + Math.cos(frame * 0.025) * 15}% ${60 + Math.sin(frame * 0.02) * 10}%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
      }}
    />
  );
}

function LightLeak({ opacity, color = "#ffaa00" }: { opacity: number; color?: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const position = useMemo(() => {
    // Move light leak across screen over time
    const progress = (frame % durationInFrames) / durationInFrames;
    return {
      x: 20 + Math.sin(progress * Math.PI * 2) * 30,
      y: 20 + Math.cos(progress * Math.PI * 1.5) * 20,
    };
  }, [frame, durationInFrames]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: opacity / 100,
        background: `radial-gradient(ellipse at ${position.x}% ${position.y}%, ${color}40 0%, transparent 50%)`,
        mixBlendMode: "screen",
      }}
    />
  );
}

function Vignette({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: opacity / 100,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }}
    />
  );
}

function LensFlare({ opacity }: { opacity: number }) {
  const frame = useCurrentFrame();

  const position = useMemo(() => ({
    x: 80 + Math.sin(frame * 0.01) * 5,
    y: 20 + Math.cos(frame * 0.015) * 5,
  }), [frame]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: opacity / 100,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${position.x}%`,
          top: `${position.y}%`,
          width: 200,
          height: 200,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,200,100,0.4) 30%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

function Particles({ opacity, intensity = 50, type }: { opacity: number; intensity?: number; type: OverlayType }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = useMemo(() => {
    const count = Math.floor(intensity / 5);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: random(`particle-${i}-x`) * width,
      y: random(`particle-${i}-y`) * height,
      size: random(`particle-${i}-size`) * 3 + 1,
      speed: random(`particle-${i}-speed`) * 2 + 1,
      opacity: random(`particle-${i}-op`) * 0.5 + 0.3,
    }));
  }, [intensity, width, height]);

  const getParticleColor = () => {
    switch (type) {
      case "snow":
        return "rgba(255,255,255,0.8)";
      case "rain":
        return "rgba(150,180,220,0.6)";
      case "confetti":
        const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
        return colors[Math.floor(random(`confetti-color`) * colors.length)];
      default:
        return "rgba(255,255,255,0.5)";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: opacity / 100,
        overflow: "hidden",
      }}
    >
      {particles.map((particle) => {
        const yOffset = type === "rain" || type === "snow" 
          ? ((frame * particle.speed) % (height + 50)) - 25
          : 0;

        return (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              left: particle.x,
              top: type === "confetti" ? particle.y : particle.y + yOffset,
              width: type === "rain" ? 2 : particle.size,
              height: type === "rain" ? particle.size * 4 : particle.size,
              backgroundColor: getParticleColor(),
              borderRadius: type === "rain" ? 0 : "50%",
              opacity: particle.opacity,
              transform: type === "confetti" ? `rotate(${frame * particle.speed}deg)` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

export function OverlayContainer({ overlay, children }: OverlayContainerProps) {
  if (!overlay?.enabled || overlay.type === "none") {
    return <>{children}</>;
  }

  const renderOverlay = () => {
    switch (overlay.type) {
      case "film-grain":
        return <FilmGrain opacity={overlay.opacity} />;
      case "dust":
        return <Dust opacity={overlay.opacity} />;
      case "light-leak":
        return <LightLeak opacity={overlay.opacity} color={overlay.color} />;
      case "vignette":
        return <Vignette opacity={overlay.opacity} />;
      case "lens-flare":
        return <LensFlare opacity={overlay.opacity} />;
      case "particles":
      case "snow":
      case "rain":
      case "confetti":
        return <Particles opacity={overlay.opacity} intensity={overlay.intensity} type={overlay.type} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {children}
      {renderOverlay()}
    </div>
  );
}
