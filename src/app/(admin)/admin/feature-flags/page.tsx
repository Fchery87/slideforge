"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ToggleLeft,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { FeatureFlag } from "@/domain/admin/entities/feature-flag";

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/feature-flags");
      if (!res.ok) throw new Error("Failed to load feature flags");
      const data = await res.json();
      setFlags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      setTogglingId(flag.id);
      const res = await fetch(`/api/admin/feature-flags/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !flag.enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle flag");
      setFlags((prev) =>
        prev.map((f) =>
          f.id === flag.id ? { ...f, enabled: !f.enabled } : f
        )
      );
    } catch {
      setError("Failed to toggle feature flag");
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreate = async () => {
    if (!newKey.trim()) return;
    try {
      setCreating(true);
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey, description: newDesc, enabled: false }),
      });
      if (!res.ok) throw new Error("Failed to create flag");
      setSheetOpen(false);
      setNewKey("");
      setNewDesc("");
      await fetchFlags();
    } catch {
      setError("Failed to create feature flag");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
            Feature Flags
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Toggle platform features on and off
          </p>
        </div>
        <Button
          className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
          onClick={() => setSheetOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Flag
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-500/30 bg-red-500/5 p-16">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <p className="mt-2 text-sm text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
            onClick={fetchFlags}
          >
            Retry
          </Button>
        </div>
      ) : flags.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <div className="text-center">
            <ToggleLeft className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">
              No feature flags yet
            </p>
            <Button
              variant="outline"
              className="mt-4 cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
              onClick={() => setSheetOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Flag
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#16163a] p-4"
            >
              <div>
                <p className="font-medium font-mono text-sm">{flag.key}</p>
                {flag.description && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {flag.description}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-600">
                  Updated{" "}
                  {formatDistanceToNow(new Date(flag.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <button
                onClick={() => handleToggle(flag)}
                disabled={togglingId === flag.id}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                  flag.enabled ? "bg-green-500" : "bg-slate-700"
                } ${togglingId === flag.id ? "opacity-50" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    flag.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>New Feature Flag</SheetTitle>
            <SheetDescription>
              Create a new feature flag to control platform features
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="grid gap-2">
              <Label htmlFor="flag-key">Key</Label>
              <Input
                id="flag-key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. new-export-format"
                className="border-white/[0.08] bg-[#0F0F23] font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="flag-desc">Description</Label>
              <Input
                id="flag-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this flag control?"
                className="border-white/[0.08] bg-[#0F0F23]"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
                onClick={handleCreate}
                disabled={creating || !newKey.trim()}
              >
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {creating ? "Creating..." : "Create Flag"}
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer border-white/[0.1] text-slate-300 hover:bg-white/[0.04]"
                onClick={() => setSheetOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
