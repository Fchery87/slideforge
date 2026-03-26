"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Loader2,
  AlertCircle,
  Shield,
  User as UserIcon,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  storageUsedBytes: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      await fetchUsers();
    } catch {
      setError("Failed to update user role");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight">
          User Management
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage users, roles, and storage quotas
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
            onClick={fetchUsers}
          >
            Retry
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.1] p-16">
          <div className="text-center">
            <Users className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">No users found</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#16163a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#12122e]">
                <th className="px-4 py-3 text-left font-medium text-slate-400">User</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Storage</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Joined</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/[0.05] transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06]">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "No name"}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role === "admin" && (
                        <Shield className="mr-1 h-3 w-3" />
                      )}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {formatBytes(user.storageUsedBytes)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? "outline" : "destructive"}>
                      {user.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="cursor-pointer text-slate-400 hover:text-slate-200"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() =>
                            handleChangeRole(
                              user.id,
                              user.role === "admin" ? "user" : "admin"
                            )
                          }
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {user.role === "admin" ? "Make User" : "Make Admin"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
