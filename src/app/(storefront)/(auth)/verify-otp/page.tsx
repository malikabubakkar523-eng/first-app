import React, { Suspense } from "react";
import { OtpVerificationForm } from "@/components/auth/OtpVerificationForm";

export const metadata = {
  title: "Verify Your Email | VELOCE",
  description: "Enter your 6-digit verification code to access your VELOCE account.",
};

export default function VerifyOtpPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="text-xs text-zinc-400 font-mono">
            Loading verification...
          </div>
        }
      >
        <OtpVerificationForm />
      </Suspense>
    </div>
  );
}
