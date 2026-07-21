"use client";

import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useForgotPassword } from "../hooks/use-forgot-password";
import { FormButton } from "@/components/ui/form";
import { RHFInput } from "@/components/ui/form/RhfFields";

export function ForgotPasswordForm() {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "returnLogin": "Back to Login",
      "passwordRecovery": "RESET PASSWORD",
      "description": "Enter your email to receive a password reset link",
      "email": "Email Address",
      "sendResetLink": "SEND RESET LINK",
      "requestSent": "REQUEST SENT",
      "sendResetLinkDifferentEmail": "TRY ANOTHER EMAIL"
    };
    return translations[key] || key;
  };

  const {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    isSuccess,
    setIsSuccess,
    errorMessage,
    successMessage,
  } = useForgotPassword(t);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8">

        {!isSuccess ? (
          <>
            {/* Nút quay lại tinh tế */}
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
              <RHFInput
                control={control}
                name="email"
                type="email"
                placeholder={t("email")}
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                disabled={isSubmitting}
              />

              {/* Submit Button */}
              <FormButton
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                className="mt-6"
              >
                {t("sendResetLink")}
              </FormButton>
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
              <FormButton
                onClick={() => setIsSuccess(false)}
                variant="outlined"
                color="primary"
                fullWidth
              >
                {t("sendResetLinkDifferentEmail")}
              </FormButton>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}