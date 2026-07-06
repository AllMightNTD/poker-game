"use client";

import { useRouter as useI18nRouter, usePathname } from "@/i18n/routing";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useLogin } from "../hooks/use-login";

export function LoginForm() {
  const t = useTranslations("login");
  const locale = useLocale();
  const i18nRouter = useI18nRouter();
  const pathname = usePathname();

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
    "h-12 sm:h-14 w-full rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl pl-10 sm:pl-14 pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 transition-all focus:border-yellow-400 focus:bg-white/10 focus:shadow-[0_0_30px_rgba(255,215,0,0.2)] focus:ring-0 outline-none";
  const inputError =
    "border-rose-500 bg-rose-500/10 focus:border-rose-400 focus:shadow-[0_0_30px_rgba(244,63,94,0.2)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[30px] z-0">
        <div className="absolute -top-20 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/15 rounded-full blur-[100px] sm:blur-[140px]" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 sm:w-80 sm:h-80 bg-yellow-500/10 rounded-full blur-[80px] sm:blur-[120px]" />
      </div>

      {/* Form Card */}
      <div className="relative z-10 overflow-hidden rounded-[20px] sm:rounded-[30px] bg-gradient-to-b from-[#112A56]/90 via-[#081326]/95 to-[#050B16] backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,40,255,.2)] sm:shadow-[0_25px_80px_rgba(0,40,255,.25)] p-5 sm:p-8 mx-auto">
        {/* Inner Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-400/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase drop-shadow-md">
            {t("welcomeBackDescription") || "WELCOME BACK"}
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400 font-medium">{t("discoverMore") || "Continue your poker journey"}</p>
        </div>

        <form className="relative space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="space-y-1">
            <div className="relative group">
              <Mail
                className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${emailHasError ? "text-rose-400" : "text-blue-300 group-focus-within:text-yellow-400"}`}
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
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-rose-400 text-[10px] sm:text-xs ml-2 flex items-center gap-1 mt-1 font-medium"
                >
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {errors.email?.message || fieldErrors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="relative group">
              <Lock
                className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${passwordHasError ? "text-rose-400" : "text-blue-300 group-focus-within:text-yellow-400"}`}
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
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-rose-400 text-[10px] sm:text-xs ml-2 flex items-center gap-1 mt-1 font-medium"
                >
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {errors.password?.message || fieldErrors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between py-1 sm:py-2">
            <button
              type="button"
              onClick={() => setRememberMe((v) => !v)}
              className="flex items-center gap-1.5 sm:gap-2 group outline-none"
            >
              <div
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] sm:rounded-[4px] border flex items-center justify-center transition-all duration-300 ${rememberMe ? "border-yellow-400 bg-yellow-400/20 text-yellow-400" : "border-slate-500 bg-transparent text-transparent group-hover:border-slate-400"}`}
              >
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 transition-opacity duration-300 ${rememberMe ? "opacity-100" : "opacity-0"}`}
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
                className={`text-[11px] sm:text-sm transition-colors duration-300 ${rememberMe ? "text-yellow-300 font-semibold" : "text-slate-400 group-hover:text-slate-300"}`}
              >
                {t("rememberMe")}
              </span>
            </button>

            <Link
              href="/forgot-password"
              className="text-[11px] sm:text-sm font-semibold text-slate-400 hover:text-yellow-400 transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          {/* Inject style for shine animation directly */}
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes shine {
              0% { transform: translateX(-250%); }
              100% { transform: translateX(700%); }
            }
          `}} />

          {/* 3D Gold Metallic Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative overflow-hidden h-12 sm:h-14 w-full rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#FFF6B3] via-[#FFD84D] to-[#C79500] font-black tracking-[.2em] sm:tracking-[.25em] text-[#091321] text-xs sm:text-sm shadow-lg shadow-yellow-500/30 transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,215,0,.45)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed uppercase"
          >
            {/* Shine effect */}
            <div className="absolute left-[-50%] top-0 h-full w-8 sm:w-10 rotate-12 bg-white/40 blur-[2px] animate-[shine_3s_linear_infinite]" />
            <span className="relative z-10 drop-shadow-sm">{isSubmitting ? "PROCESSING..." : t("loginButton")}</span>
          </button>

          <p className="text-center text-[10px] sm:text-xs font-bold text-slate-400 pt-1 sm:pt-2">
            {t("dontHaveAccount")}{" "}
            <Link
              href="/register"
              className="text-yellow-400 font-extrabold ml-1 hover:underline uppercase tracking-wider transition-colors"
            >
              {t("registerNow")}
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-2 sm:gap-3 py-1 sm:py-2">
            <div className="flex-1 h-px bg-blue-700/30" />
            <span className="text-yellow-300 text-[9px] sm:text-xs font-bold tracking-[.2em] sm:tracking-[.3em] uppercase whitespace-nowrap">
              ✦ {t("orContinueWith") || "OR CONTINUE"} ✦
            </span>
            <div className="flex-1 h-px bg-blue-700/30" />
          </div>

          {/* Social Login Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400 hover:bg-white/10 transition-all text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
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
              className="flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400 hover:bg-white/10 transition-all text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                viewBox="0 0 24 24"
                fill="#1877f2"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}