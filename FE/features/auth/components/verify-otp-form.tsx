"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useVerifyOtp } from "../hooks/use-verify-otp";

interface VerifyOtpFormProps {
  token: string | null;
  otp: string | null;
  email: string | null;
}

export function VerifyOtpForm({ token: initialToken, otp: initialOtp, email: emailParam }: VerifyOtpFormProps) {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      verifyTitle: "KÍCH HOẠT TÀI KHOẢN",
      verifyDescription: "Vui lòng hoàn tất kích hoạt để bắt đầu hành trình Poker CG",
      resendOtp: "GỬI LẠI OTP",
      cooldownText: "GỬI LẠI SAU {time}S",
      verifyButton: "XÁC NHẬN KÍCH HOẠT",
      activating: "ĐANG KÍCH HOẠT...",
      activationSuccess: "KÍCH HOẠT THÀNH CÔNG!",
      redirecting: "Chuyển hướng về trang Đăng nhập sau giây lát...",
      checkEmailInstruction: "Chúng tôi đã gửi link xác thực và mã OTP vào email của bạn.",
      checkEmailDetail: "Vui lòng nhấp vào liên kết trong email hoặc nhập mã 6 số dưới đây để kích hoạt tài khoản.",
      enterOtpManually: "MÃ XÁC THỰC OTP (6 SỐ)",
      invalidOtpLength: "Mã OTP phải có đúng 6 chữ số.",
      missingToken: "Không tìm thấy token kích hoạt. Vui lòng kiểm tra email của bạn hoặc đăng ký lại.",
    };
    return translations[key] || key;
  };

  const {
    otp,
    setOtp,
    isVerifying,
    isSuccess,
    errorMessage,
    successMessage,
    cooldown,
    email,
    setEmail,
    token,
    handleManualVerify,
    handleResend,
  } = useVerifyOtp(initialToken, initialOtp, emailParam, t);

  const maskEmail = (emailStr: string) => {
    if (!emailStr) return "";
    const [local, domain] = emailStr.split("@");
    if (!local || !domain) return emailStr;
    if (local.length <= 3) {
      return `${local[0]}***@${domain}`;
    }
    return `${local.slice(0, 2)}***${local.slice(-2)}@${domain}`;
  };

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatically focus the first empty input box on load if no auto-verification is happening
  useEffect(() => {
    if (!initialOtp && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [initialOtp]);

  const handleInputChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep the last character
    setOtp(newOtp);

    // Auto-focus next input if not empty
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return; // Only digits

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    // Focus the last filled box or next empty one
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const isOtpComplete = otp.every((val) => val !== "");

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glow effect matching CG Poker style */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 via-[#F4B942] to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      
      {/* Form Card */}
      <div className="relative rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8 overflow-hidden shadow-2xl">
        
        {/* Verification Success Screen Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-25 bg-[#081326] flex flex-col items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                {t("activationSuccess")}
              </h3>
              <p className="text-slate-300 text-sm max-w-xs mb-4">
                {successMessage}
              </p>
              <div className="flex items-center gap-2 text-yellow-400/80 text-xs mt-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("redirecting")}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1-Click Verification Loading Overlay */}
        <AnimatePresence>
          {isVerifying && initialOtp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-[#081326]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-16 h-16 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                <Loader2 className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                {t("activating")}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Hệ thống đang kiểm tra chữ ký token và mã OTP...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome screen without token OR normal verify screen with token */}
        {!token ? (
          <div className="space-y-6 text-center py-4">
            {/* Celebration Icon/Graphic */}
            <div className="mx-auto w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400 flex items-center justify-center text-yellow-400 shadow-[0_0_20px_rgba(244,185,66,0.2)]">
              <span className="text-3.5xl">🎰</span>
            </div>

            {/* Welcome header & description */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase bg-gradient-to-r from-yellow-400 via-[#F4B942] to-amber-500 bg-clip-text text-transparent">
                Welcome to the Elite Table! 🎰
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 px-2 leading-relaxed font-medium">
                A verification email has been sent to your inbox. Please check it to activate your CG Poker account and start your journey.
              </p>
            </div>

            {/* Masked Email Badge */}
            {email && (
              <div className="inline-flex flex-col items-center justify-center p-4 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] w-full max-w-sm mx-auto shadow-inner">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">EMAIL ĐĂNG KÝ</span>
                <span className="text-sm font-semibold text-yellow-300 mt-1.5">{maskEmail(email)}</span>
              </div>
            )}

            {/* Deep Links to Email Apps */}
            <div className="space-y-3 pt-2 text-left">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Mở nhanh hộp thư email của bạn</p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] hover:border-yellow-400/40 hover:bg-[#0f2445]/50 transition-all group shadow-sm"
                >
                  <Mail className="w-5 h-5 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-300">Gmail</span>
                </a>
                <a
                  href="https://outlook.live.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] hover:border-yellow-400/40 hover:bg-[#0f2445]/50 transition-all group shadow-sm"
                >
                  <Mail className="w-5 h-5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-300">Outlook</span>
                </a>
                <a
                  href="https://mail.yahoo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] hover:border-yellow-400/40 hover:bg-[#0f2445]/50 transition-all group shadow-sm"
                >
                  <Mail className="w-5 h-5 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-300">Yahoo</span>
                </a>
              </div>
            </div>

            {/* Error Message if Resend Fails */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 text-left"
                >
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resend Action */}
            <div className="pt-2 space-y-4">
              {!emailParam && (
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn để gửi lại OTP"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl bg-[#0B1B33] border border-[#1E3A5F] px-4 text-xs text-white placeholder:text-slate-500 transition-colors focus:border-yellow-400/70 outline-none text-center"
                  />
                </div>
              )}

              <button
                onClick={handleResend}
                disabled={cooldown > 0 || isVerifying}
                className="w-full h-12 rounded-xl bg-gradient-to-b from-[#1E3A5F] to-[#0F223F] border border-[#2B548C] hover:border-yellow-400/40 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md uppercase tracking-wider"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`} />
                <span>
                  {cooldown > 0
                    ? `Gửi lại sau ${cooldown}s`
                    : "GỬI LẠI EMAIL KÍCH HOẠT"}
                </span>
              </button>
            </div>

            {/* Return to Login */}
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-[#F4B942] font-semibold hover:underline uppercase tracking-wide"
              >
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                {t("verifyTitle")}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
                {t("verifyDescription")}
              </p>
            </div>

            {/* Notification Box */}
            <div className="mb-6 p-4 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] flex gap-3 text-left">
              <Mail className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-white">{t("checkEmailInstruction")}</p>
                <p className="text-slate-400 mt-1">{t("checkEmailDetail")}</p>
              </div>
            </div>

            {/* OTP Input Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3">
                  {t("enterOtpManually")}
                </label>
                <div className="flex justify-between gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      disabled={!token || isSuccess || isVerifying}
                      onChange={(e) => handleInputChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      onPaste={handlePaste}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold text-white rounded-xl bg-[#0B1B33] border border-[#1E3A5F] transition-all outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 disabled:opacity-50"
                    />
                  ))}
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2"
                  >
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleManualVerify}
                  disabled={!token || !isOtpComplete || isVerifying || isSuccess}
                  className="h-12 w-full rounded-xl bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#081326] font-bold text-sm transition-all shadow-[0_0_15px_rgba(244,185,66,0.3)] hover:shadow-[0_0_25px_rgba(244,185,66,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                >
                  {isVerifying && !initialOtp ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("activating")}</span>
                    </div>
                  ) : (
                    t("verifyButton")
                  )}
                </button>

                {/* Email input field if no email is set or if requesting resend */}
                {!emailParam && (
                  <div className="relative group pt-1">
                    <input
                      type="email"
                      placeholder="Nhập email của bạn để gửi lại OTP"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-xl bg-[#0B1B33] border border-[#1E3A5F] pl-4 pr-4 text-xs text-white placeholder:text-slate-500 transition-colors focus:border-yellow-400/70 outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || isVerifying || isSuccess}
                  className="w-full h-11 rounded-xl bg-transparent border border-[#1E3A5F] hover:border-yellow-400/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`} />
                  <span>
                    {cooldown > 0
                      ? t("cooldownText").replace("{time}", cooldown.toString())
                      : t("resendOtp")}
                  </span>
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-[#F4B942] font-semibold hover:underline uppercase tracking-wide"
                >
                  Quay lại Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
