"use client";

import { ArrowLeft, CheckCircle, Mail, Zap } from "lucide-react";
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
    "w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 bg-white/60";

  return (
    // NỀN THUẦN SOCIALA: Đồng nhất, đan xen CSS Gradient mềm mại, không sử dụng ảnh ngoài
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans bg-slate-50 overflow-hidden">

      {/* CÁC KHỐI NỀN SINH ĐỘNG (ABSTRACT BLOBS) - Đồng bộ hiệu ứng màu sắc */}
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

      {/* KHU VỰC TRUNG TÂM: CARD GLASSMORPHISM TẬP TRUNG TỐI ĐA VÀO FORM */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-[460px] bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-xl shadow-blue-900/5 border border-white p-8 lg:p-12 flex flex-col">

          {!isSuccess ? (
            <>
              {/* Nút quay lại tinh tế nằm ngay trên phần tiêu đề form */}
              <Link href="/login" className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors mb-6 self-start">
                <ArrowLeft size={14} />
                {t("returnLogin")}
              </Link>

              <div className="mb-6">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                  {t("passwordRecovery")}
                </h1>
                <p className="text-slate-400 text-sm mt-2 font-medium leading-relaxed">
                  {t("description")}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {errorMessage && (
                  <div className="p-4 text-xs font-semibold text-red-500 bg-red-50 rounded-2xl border border-red-100">
                    {errorMessage}
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300`} size={18} />
                    <input
                      type="email"
                      placeholder={t("email")}
                      {...register("email")}
                      className={`${inputBase} ${errors.email ? 'border-red-400 ring-2 ring-red-100 bg-red-50/30' : 'border-slate-200/80 focus:border-blue-500'}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs ml-1 font-medium mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button - Gradient màu thương hiệu */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    t("sendResetLink")
                  )}
                </button>
              </form>
            </>
          ) : (
            /* TRẠNG THÁI GỬI EMAIL THÀNH CÔNG THUẦN SẮC TRẮNG XANH */
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <CheckCircle size={32} />
              </div>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {t("requestSent")}
              </h2>
              <p className="text-slate-400 text-sm mt-2 mb-8 font-medium leading-relaxed">
                {successMessage}
              </p>

              <div className="w-full space-y-2.5">
                <Link
                  href="/login"
                  className="block w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base shadow-lg shadow-blue-500/20 hover:opacity-95 text-center transition-all"
                >
                  {t("returnLogin")}
                </Link>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="block w-full py-4 rounded-2xl bg-slate-100/80 text-slate-500 font-bold text-sm hover:bg-slate-200/80 hover:text-slate-700 transition-colors text-center"
                >
                  {t("sendResetLinkDifferentEmail")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER ĐỒNG NHẤT */}
      <footer className="w-full py-6 text-center text-[11px] font-bold text-slate-400 tracking-wider relative z-10">
        SOCIALA NETWORK &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}