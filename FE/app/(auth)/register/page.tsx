"use client";

import { useRegister } from "@/features/auth/hooks/use-register";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AtSign, Lock, Mail, User } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "createYourAccount": "CREATE ACCOUNT",
      "join": "Join the ultimate poker experience",
      "yourName": "Full Name",
      "yourUsername": "Username",
      "yourEmailAddress": "Email Address",
      "password": "Password",
      "confirmPassword": "Confirm Password",
      "acceptTerm": "I accept the Terms and Conditions",
      "registerButton": "REGISTER",
      "alreadyHaveAccount": "Already have an account?",
      "login": "LOGIN"
    };
    return translations[key] || key;
  };
  const { register, handleSubmit, errors, isSubmitting } = useRegister(t);



  const inputBase =
    "w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all duration-300 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#F4B942]/50 bg-black/50 backdrop-blur-md";
  const inputNormal = "border border-white/10 focus:border-[#F4B942]/80";
  const inputError = "border border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-500/10 focus:ring-rose-500/40";

  return (
    <div className="w-full">


      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black text-white tracking-tight leading-tight uppercase">
          {t("createYourAccount")}
        </h1>
        <p className="text-[#F4B942]/80 text-sm mt-2 font-medium">
          {t("join")}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Name Input */}
        <div className="space-y-1">
          <div className="relative group">
            <User
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.name ? "text-rose-400" : "text-white/40 group-focus-within:text-[#F4B942]"}`}
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
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle size={12} /> {errors.name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Username Input */}
        <div className="space-y-1">
          <div className="relative group">
            <AtSign
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.username ? "text-rose-400" : "text-white/40 group-focus-within:text-[#F4B942]"}`}
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
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle size={12} /> {errors.username.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email Input */}
        <div className="space-y-1">
          <div className="relative group">
            <Mail
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.email ? "text-rose-400" : "text-white/40 group-focus-within:text-[#F4B942]"}`}
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
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle size={12} /> {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="relative group">
            <Lock
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.password ? "text-rose-400" : "text-white/40 group-focus-within:text-[#F4B942]"}`}
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
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle size={12} /> {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1">
          <div className="relative group">
            <Lock
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.confirmPassword ? "text-rose-400" : "text-white/40 group-focus-within:text-[#F4B942]"}`}
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
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1 font-medium">
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
              className="w-4 h-4 rounded-md border-white/20 bg-black/50 text-[#F4B942] focus:ring-[#F4B942]/50 cursor-pointer transition-colors duration-200"
            />
            <label htmlFor="terms" className={`text-xs font-bold cursor-pointer transition-colors ${errors.terms ? "text-rose-500" : "text-white/60 hover:text-white"}`}>
              {t("acceptTerm")}
            </label>
          </div>
          <AnimatePresence mode="wait">
            {errors.terms && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-rose-400 text-xs ml-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} /> {errors.terms.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-gradient-to-b from-[#e33232] to-[#b31b1b] border-2 border-[#ff4d4d]/50 text-white font-black tracking-widest text-base shadow-[0_0_20px_rgba(227,50,50,0.4)] hover:shadow-[0_0_30px_rgba(227,50,50,0.6)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center uppercase"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              PROCESSING...
            </>
          ) : (
            t("registerButton")
          )}
        </button>

        {/* Login Link */}
        <p className="text-center text-xs font-bold text-white/60 pt-2">
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-[#F4B942] font-extrabold ml-1 hover:underline uppercase tracking-wider">
            {t("login")}
          </Link>
        </p>
      </form>
    </div>
  );
}