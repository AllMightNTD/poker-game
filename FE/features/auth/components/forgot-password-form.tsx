"use client";

import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter as useI18nRouter, usePathname } from "@/i18n/routing";
import Link from "next/link";
import { useForgotPassword } from "../hooks/use-forgot-password";

export function ForgotPasswordForm() {
  const t = useTranslations("forgotPassword");
  const locale = useLocale();
  const i18nRouter = useI18nRouter();
  const pathname = usePathname();

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

  const changeLanguage = (newLocale: string) => {
    localStorage.setItem("know_block_locale", newLocale);
    i18nRouter.replace(pathname, { locale: newLocale });
  };

  const inputBase =
    "w-full pl-12 pr-4 py-3.5 rounded-xl outline-none transition-all duration-300 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#F4B942]/50 bg-black/50 backdrop-blur-md";
  const inputNormal = "border border-white/10 focus:border-[#F4B942]/80";
  const inputError = "border border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-500/10 focus:ring-rose-500/40";

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 mb-6">
        <span 
          onClick={() => changeLanguage("en")}
          className={`cursor-pointer text-xs font-bold transition-colors ${locale === "en" ? "text-[#F4B942]" : "text-white/40 hover:text-white/80"}`}
        >EN</span>
        <span className="text-white/20">|</span>
        <span 
          onClick={() => changeLanguage("vi")}
          className={`cursor-pointer text-xs font-bold transition-colors ${locale === "vi" ? "text-[#F4B942]" : "text-white/40 hover:text-white/80"}`}
        >VI</span>
      </div>

      {!isSuccess ? (
        <>
          {/* Nút quay lại tinh tế */}
          <Link href="/login" className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-[#F4B942] transition-colors mb-6 w-fit uppercase tracking-wider">
            <ArrowLeft size={14} />
            {t("returnLogin")}
          </Link>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight uppercase">
              {t("passwordRecovery")}
            </h1>
            <p className="text-[#F4B942]/80 text-sm mt-2 font-medium leading-relaxed">
              {t("description")}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-4 text-xs font-bold text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/30 uppercase tracking-wide text-center">
                {errorMessage}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.email ? "text-rose-400" : "text-white/40 group-focus-within:text-[#F4B942]"}`} size={18} />
                <input
                  type="email"
                  placeholder={t("email")}
                  {...register("email")}
                  className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-xs ml-1 font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-b from-[#e33232] to-[#b31b1b] border-2 border-[#ff4d4d]/50 text-white font-black tracking-widest text-base shadow-[0_0_20px_rgba(227,50,50,0.4)] hover:shadow-[0_0_30px_rgba(227,50,50,0.6)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center uppercase mt-6"
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
                t("sendResetLink")
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F4B942] to-[#b5852a] text-black rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,185,66,0.3)]">
            <CheckCircle size={32} />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            {t("requestSent")}
          </h2>
          <p className="text-white/60 text-sm mt-2 mb-8 font-medium leading-relaxed">
            {successMessage}
          </p>

          <div className="w-full space-y-3">
            <Link
              href="/login"
              className="block w-full py-4 rounded-xl bg-gradient-to-b from-[#e33232] to-[#b31b1b] border-2 border-[#ff4d4d]/50 text-white font-black tracking-widest text-base shadow-[0_0_20px_rgba(227,50,50,0.4)] hover:shadow-[0_0_30px_rgba(227,50,50,0.6)] text-center transition-all uppercase"
            >
              {t("returnLogin")}
            </Link>
            <button
              onClick={() => setIsSuccess(false)}
              className="block w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 hover:text-white transition-colors text-center uppercase tracking-wider"
            >
              {t("sendResetLinkDifferentEmail")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}