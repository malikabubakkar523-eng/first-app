"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle URL errors (e.g. from Google OAuth callback)
  useEffect(() => {
    if (urlError) {
      setErrorMessage(decodeURIComponent(urlError));
      toast({
        title: "Authentication Notice",
        description: decodeURIComponent(urlError),
        type: "error",
      });
    }
  }, [urlError, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "Welcome Back",
          description: `Signed in as ${data.user.name}`,
          type: "success",
        });

        // Automatic Role-Based Routing
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else if (
          callbackUrl &&
          callbackUrl !== "/login" &&
          callbackUrl !== "/register"
        ) {
          router.push(callbackUrl);
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        const msg = data.error || "Email or password is incorrect.";
        setErrorMessage(msg);
        toast({
          title: "Sign In Failed",
          description: msg,
          type: "error",
        });
      }
    } catch (err) {
      setErrorMessage("Unable to sign in. Please check your connection.");
      toast({
        title: "Connection Error",
        description: "An unexpected network error occurred.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    // Direct browser navigation to Google OAuth endpoint
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-2xl transition-all">
      {/* LEFT COLUMN: Luxury Brand Sneaker Showcase (Hidden or stacked on small mobile) */}
      <div className="lg:col-span-6 relative bg-zinc-900 text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800 min-h-[360px] lg:min-h-[640px]">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 space-y-2">
          <Link href="/" className="inline-block group">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black italic tracking-wider text-white">
                VELOCE<span className="text-brand-500">.</span>
              </span>
            </div>
          </Link>
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-zinc-400">
            Luxury &amp; Performance Footwear
          </p>
        </div>

        {/* Large Premium Sneaker Visual */}
        <div className="relative z-10 my-6 sm:my-8 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[16/10] max-w-sm sm:max-w-md transition-transform duration-700 hover:scale-105">
            <Image
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80"
              alt="VELOCE Performance Footwear"
              fill
              priority
              className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
            />
          </div>
          <p className="text-center text-xs text-zinc-400 font-medium italic mt-2 max-w-xs">
            &ldquo;Engineered with Tuscan craftsmanship and carbon propulsion.&rdquo;
          </p>
        </div>

        {/* 3 Luxury Pillars */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-brand-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Quality
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 line-clamp-2">
              Hand-finished Italian leather
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Performance
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 line-clamp-2">
              Nitrogen foam &amp; carbon plate
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                Timeless
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 line-clamp-2">
              Minimalist atelier aesthetics
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Luxury Sign-In Form */}
      <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white dark:bg-zinc-900/60">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-zinc-900 dark:text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Login to your VELOCE account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-brand-500 focus:ring-brand-500 cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold animate-fadeIn">
                {errorMessage}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest absolute">
              OR
            </span>
          </div>

          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold flex items-center justify-center gap-3 transition-all hover:border-zinc-400 dark:hover:border-zinc-700 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {googleLoading ? "Connecting to Google..." : "Continue with Google"}
              </span>
            </button>
          </div>

          {/* Create Account Footer */}
          <div className="text-center text-xs text-zinc-500 pt-2">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-zinc-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 underline underline-offset-2 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="text-xs text-zinc-400 font-mono">
            Loading VELOCE sign in...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
