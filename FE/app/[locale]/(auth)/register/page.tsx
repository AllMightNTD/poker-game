"use client";

import { useRegister } from "@/features/auth/hooks/use-register";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AtSign, Lock, Mail, User, Zap } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRouter as useI18nRouter, usePathname } from "@/i18n/routing";
import { useEffect } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("register");
  const locale = useLocale();
  const i18nRouter = useI18nRouter();
  const pathname = usePathname();
  const { register, handleSubmit, errors, isSubmitting } = useRegister(t);

  const changeLanguage = (newLocale: string) => {
    localStorage.setItem("know_block_locale", newLocale);
    i18nRouter.replace(pathname, { locale: newLocale });
  };

  // Mock authentication check
  useEffect(() => {
    const isLoggedIn = false; // Thay thế bằng logic auth thực tế của bạn sau
    if (isLoggedIn) {
      router.push("/");
    }
  }, [router]);

  const inputBase =
    "w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 text-slate-700 placeholder:text-slate-400 focus:ring-4 bg-white/60 focus:border-blue-500";
  const inputError = "border-red-400 ring-2 ring-red-100 bg-red-50/30 focus:ring-red-400/20";
  const inputNormal = "border-slate-200/80 focus:ring-blue-500/10";

  return (
    // NỀN THUẦN SOCIALA: Đồng nhất với trang Login, sử dụng CSS Gradient không dùng ảnh ngoài
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans bg-slate-50 overflow-hidden">

      {/* CÁC KHỐI NỀN SINH ĐỘNG (ABSTRACT BLOBS) - Đồng bộ hiệu ứng chuyển động màu sắc */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-blue-200/40 to-sky-100/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-gradient-to-br from-blue-300/20 to-teal-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[30%] right-[15%] w-[30vw] h-[30vw] bg-blue-50/60 rounded-full blur-[60px] pointer-events-none" />

      {/* HEADER ĐỒNG NHẤT */}
      <header className="w-full px-6 lg:px-16 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 text-blue-600 group">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 transform transition-transform group-hover:scale-105 duration-300">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800">
            Sociala<span className="text-blue-500">.</span>
          </span>
        </div>
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

      {/* KHU VỰC TRUNG TÂM: CARD ĐĂNG KÝ KIỂU GLASSMORPHISM */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-xl shadow-blue-900/5 border border-white p-8 lg:p-12 flex flex-col">

          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
              {t("createYourAccount")}
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {t("join")}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="space-y-1">
              <div className="relative group">
                <User
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.name ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`}
                  size={18}
                />
                <input
                  type="text"
                  placeholder={t("yourName")}
                  {...register("name")}
                  className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.name && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-500 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle size={12} /> {errors.name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Username Input */}
            <div className="space-y-1">
              <div className="relative group">
                <AtSign
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.username ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`}
                  size={18}
                />
                <input
                  type="text"
                  placeholder={t("yourUsername")}
                  {...register("username")}
                  className={`${inputBase} ${errors.username ? inputError : inputNormal}`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.username && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-500 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle size={12} /> {errors.username.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <div className="relative group">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.email ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`}
                  size={18}
                />
                <input
                  type="email"
                  placeholder={t("yourEmailAddress")}
                  {...register("email")}
                  className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-500 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle size={12} /> {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.password ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`}
                  size={18}
                />
                <input
                  type="password"
                  placeholder={t("password")}
                  {...register("password")}
                  className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-500 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle size={12} /> {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.confirmPassword ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-500"}`}
                  size={18}
                />
                <input
                  type="password"
                  placeholder={t("confirmPassword")}
                  {...register("confirmPassword")}
                  className={`${inputBase} ${errors.confirmPassword ? inputError : inputNormal}`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.confirmPassword && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-500 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle size={12} /> {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="terms"
                  {...register("terms")}
                  className="w-4 h-4 rounded-md border-slate-300 text-blue-500 focus:ring-blue-500/20 cursor-pointer transition-colors duration-200"
                />
                <label htmlFor="terms" className={`text-xs font-bold cursor-pointer transition-colors ${errors.terms ? "text-red-500" : "text-slate-400 hover:text-slate-600"}`}>
                  {t("acceptTerm")}
                </label>
              </div>
              <AnimatePresence mode="wait">
                {errors.terms && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {errors.terms.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Register Button - Đổi từ Slate-800 sang Gradient Xanh Dương tươi sáng */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("processing")}
                </>
              ) : (
                t("registerButton")
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-xs font-bold text-slate-400 pt-2">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="text-blue-500 font-extrabold ml-1 hover:underline">
                {t("login")}
              </Link>
            </p>
          </form>
        </div>
      </main>

      {/* FOOTER ĐỒNG NHẤT */}
      <footer className="w-full py-6 text-center text-[11px] font-bold text-slate-400 tracking-wider relative z-10">
        SOCIALA NETWORK &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}