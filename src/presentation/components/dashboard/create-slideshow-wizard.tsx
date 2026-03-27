"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Cake,
  Heart,
  GraduationCap,
  Baby,
  PartyPopper,
  Calendar,
  Monitor,
  Smartphone,
  Square,
  Maximize,
  FileText,
  Wand2,
} from "lucide-react";

type OccasionType = "birthday" | "wedding" | "anniversary" | "memorial" | "graduation" | "baby_shower" | "family_recap" | "holiday" | "presentation" | "custom";
type AspectRatio = "16:9" | "9:16" | "4:3" | "1:1";

interface OccasionOption {
  id: OccasionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
}

const OCCASIONS: OccasionOption[] = [
  { id: "birthday", label: "Birthday", icon: Cake, color: "text-pink-400", bgGlow: "from-pink-500/20 to-rose-500/10" },
  { id: "wedding", label: "Wedding", icon: Heart, color: "text-rose-400", bgGlow: "from-rose-500/20 to-red-500/10" },
  { id: "anniversary", label: "Anniversary", icon: Heart, color: "text-red-400", bgGlow: "from-red-500/20 to-orange-500/10" },
  { id: "memorial", label: "Memorial", icon: Sparkles, color: "text-violet-400", bgGlow: "from-violet-500/20 to-purple-500/10" },
  { id: "graduation", label: "Graduation", icon: GraduationCap, color: "text-amber-400", bgGlow: "from-amber-500/20 to-yellow-500/10" },
  { id: "baby_shower", label: "Baby Shower", icon: Baby, color: "text-sky-400", bgGlow: "from-sky-500/20 to-blue-500/10" },
  { id: "family_recap", label: "Family Recap", icon: PartyPopper, color: "text-emerald-400", bgGlow: "from-emerald-500/20 to-green-500/10" },
  { id: "holiday", label: "Holiday", icon: Calendar, color: "text-orange-400", bgGlow: "from-orange-500/20 to-amber-500/10" },
  { id: "presentation", label: "Presentation", icon: Monitor, color: "text-slate-400", bgGlow: "from-slate-500/20 to-gray-500/10" },
  { id: "custom", label: "Custom", icon: Wand2, color: "text-cyan-400", bgGlow: "from-cyan-500/20 to-teal-500/10" },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "16:9", label: "Landscape", desc: "16:9 — Best for TV & desktop", icon: Monitor },
  { id: "9:16", label: "Portrait", desc: "9:16 — Best for mobile & stories", icon: Smartphone },
  { id: "4:3", label: "Standard", desc: "4:3 — Classic presentation", icon: FileText },
  { id: "1:1", label: "Square", desc: "1:1 — Social media posts", icon: Square },
];

interface CreateSlideshowWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSlideshowWizard({ isOpen, onClose }: CreateSlideshowWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [occasionType, setOccasionType] = useState<OccasionType | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!occasionType) return;
    setCreating(true);
    try {
      const res = await fetch("/api/slideshows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || `Untitled ${OCCASIONS.find(o => o.id === occasionType)?.label} Slideshow`,
          occasionType,
          aspectRatio,
        }),
      });
      const slideshow = await res.json();
      router.push(`/editor/${slideshow.id}`);
    } catch (err) {
      console.error("Failed to create slideshow:", err);
    } finally {
      setCreating(false);
    }
  }, [occasionType, aspectRatio, title, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0c0c1d] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold">
              Create New Slideshow
            </h2>
            <p className="text-xs text-slate-500">Step {step} of 3</p>
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[320px] px-6 py-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-200">What&apos;s the occasion?</h3>
                <p className="mt-1 text-xs text-slate-500">Choose what this slideshow is for</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {OCCASIONS.map((occasion) => {
                  const Icon = occasion.icon;
                  const isSelected = occasionType === occasion.id;
                  return (
                    <button
                      key={occasion.id}
                      onClick={() => setOccasionType(occasion.id)}
                      className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                        isSelected
                          ? "border-rose-500 bg-gradient-to-b from-rose-500/10 to-transparent"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${occasion.bgGlow} ${isSelected ? "ring-2 ring-rose-500/30" : ""}`}>
                        <Icon className={`h-5 w-5 ${occasion.color}`} />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-slate-400"}`}>
                        {occasion.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-200">Choose aspect ratio</h3>
                <p className="mt-1 text-xs text-slate-500">Select the canvas size for your slideshow</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ASPECT_RATIOS.map((ratio) => {
                  const Icon = ratio.icon;
                  const isSelected = aspectRatio === ratio.id;
                  return (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`group relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                        isSelected
                          ? "border-rose-500 bg-gradient-to-r from-rose-500/10 to-transparent"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isSelected ? "bg-rose-500/20" : "bg-white/[0.04]"}`}>
                        <Icon className={`h-6 w-6 ${isSelected ? "text-rose-400" : "text-slate-400"}`} />
                      </div>
                      <div className="text-left">
                        <p className={`font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>{ratio.label}</p>
                        <p className="text-xs text-slate-500">{ratio.desc}</p>
                      </div>
                      {/* Aspect ratio preview */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div
                          className={`rounded border-2 ${isSelected ? "border-rose-500" : "border-white/[0.1]"}`}
                          style={{
                            width: ratio.id === "9:16" ? 24 : ratio.id === "1:1" ? 32 : 48,
                            height: ratio.id === "9:16" ? 48 : ratio.id === "1:1" ? 32 : 27,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-200">Name your slideshow</h3>
                <p className="mt-1 text-xs text-slate-500">Give it a memorable title</p>
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Untitled ${OCCASIONS.find(o => o.id === occasionType)?.label} Slideshow`}
                className="h-12 border-white/[0.08] bg-white/[0.02] text-base text-white placeholder:text-slate-600"
                autoFocus
              />
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <h4 className="text-xs font-medium text-slate-400">Summary</h4>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${OCCASIONS.find(o => o.id === occasionType)?.color.replace("text-", "bg-")}`} />
                    <span className="text-slate-300">{OCCASIONS.find(o => o.id === occasionType)?.label}</span>
                  </div>
                  <div className="text-slate-600">•</div>
                  <div className="text-slate-300">{aspectRatio}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="text-slate-400 hover:text-slate-200"
          >
            {step === 1 ? "Cancel" : (
              <>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </>
            )}
          </Button>
          <Button
            onClick={step < 3 ? () => setStep(step + 1) : handleCreate}
            disabled={step === 1 && !occasionType || creating}
            className="bg-rose-600 text-white hover:bg-rose-700"
          >
            {creating ? (
              "Creating..."
            ) : step < 3 ? (
              <>
                Next
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" />
                Create Slideshow
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
