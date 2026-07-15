"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useLogin } from "../hooks/use-login";

export function LoginForm() {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      welcomeBackDescription: "CHÀO MỪNG TRỞ LẠI",
      discoverMore: "Tiếp tục hành trình poker của bạn",
      yourEmailAddress: "Địa chỉ Email",
      password: "Mật khẩu",
      rememberMe: "Ghi nhớ đăng nhập",
      forgotPassword: "Quên mật khẩu?",
      loginButton: "ĐĂNG NHẬP",
      dontHaveAccount: "Bạn chưa có tài khoản?",
      registerNow: "ĐĂNG KÝ NGAY",
      orContinueWith: "HOẶC TIẾP TỤC VỚI",
    };
    return translations[key] || key;
  };

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    fieldErrors,
    rememberMe,
    setRememberMe,
    clearFieldError,
  } = useLogin(t);

  const handleFacebookLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
    window.location.href = `${backendUrl}/api/v1/auth/facebook`;
  };

  const emailHasError = !!(errors.email || fieldErrors.email);
  const passwordHasError = !!(errors.password || fieldErrors.password);

  const inputBase =
    "h-12 sm:h-13 w-full rounded-xl bg-[#0B1B33] border border-[#1E3A5F] pl-10 sm:pl-12 pr-4 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-yellow-400/70 focus:ring-0 outline-none";
  const inputError = "border-rose-500 focus:border-rose-400";

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Form Card */}
      <div className="rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            {t("welcomeBackDescription") || "WELCOME BACK"}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            {t("discoverMore") || "Continue your poker journey"}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="space-y-1">
            <div className="relative">
              <Mail
                className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${emailHasError ? "text-rose-400" : "text-slate-500"
                  }`}
              />
              <input
                id="email"
                type="email"
                placeholder={t("yourEmailAddress")}
                {...register("email", {
                  onChange: () => clearFieldError("email"),
                })}
                className={`${inputBase} ${emailHasError ? inputError : ""}`}
              />
            </div>

            <AnimatePresence mode="wait">
              {emailHasError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email?.message || fieldErrors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="relative">
              <Lock
                className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${passwordHasError ? "text-rose-400" : "text-slate-500"
                  }`}
              />
              <input
                id="password"
                type="password"
                placeholder={t("password")}
                {...register("password", {
                  onChange: () => clearFieldError("password"),
                })}
                className={`${inputBase} ${passwordHasError ? inputError : ""}`}
              />
            </div>

            <AnimatePresence mode="wait">
              {passwordHasError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password?.message || fieldErrors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between py-1">
            <button
              type="button"
              onClick={() => setRememberMe((v) => !v)}
              className="flex items-center gap-2 outline-none"
            >
              <div
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${rememberMe
                  ? "border-yellow-400 bg-yellow-400/15 text-yellow-400"
                  : "border-slate-600 text-transparent"
                  }`}
              >
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  className={`w-2.5 h-2.5 ${rememberMe ? "opacity-100" : "opacity-0"}`}
                >
                  <path
                    d="M3 7.5L5.5 10L11 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className={`text-xs sm:text-sm ${rememberMe ? "text-yellow-300" : "text-slate-400"
                  }`}
              >
                {t("rememberMe")}
              </span>
            </button>

            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm text-slate-400 hover:text-yellow-400 transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 sm:h-13 w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 font-bold tracking-wide text-[#081326] text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed uppercase"
          >
            {isSubmitting ? "PROCESSING..." : t("loginButton")}
          </button>

          <p className="text-center text-xs text-slate-400 pt-1">
            {t("dontHaveAccount")}{" "}
            <Link
              href="/register"
              className="text-yellow-400 font-semibold hover:underline"
            >
              {t("registerNow")}
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-[#16294A]" />
            <span className="text-slate-500 text-[10px] sm:text-xs font-medium tracking-wide uppercase whitespace-nowrap">
              {t("orContinueWith") || "OR CONTINUE"}
            </span>
            <div className="flex-1 h-px bg-[#16294A]" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] hover:border-yellow-400/60 transition-colors text-sm font-medium text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.8z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.09l3.66 2.8c.87-2.6 3.3-4.51 6.16-4.51z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#0B1B33] border border-[#1E3A5F] hover:border-yellow-400/60 transition-colors text-sm font-medium text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877f2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}