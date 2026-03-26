"use client";

import { useState } from "react";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(user.name || "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccess(false);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // silent fail for now
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06]">
          <User className="h-6 w-6 text-slate-500" />
        </div>
        <div>
          <p className="font-medium">{user.name || "No name set"}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
          className="border-white/[0.08] bg-[#0F0F23]"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Input
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          className="border-white/[0.08] bg-[#0F0F23]"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {success && (
          <span className="text-sm text-green-400">
            Profile updated successfully
          </span>
        )}
      </div>
    </form>
  );
}
