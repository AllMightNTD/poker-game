"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useForgotPassword } from "../hooks/use-forgot-password";

export function ForgotPasswordForm() {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "returnLogin": "Quay lại Đăng nhập",
      "passwordRecovery": "KHÔI PHỤC MẬT KHẨU",
      "description": "Nhập email của bạn để nhận liên kết đặt lại mật khẩu",
      "email": "Địa chỉ Email",
      "sendResetLink": "GỬI LIÊN KẾT ĐẶT LẠI",
      "requestSent": "ĐÃ GỬI YÊU CẦU",
      "sendResetLinkDifferentEmail": "THỬ EMAIL KHÁC"
    };
    return translations[key] || key;
  };

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isSuccess,
    setIsSuccess,
    errorMessage,
    successMessage,
  } = useForgotPassword(t);

  // Đồng bộ Base màu hoàn toàn với LoginForm (bg-[#0B1B33], border-[#1E3A5F])
  const inputBase =
    "h-12 sm:h-13 w-full rounded-xl bg-[#0B1B33] border pl-10 sm:pl-12 pr-4 text-sm text-white placeholder:text-slate-500 transition-colors focus:ring-0 outline-none";
  const inputNormal = "border-[#1E3A5F] focus:border-[#F4B942]/70";
  const inputError = "border-rose-500 focus:border-rose-400";

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Form Card sử dụng màu nền đồng bộ với hệ thống email/login */}
      <div className="rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8">

        {!isSuccess ? (
          <>
            {/* Nút quay lại tinh tế - Đổi từ hover Đỏ sang hover Vàng Gold */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#F4B942] transition-colors mb-6 w-fit uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              {t("returnLogin")}
            </Link>

            <div className="mb-6 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                {t("passwordRecovery")}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                {t("description")}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="p-3 text-xs font-bold text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/30 uppercase tracking-wide text-center">
                  {errorMessage}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1">
                <div className="relative group">
                  <Mail
                    className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.email ? "text-rose-400" : "text-slate-500 group-focus-within:text-[#F4B942]"
                      }`}
                    size={16}
                  />
                  <input
                    type="email"
                    placeholder={t("email")}
                    {...register("email")}
                    className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button - Đồng bộ nút Vàng Chữ Tối như màn Login và Email CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 sm:h-13 w-full rounded-xl bg-[#F4B942] hover:bg-[#e2aa36] font-bold tracking-wide text-[#081326] text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center uppercase mt-6"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-[#081326]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    PROCESSING...
                  </>
                ) : (
                  t("sendResetLink")
                )}
              </button>
            </form>
          </>
        ) : (
          /* Giao diện khi gửi thành công */
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(244,185,66,0.15)]">
              <CheckCircle size={32} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
              {t("requestSent")}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 mb-8 leading-relaxed max-w-xs">
              {successMessage}
            </p>

            <div className="w-full space-y-3">
              {/* Nút chính phản hồi quay lại Login */}
              <Link
                href="/login"
                className="h-12 sm:h-13 w-full rounded-xl bg-[#F4B942] hover:bg-[#e2aa36] font-bold tracking-wide text-[#081326] text-sm flex items-center justify-center transition-colors uppercase"
              >
                {t("returnLogin")}
              </Link>

              {/* Nút phụ thử Email khác */}
              <button
                onClick={() => setIsSuccess(false)}
                className="h-11 w-full rounded-xl bg-[#0B1B33] border border-[#1E3A5F] text-slate-300 text-xs sm:text-sm font-medium hover:border-[#F4B942]/60 transition-colors uppercase tracking-wider"
              >
                {t("sendResetLinkDifferentEmail")}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}