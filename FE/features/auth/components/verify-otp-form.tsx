"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useVerifyOtp } from "../hooks/use-verify-otp";
import { FormInput, FormButton } from "@/components/ui/form";

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
    <div className="relative w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Glow effect viền ngoài */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 via-[#F4B942] to-amber-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-1000 pointer-events-none" />

      <div className="relative rounded-2xl bg-[#081326] border border-[#16294A] p-5 sm:p-8 overflow-hidden shadow-2xl">

        {/* Success Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-25 bg-[#081326] flex flex-col items-center justify-center p-5 text-center"
            >
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 sm:mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 uppercase tracking-wide">
                KÍCH HOẠT THÀNH CÔNG!
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-4">{successMessage}</p>
              <div className="flex items-center gap-2 text-yellow-400/80 text-[11px] sm:text-xs mt-4">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang chuyển hướng về trang Đăng nhập...</span>
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
              className="absolute inset-0 z-20 bg-[#081326]/95 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center"
            >
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-14 h-14 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                <Loader2 className="w-7 h-7 text-yellow-400 animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">ĐANG KÍCH HOẠT...</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-2">
                Hệ thống đang kiểm tra chữ ký token và mã OTP...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Giao diện CHƯA CÓ Token hoặc Email */}
        {!(token || email) ? (
          <div className="space-y-5 sm:space-y-6 text-center py-2 sm:py-4">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 shadow-[0_0_20px_rgba(244,185,66,0.15)]">
              <span className="text-2xl sm:text-3.5xl">🎰</span>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-lg sm:text-2xl font-bold text-white tracking-wide uppercase bg-gradient-to-r from-yellow-400 via-[#F4B942] to-amber-500 bg-clip-text text-transparent">
                Chào mừng đến với Bàn chơi Elite!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 px-1 leading-relaxed">
                Email xác thực đã được gửi đến hộp thư của bạn. Vui lòng kiểm tra để kích hoạt tài khoản CG Poker.
              </p>
            </div>

            {email && (
              <div className="inline-flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] w-full max-w-sm mx-auto">
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">EMAIL ĐĂNG KÝ</span>
                <span className="text-xs sm:text-sm font-semibold text-[#F4B942] mt-1 break-all">{maskEmail(email)}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-1 text-left">
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                Mở nhanh hộp thư của bạn
              </p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] hover:border-[#F4B942]/40 hover:bg-[#0f2445]/50 transition-all group"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">Gmail</span>
                </a>
                <a
                  href="https://outlook.live.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] hover:border-[#F4B942]/40 hover:bg-[#0f2445]/50 transition-all group"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">Outlook</span>
                </a>
                <a
                  href="https://mail.yahoo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] hover:border-[#F4B942]/40 hover:bg-[#0f2445]/50 transition-all group"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">Yahoo</span>
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
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-1 space-y-3">
              {!emailParam && (
                <FormInput
                  type="email"
                  placeholder="Nhập email của bạn để gửi lại OTP"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={cooldown > 0 || isVerifying}
                  size="small"
                />
              )}

              <FormButton
                onClick={handleResend}
                disabled={cooldown > 0 || isVerifying}
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`} />}
              >
                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại email kích hoạt"}
              </FormButton>
            </div>

            <div className="text-center pt-1">
              <Link href="/login" className="text-xs text-[#F4B942] font-semibold hover:underline uppercase tracking-wide">
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          /* Giao diện ĐÃ CÓ Token hoặc Email - Nhập 6 ô OTP */
          <div className="space-y-5 sm:space-y-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-wide uppercase">
                KÍCH HOẠT TÀI KHOẢN
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Vui lòng hoàn tất kích hoạt để bắt đầu hành trình
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] flex gap-3 text-left">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#F4B942] shrink-0 mt-0.5" />
              <div className="text-[11px] sm:text-xs">
                <p className="font-semibold text-white">
                  Chúng tôi đã gửi mã OTP vào email của bạn.
                </p>
                <p className="text-slate-400 mt-1">
                  Kiểm tra hộp thư và nhập mã 6 số phía dưới để kích hoạt nhanh tài khoản.
                </p>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-slate-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2.5">
                  MÃ XÁC THỰC OTP (6 SỐ)
                </label>

                {/* 
                  - Sử dụng grid hệ 6 cột (grid-cols-6) để tự động căn chỉnh khoảng cách đều đặn.
                  - gap-1.5 cho mobile siêu nhỏ, gap-2 cho di động vừa, gap-3 cho màn hình tablet/desktop.
                */}
                <div className="grid grid-cols-6 gap-1.5 xs:gap-2 sm:gap-3 w-full">
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
                      /* 
                        - Đổi từ w-12 h-14 cố định sang w-full kèm theo khống chế aspect-square hoặc h-11->h-16 linh hoạt theo thiết bị.
                        - Giúp 6 ô co dãn đàn hồi hoàn hảo không bao giờ lệch hay rớt dòng.
                      */
                      className={`w-full h-11 xs:h-12 sm:h-14 md:h-16 text-center text-base sm:text-xl font-bold text-white rounded-xl bg-[#0B1B33] border transition-all outline-none focus:ring-1 disabled:opacity-50 ${errorMessage
                        ? "border-rose-500 focus:border-rose-400 focus:ring-rose-400/30"
                        : "border-[#1E3A5F] focus:border-yellow-400 focus:ring-yellow-400/30"
                        }`}
                    />
                  ))}
                </div>
                {!isOtpComplete && (
                  <p className="text-slate-500 text-[10px] sm:text-xs mt-2 ml-1">Mã OTP phải có đúng 6 chữ số.</p>
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
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <FormButton
                  onClick={handleManualVerify}
                  disabled={(!token && !email) || !isOtpComplete || isVerifying || isSuccess}
                  isLoading={isVerifying && !initialOtp}
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                >
                  XÁC NHẬN KÍCH HOẠT
                </FormButton>

                {!emailParam && (
                  <FormInput
                    type="email"
                    placeholder="Nhập email của bạn để gửi lại OTP"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={cooldown > 0 || isVerifying || isSuccess}
                    size="small"
                  />
                )}

                <FormButton
                  onClick={handleResend}
                  disabled={cooldown > 0 || isVerifying || isSuccess}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`} />}
                >
                  {cooldown > 0 ? `GỬI LẠI SAU ${cooldown}S` : "GỬI LẠI OTP"}
                </FormButton>
              </div>

              <div className="text-center pt-1">
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