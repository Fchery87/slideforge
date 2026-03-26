"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Loader2,
  AlertCircle,
  Users,
  Film,
  ImageIcon,
  FileDown,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalyticsData {
  totalUsers: number;
  totalSlideshows: number;
  totalMedia: number;
  totalExports: number;
  activeUsers: number;
  storageUsedBytes: number;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(0)} MB`;
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  };

  const stats = analytics
    ? [
        {
          label: "Total Users",
          value: analytics.totalUsers.toLocaleString(),
          icon: Users,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
        },
        {
          label: "Total Slideshows",
          value: analytics.totalSlideshows.toLocaleString(),
          icon: Film,
          color: "text-purple-400",
          bg: "bg-purple-500/10",
        },
        {
          label: "Total Media",
          value: analytics.totalMedia.toLocaleString(),
          icon: ImageIcon,
          color: "text-green-400",
          bg: "bg-green-500/10",
        },
        {
          label: "Total Exports",
          value: analytics.totalExports.toLocaleString(),
          icon: FileDown,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
        },
        {
          label: "Active Users",
          value: analytics.activeUsers.toLocaleString(),
          icon: TrendingUp,
          color: "text-rose-400",
          bg: "bg-rose-500/10",
        },
        {
          label: "Storage Used",
          value: formatBytes(analytics.storageUsedBytes),
          icon: Activity,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Platform usage analytics and insights
        </p>
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
            onClick={fetchAnalytics}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.08] bg-[#16163a] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
