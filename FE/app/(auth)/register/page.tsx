"use client";

import { useRegister } from "@/features/auth/hooks/use-register";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AtSign, Lock, Mail } from "lucide-react";
import Link from "next/link";

const uiText: Record<string, string> = {
  createYourAccount: "CREATE ACCOUNT",
  join: "Join the ultimate poker experience",
  yourUsername: "Username",
  yourEmailAddress: "Email Address",
  password: "Password",
  confirmPassword: "Confirm Password",
  acceptTerm: "I accept the Terms and Conditions",
  registerButton: "REGISTER",
  alreadyHaveAccount: "Already have an account?",
  login: "LOGIN",
};

export default function RegisterPage() {
  const { register, handleSubmit, errors, isSubmitting } = useRegister();

  const inputBase =
    "h-12 sm:h-13 w-full rounded-xl bg-[#0B1B33] border border-[#1E3A5F] pl-10 sm:pl-12 pr-4 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-yellow-400/70 focus:ring-0 outline-none";
  const inputError = "border-rose-500 focus:border-rose-400";

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
            {uiText.createYourAccount}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">{uiText.join}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="space-y-1">
            <div className="relative">
              <AtSign
                className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.user_name ? "text-rose-400" : "text-slate-500"
                  }`}
              />
              <input
                type="text"
                placeholder={uiText.yourUsername}
                {...register("user_name")}
                aria-invalid={!!errors.user_name}
                aria-describedby={errors.user_name ? "user_name-error" : undefined}
                className={`${inputBase} ${errors.user_name ? inputError : ""}`}
              />
            </div>
            <AnimatePresence mode="wait">
              {errors.user_name && (
                <motion.p
                  id="user_name-error"
                  role="alert"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.user_name.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <div className="relative">
              <Mail
                className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email ? "text-rose-400" : "text-slate-500"
                  }`}
              />
              <input
                type="email"
                placeholder={uiText.yourEmailAddress}
                {...register("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`${inputBase} ${errors.email ? inputError : ""}`}
              />
            </div>
            <AnimatePresence mode="wait">
              {errors.email && (
                <motion.p
                  id="email-error"
                  role="alert"
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

          {/* Password */}
          <div className="space-y-1">
            <div className="relative">
              <Lock
                className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.password ? "text-rose-400" : "text-slate-500"
                  }`}
              />
              <input
                type="password"
                placeholder={uiText.password}
                {...register("password")}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`${inputBase} ${errors.password ? inputError : ""}`}
              />
            </div>
            <AnimatePresence mode="wait">
              {errors.password && (
                <motion.p
                  id="password-error"
                  role="alert"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <div className="relative">
              <Lock
                className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.confirmPassword ? "text-rose-400" : "text-slate-500"
                  }`}
              />
              <input
                type="password"
                placeholder={uiText.confirmPassword}
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                className={`${inputBase} ${errors.confirmPassword ? inputError : ""}`}
              />
            </div>
            <AnimatePresence mode="wait">
              {errors.confirmPassword && (
                <motion.p
                  id="confirmPassword-error"
                  role="alert"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-400 text-xs ml-1 flex items-center gap-1 mt-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Terms */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 py-1">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  {...register("terms")}
                  aria-invalid={!!errors.terms}
                  className="sr-only peer"
                />
                <label
                  htmlFor="terms"
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors cursor-pointer peer-checked:border-yellow-400 peer-checked:bg-yellow-400/15 peer-checked:text-yellow-400 ${errors.terms ? "border-rose-500" : "border-slate-600"
                    }`}
                >
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    className="w-2.5 h-2.5 opacity-0 peer-checked:opacity-100 transition-opacity"
                  >
                    <path
                      d="M3 7.5L5.5 10L11 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </label>
              </div>
              <label
                htmlFor="terms"
                className={`text-xs sm:text-sm cursor-pointer transition-colors ${errors.terms ? "text-rose-400" : "text-slate-400 hover:text-yellow-300"
                  }`}
              >
                {uiText.acceptTerm}
              </label>
            </div>
            <AnimatePresence mode="wait">
              {errors.terms && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-400 text-xs ml-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.terms.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 sm:h-13 w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 font-bold tracking-wide text-[#081326] text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed uppercase flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-[#081326]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>PROCESSING...</span>
              </div>
            ) : (
              uiText.registerButton
            )}
          </button>

          <p className="text-center text-xs text-slate-400 pt-1">
            {uiText.alreadyHaveAccount}{" "}
            <Link href="/login" className="text-yellow-400 font-semibold hover:underline">
              {uiText.login}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}