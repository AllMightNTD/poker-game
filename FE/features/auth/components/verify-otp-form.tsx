"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useVerifyOtp } from "../hooks/use-verify-otp";

interface VerifyOtpFormProps {
  token: string | null;
  otp: string | null;
  email: string | null;
}

const OTP_LENGTH = 6;

export function VerifyOtpForm({ token: initialToken, otp: initialOtp, email: emailParam }: VerifyOtpFormProps) {
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
  } = useVerifyOtp(initialToken, initialOtp, emailParam);

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

  useEffect(() => {
    if (!initialOtp && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [initialOtp]);

  const handleInputChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
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
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const newOtp = [...otp];

    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const isOtpComplete = otp.every((val) => val !== "");

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 via-[#F4B942] to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

      <div className="relative rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Success Overlay */}
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
                KÍCH HOẠT THÀNH CÔNG!
              </h3>
              <p className="text-slate-300 text-sm max-w-xs mb-4">{successMessage}</p>
              <div className="flex items-center gap-2 text-yellow-400/80 text-xs mt-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chuyển hướng về trang Đăng nhập sau giây lát...</span>
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
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">ĐANG KÍCH HOẠT...</h3>
              <p className="text-xs text-slate-400 mt-2">
                Hệ thống đang kiểm tra chữ ký token và mã OTP...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!(token || email) ? (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400 flex items-center justify-center text-yellow-400 shadow-[0_0_20px_rgba(244,185,66,0.2)]">
              <span className="text-3.5xl">🎰</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase bg-gradient-to-r from-yellow-400 via-[#F4B942] to-amber-500 bg-clip-text text-transparent">
                Chào mừng đến với Bàn chơi Elite! 🎰
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 px-2 leading-relaxed font-medium">
                Email xác thực đã được gửi đến hộp thư của bạn. Vui lòng kiểm tra để kích hoạt tài khoản CG Poker và bắt đầu hành trình.
              </p>
            </div>

            {email && (
              <div className="inline-flex flex-col items-center justify-center p-4 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] w-full max-w-sm mx-auto shadow-inner">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">EMAIL ĐĂNG KÝ</span>
                <span className="text-sm font-semibold text-yellow-300 mt-1.5">{maskEmail(email)}</span>
              </div>
            )}

            <div className="space-y-3 pt-2 text-left">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                Mở nhanh hộp thư email của bạn
              </p>
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

            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  role="alert"
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
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isVerifying}
                className="w-full h-12 rounded-xl bg-gradient-to-b from-[#1E3A5F] to-[#0F223F] border border-[#2B548C] hover:border-yellow-400/40 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md uppercase tracking-wider"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`} />
                <span>{cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "GỬI LẠI EMAIL KÍCH HOẠT"}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-[#F4B942] font-semibold hover:underline uppercase tracking-wide">
                Quay lại Đăng nhập
              </Link>
            </div>
          </div >

        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                KÍCH HOẠT TÀI KHOẢN
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
                Vui lòng hoàn tất kích hoạt để bắt đầu hành trình Poker CG
              </p>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] flex gap-3 text-left">
              <Mail className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-white">
                  Chúng tôi mã OTP vào email của bạn.
                </p>
                <p className="text-slate-400 mt-1">
                  Vui lòng nhấp vào liên kết trong email hoặc nhập mã 6 số dưới đây để kích hoạt tài khoản.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3">
                  MÃ XÁC THỰC OTP (6 SỐ)
                </label>
                <div className="flex justify-between gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      disabled={(!token && !email) || isSuccess || isVerifying}
                      aria-label={`Chữ số OTP thứ ${idx + 1}`}
                      aria-invalid={!!errorMessage}
                      onChange={(e) => handleInputChange(e.target.value, idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      onPaste={handlePaste}
                      className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold text-white rounded-xl bg-[#0B1B33] border transition-all outline-none focus:ring-1 disabled:opacity-50 ${errorMessage
                        ? "border-rose-500 focus:border-rose-400 focus:ring-rose-400/30"
                        : "border-[#1E3A5F] focus:border-yellow-400 focus:ring-yellow-400/30"
                        }`}
                    />
                  ))}
                </div>
                {!isOtpComplete && (
                  <p className="text-slate-500 text-[11px] mt-2 ml-1">Mã OTP phải có đúng 6 chữ số.</p>
                )}
              </div>

              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    role="alert"
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

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={(!token && !email) || !isOtpComplete || isVerifying || isSuccess}
                  className="h-12 w-full rounded-xl bg-gradient-to-b from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#081326] font-bold text-sm transition-all shadow-[0_0_15px_rgba(244,185,66,0.3)] hover:shadow-[0_0_25px_rgba(244,185,66,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                >
                  {isVerifying && !initialOtp ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ĐANG KÍCH HOẠT...</span>
                    </div>
                  ) : (
                    "XÁC NHẬN KÍCH HOẠT"
                  )}
                </button>

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
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isVerifying || isSuccess}
                  className="w-full h-11 rounded-xl bg-transparent border border-[#1E3A5F] hover:border-yellow-400/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`} />
                  <span>{cooldown > 0 ? `GỬI LẠI SAU ${cooldown}S` : "GỬI LẠI OTP"}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-[#F4B942] font-semibold hover:underline uppercase tracking-wide">
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