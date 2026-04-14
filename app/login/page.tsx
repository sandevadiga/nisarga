"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "MANAGER";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }

    router.push(data.user.role === "ADMIN" ? "/admin" : "/manager");
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Nisarga</h1>
          <p className="text-zinc-500 mt-1 text-sm">Inventory Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          {/* Role selector */}
          <p className="text-sm font-medium text-zinc-600 mb-3">Sign in as</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole("ADMIN")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedRole === "ADMIN"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              <span className="text-2xl">🏪</span>
              <span className="text-sm font-medium">Store Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("MANAGER")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedRole === "MANAGER"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              <span className="text-2xl">👷</span>
              <span className="text-sm font-medium">Manager</span>
            </button>
          </div>

          {/* Form — shown after role selection */}
          {selectedRole && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === "ADMIN"
                      ? "admin@nisarga.com"
                      : "manager@nisarga.com"
                  }
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
