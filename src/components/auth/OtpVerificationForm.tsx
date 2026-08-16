"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { ShieldCheck, Loader2, ArrowRight, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OtpVerificationFormProps {
  initialEmail?: string;
  initialPurpose?: "GOOGLE_LOGIN" | "PASSWORD_RESET";
  onSuccess?: (data: { resetToken?: string; user?: any }) => void;
}

export function OtpVerificationForm({
  initialEmail,
  initialPurpose = "GOOGLE_LOGIN",
  onSuccess,
}: OtpVerificationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const email = initialEmail || searchParams.get("email") || "";
  const purpose = initialPurpose || (searchParams.get("purpose") as any) || "GOOGLE_LOGIN";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mask email for display: j***@domain.com
  const maskedEmail = React.useMemo(() => {
    if (!email) return "your email";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const name = parts[0];
    const masked =
      name.length > 2
        ? `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`
        : `${name[0]}*`;
    return `${masked}@${parts[1]}`;
  }, [email]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    setErrorMessage("");

    // Handle full paste
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
          newOtp[i] = pasted[i] || "";
        }
        setOtp(newOtp);
        const nextFocus = Math.min(pasted.length, 5);
        inputRefs.current[nextFocus]?.focus();

        // If 6 digits filled, auto-submit
        if (pasted.length === 6) {
          handleVerifyCode(pasted);
        }
      }
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      handleVerifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          purpose,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "Verification Successful",
          description:
            purpose === "GOOGLE_LOGIN"
              ? "Welcome to VELOCE."
              : "Email verified. You may now reset your password.",
          type: "success",
        });

        if (onSuccess) {
          onSuccess(data);
        } else if (purpose === "GOOGLE_LOGIN") {
          router.push(data.redirectUrl || "/");
          router.refresh();
        }
      } else {
        setErrorMessage(data.error || "Incorrect verification code.");
        toast({
          title: "Verification Failed",
          description: data.error || "Please check the code and try again.",
          type: "error",
        });
      }
    } catch (err) {
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCooldown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        toast({
          title: "Code Dispatched",
          description: "A new 6-digit code has been sent to your email.",
          type: "success",
        });
      } else {
        setErrorMessage(data.error || "Failed to resend code.");
        if (data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
      }
    } catch (err) {
      setErrorMessage("Network error while requesting code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 shadow-2xl space-y-6 animate-scaleIn">
      {/* Top Icon & Header */}
      <div className="text-center space-y-3 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mb-1">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold font-display text-zinc-900 dark:text-white">
          Verify your email
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
          We sent a 6-digit verification code to{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-200">
            {maskedEmail}
          </span>
        </p>
      </div>

      {/* 6 Digit Input Boxes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all select-all"
            />
          ))}
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-500 text-center font-semibold animate-fadeIn">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={() => handleVerifyCode()}
        disabled={loading || otp.join("").length !== 6}
        className="w-full py-3.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Code...</span>
          </>
        ) : (
          <>
            <span>Verify & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Resend & Cooldown Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
        <Link
          href="/login"
          className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <div>
          {cooldown > 0 ? (
            <span className="font-mono text-zinc-400">
              Resend code in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 cursor-pointer"
            >
              {resending ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : null}
              <span>Resend Code</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
