"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface StorageBarProps {
  userId: string;
}

export function StorageBar({ userId }: StorageBarProps) {
  const [storage, setStorage] = useState<{
    usedBytes: number;
    quotaBytes: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStorage() {
      try {
        const res = await fetch("/api/user/storage");
        if (res.ok) {
          const data = await res.json();
          setStorage(data);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchStorage();
  }, []);

  const usedMB = storage
    ? (storage.usedBytes / 1048576).toFixed(0)
    : "0";
  const quotaGB = storage
    ? (storage.quotaBytes / 1073741824).toFixed(0)
    : "5";
  const percentage = storage
    ? Math.min(100, Math.round((storage.usedBytes / storage.quotaBytes) * 100))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-400">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-rose-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-slate-400">
        {usedMB} MB / {quotaGB} GB used ({percentage}%)
      </p>
    </div>
  );
}
