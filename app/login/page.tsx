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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] mix-blend-multiply delay-700 animate-pulse" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/30 mb-6 transform hover:scale-105 transition-transform duration-300">
            <span className="text-3xl font-bold tracking-tighter">N</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Nisarga</h1>
          <p className="text-slate-500 mt-2 font-medium">Inventory Management System</p>
        </div>

        <div className="glass rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          {/* Role selector */}
          <p className="text-sm font-semibold text-slate-600 mb-4 tracking-wide uppercase">Sign in as</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedRole("ADMIN")}
              className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                selectedRole === "ADMIN"
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50/50"
              }`}
            >
              <div className={`p-3 rounded-xl transition-colors duration-200 ${selectedRole === "ADMIN" ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
                <span className="text-2xl block transform group-hover:scale-110 transition-transform">🏪</span>
              </div>
              <span className="text-sm font-semibold">Store Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("MANAGER")}
              className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
                selectedRole === "MANAGER"
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50/50"
              }`}
            >
              <div className={`p-3 rounded-xl transition-colors duration-200 ${selectedRole === "MANAGER" ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
                <span className="text-2xl block transform group-hover:scale-110 transition-transform">👷</span>
              </div>
              <span className="text-sm font-semibold">Manager</span>
            </button>
          </div>

          {/* Form — shown after role selection */}
          {selectedRole && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors shadow-sm placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-slate-900 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors shadow-sm placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Secure Sign In"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
