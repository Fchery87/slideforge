"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/infrastructure/auth/auth-client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Failed to sign in");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-[#16163a] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30"
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-white/[0.08] bg-[#16163a] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30"
          placeholder="••••••••"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="mt-2 cursor-pointer bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all duration-200 hover:bg-rose-700 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)] disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-rose-400 transition-colors duration-200 hover:text-rose-300"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
