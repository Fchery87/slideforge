"use client";

import { useEffect, useState, useCallback } from "react";
import {
  HardDrive,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Database,
  Cloud,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  latencyMs?: number;
  message?: string;
}

interface SystemData {
  services: ServiceStatus[];
  version?: string;
  uptime?: string;
}

export default function AdminSystemPage() {
  const [system, setSystem] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/system");
      if (!res.ok) throw new Error("Failed to load system status");
      const data = await res.json();
      setSystem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystem();
  }, [fetchSystem]);

  const serviceIcons: Record<string, typeof Database> = {
    database: Database,
    db: Database,
    postgres: Database,
    storage: Cloud,
    r2: Cloud,
    auth: Shield,
    s3: Cloud,
  };

  const statusConfig = {
    healthy: {
      label: "Operational",
      color: "text-green-400",
      bg: "bg-green-500/10",
      dot: "bg-green-500",
    },
    degraded: {
      label: "Degraded",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      dot: "bg-amber-500",
    },
    down: {
      label: "Down",
      color: "text-red-400",
      bg: "bg-red-500/10",
      dot: "bg-red-500",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
          System Health
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Database, storage, and render worker status
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
            onClick={fetchSystem}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          {system?.services && system.services.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {system.services.map((service) => {
                const cfg = statusConfig[service.status];
                const ServiceIcon =
                  serviceIcons[service.name.toLowerCase()] ?? HardDrive;
                return (
                  <div
                    key={service.name}
                    className="rounded-xl border border-white/[0.08] bg-[#16163a] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.bg}`}
                        >
                          <ServiceIcon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {service.name}
                          </p>
                          {service.latencyMs !== undefined && (
                            <p className="text-[11px] text-slate-500">
                              {service.latencyMs}ms latency
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${cfg.dot} animate-pulse`}
                        />
                        <span className={`text-xs font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    {service.message && (
                      <p className="mt-3 rounded-lg bg-white/[0.03] p-2 text-xs text-slate-400">
                        {service.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
              <div className="text-center">
                <HardDrive className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 text-sm text-slate-500">
                  No system services configured
                </p>
              </div>
            </div>
          )}

          {system && (
            <div className="rounded-xl border border-white/[0.08] bg-[#16163a] p-5">
              <h3 className="font-[family-name:var(--font-syne)] text-sm font-semibold text-slate-400">
                System Info
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4">
                {system.version && (
                  <div>
                    <p className="text-xs text-slate-500">Version</p>
                    <p className="mt-0.5 font-mono text-sm">{system.version}</p>
                  </div>
                )}
                {system.uptime && (
                  <div>
                    <p className="text-xs text-slate-500">Uptime</p>
                    <p className="mt-0.5 font-mono text-sm">{system.uptime}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
