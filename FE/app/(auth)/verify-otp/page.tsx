"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VerifyOtpForm } from "@/features/auth";
import { Loader2 } from "lucide-react";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const otp = searchParams.get("otp");
  const email = searchParams.get("email");

  return <VerifyOtpForm token={token} otp={otp} email={email} />;
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Đang tải trang xác thực...</p>
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
