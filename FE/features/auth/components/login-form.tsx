"use client";

import { FormButton } from "@/components/ui/form";
import { RHFCheckbox, RHFInput } from "@/components/ui/form/RhfFields";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useLogin } from "../hooks/use-login";

export function LoginForm() {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      welcomeBackDescription: "WELCOME BACK",
      discoverMore: "Continue your poker journey",
      yourEmailAddress: "Email Address",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      loginButton: "LOG IN",
      dontHaveAccount: "Don't have an account?",
      registerNow: "REGISTER NOW",
      orContinueWith: "OR CONTINUE WITH",
    };
    return translations[key] || key;
  };

  const {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    fieldErrors,
  } = useLogin(t);

  const handleFacebookLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
    window.location.href = `${backendUrl}/api/v1/auth/facebook`;
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
    window.location.href = `${backendUrl}/api/v1/auth/google`;
  };

  const emailError = errors.email?.message || fieldErrors.email;
  const passwordError = errors.password?.message || fieldErrors.password;

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
          <div className="grid grid-cols-1 gap-4">
            <RHFInput
              control={control}
              name="email"
              id="email"
              type="email"
              label={t("yourEmailAddress")}
              leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
              error={emailError}
            />

            {/* Password Input */}
            <RHFInput
              control={control}
              name="password"
              id="password"
              type="password"
              label={t("password")}
              leftIcon={<Lock className="w-4 h-4 text-slate-500" />}
              error={passwordError}
            />

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between py-1">
              <RHFCheckbox
                control={control}
                name="rememberMe"
                label={t("rememberMe")}
              />

              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm text-slate-400 hover:text-yellow-400 transition-colors"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            {/* Submit Button */}
            <FormButton
              type="submit"
              isLoading={isSubmitting}
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              className="h-12 sm:h-13 font-bold tracking-wide text-[#081326] text-sm uppercase"
            >
              {t("loginButton")}
            </FormButton>

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
                onClick={handleGoogleLogin}
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
          </div>
        </form>
      </div>
    </div>
  );
}