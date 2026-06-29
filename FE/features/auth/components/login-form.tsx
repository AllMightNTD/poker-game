"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Lock, Mail, Zap } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter as useI18nRouter, usePathname } from "@/i18n/routing";
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

  const changeLanguage = (newLocale: string) => {
    localStorage.setItem("know_block_locale", newLocale);
    i18nRouter.replace(pathname, { locale: newLocale });
  };

  const handleFacebookLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
    window.location.href = `${backendUrl}/api/v1/auth/facebook`;
  };

  const emailHasError = !!(errors.emailOrPhone || fieldErrors.email);
  const passwordHasError = !!(errors.password || fieldErrors.password);

  const inputBase =
    "w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all duration-300 text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 bg-white/60";
  const inputNormal = "border-slate-200/80 focus:border-blue-500";
  const inputError = "border-red-400 ring-2 ring-red-100 bg-red-50/30 focus:ring-red-400/20";

  return (
    // NỀN THUẦN SOCIALA: Trắng và Xanh dương nhạt đan xen mềm mại bằng CSS Gradient, không dùng ảnh ngoài
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans bg-slate-50 overflow-hidden">

      {/* CÁC KHỐI NỀN SINH ĐỘNG (ABSTRACT BLOBS) - Tạo hiệu ứng chiều sâu tự nhiên, đồng nhất */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-blue-200/40 to-sky-100/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-gradient-to-br from-blue-300/20 to-teal-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] right-[15%] w-[30vw] h-[30vw] bg-blue-50/60 rounded-full blur-[60px] pointer-events-none" />

      {/* HEADER */}
      <header className="w-full px-6 lg:px-16 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 text-blue-600 group">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 transform transition-transform group-hover:scale-105 duration-300">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800">
            Sociala<span className="text-blue-500">.</span>
          </span>
        </div>

        {/* Bộ chuyển ngôn ngữ tối giản */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/50 shadow-sm">
          <span 
            onClick={() => changeLanguage("en")}
            className={`cursor-pointer transition-colors ${locale === "en" ? "text-blue-600" : "hover:text-blue-500"}`}
          >EN</span>
          <span className="text-slate-200">|</span>
          <span 
            onClick={() => changeLanguage("ja")}
            className={`cursor-pointer transition-colors ${locale === "ja" ? "text-blue-600" : "hover:text-blue-500"}`}
          >JA</span>
          <span className="text-slate-200">|</span>
          <span 
            onClick={() => changeLanguage("vi")}
            className={`cursor-pointer transition-colors ${locale === "vi" ? "text-blue-600" : "hover:text-blue-500"}`}
          >VI</span>
        </div>
      </header>

      {/* TRUNG TÂM: FORM ĐĂNG NHẬP NỔI BẬT TRÊN NỀN TRẮNG XANH */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-[460px] bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-xl shadow-blue-900/5 border border-white p-8 lg:p-12 flex flex-col">

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
              {t("welcomeBackDescription")}
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {t("discoverMore")}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="space-y-1">
              <div className="relative group">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${emailHasError ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`}
                  size={18}
                />
                <input
                  id="emailOrPhone"
                  type="email"
                  placeholder={t("yourEmailAddress")}
                  {...register("emailOrPhone", {
                    onChange: () => clearFieldError("email"),
                  })}
                  className={`${inputBase} ${emailHasError ? inputError : inputNormal}`}
                />
              </div>

              <AnimatePresence mode="wait">
                {errors.emailOrPhone && !fieldErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-red-500 text-xs ml-1 flex items-center gap-1 mt-1 font-medium"
                  >
                    <AlertCircle size={12} />
                    {errors.emailOrPhone.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${passwordHasError ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`}
                  size={18}
                />
                <input
                  id="password"
                  type="password"
                  placeholder={t("password")}
                  {...register("password", {
                    onChange: () => clearFieldError("password"),
                  })}
                  className={`${inputBase} ${passwordHasError ? inputError : inputNormal}`}
                />
              </div>

              <AnimatePresence mode="wait">
                {errors.password && !fieldErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-red-500 text-xs ml-1 flex items-center gap-1 mt-1 font-medium"
                  >
                    <AlertCircle size={12} />
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between py-1">
              <button
                type="button"
                onClick={() => setRememberMe((v) => !v)}
                className="flex items-center gap-2.5 group"
              >
                <div className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${rememberMe ? "bg-blue-500" : "bg-slate-200"}`}>
                  <motion.div
                    animate={{ x: rememberMe ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="absolute top-[2px] w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </div>
                <span className={`text-xs font-bold transition-colors duration-200 ${rememberMe ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                  {t("rememberMe")}
                </span>
              </button>

              <Link href="/forgot-password" className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors">
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Nút Đăng Nhập Đậm Chất Sinh Động */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? "Processing..." : t("loginButton")}
            </button>

            <p className="text-center text-xs font-bold text-slate-400 pt-2">
              {t("dontHaveAccount")}{" "}
              <Link href="/register" className="text-blue-500 font-extrabold ml-1 hover:underline">
                {t("registerNow")}
              </Link>
            </p>

            {/* Đường chia cách */}
            <div className="relative flex items-center justify-center py-3">
              <div className="w-full border-t border-slate-100"></div>
              <span className="absolute px-4 text-[10px] font-bold text-slate-400 bg-white/90 rounded-full tracking-widest uppercase">
                {t("orContinueWith")}
              </span>
            </div>

            {/* Nút Mạng Xã Hội */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all text-xs font-bold shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.8z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.8c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleFacebookLogin}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#1877f2] text-white hover:bg-[#166fe5] transition-all text-xs font-bold shadow-sm shadow-blue-600/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-6 text-center text-[11px] font-bold text-slate-400 tracking-wider relative z-10">
        SOCIALA NETWORK &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}