"use client";

import { FormButton } from "@/components/ui/form";
import { RHFCheckbox, RHFInput } from "@/components/ui/form/RhfFields";
import { useRegister } from "@/features/auth/hooks/use-register";
import { AtSign, Lock, Mail } from "lucide-react";
import Link from "next/link";

const uiText: Record<string, string> = {
  createYourAccount: "CREATE ACCOUNT",
  join: "Join the ultimate poker experience",
  yourUsername: "Username",
  yourEmailAddress: "Email Address",
  password: "Password",
  confirmPassword: "Confirm Password",
  acceptTerm: "I agree to the Terms and Conditions",
  registerButton: "REGISTER",
  alreadyHaveAccount: "Already have an account?",
  login: "LOG IN",
};

export default function RegisterClient() {
  const { control, handleSubmit, errors, isSubmitting } = useRegister();

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
          <div className="grid grid-cols-1 gap-4">
            {/* Username Field */}
            <RHFInput
              control={control}
              name="user_name"
              id="user_name"
              label={uiText.yourUsername}
              placeholder={uiText.yourUsername}
              leftIcon={<AtSign className="w-4 h-4 text-slate-500" />}
              error={errors.user_name?.message}
              disabled={isSubmitting}
            />

            {/* Email Field */}
            <RHFInput
              control={control}
              name="email"
              id="email"
              type="email"
              label={uiText.yourEmailAddress}
              placeholder={uiText.yourEmailAddress}
              leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
              error={errors.email?.message}
              disabled={isSubmitting}
            />

            {/* Password Field */}
            <RHFInput
              control={control}
              name="password"
              id="password"
              type="password"
              label={uiText.password}
              placeholder={uiText.password}
              leftIcon={<Lock className="w-4 h-4 text-slate-500" />}
              error={errors.password?.message}
              disabled={isSubmitting}
            />

            {/* Confirm Password Field */}
            <RHFInput
              control={control}
              name="confirmPassword"
              id="confirmPassword"
              type="password"
              label={uiText.confirmPassword}
              placeholder={uiText.confirmPassword}
              leftIcon={<Lock className="w-4 h-4 text-slate-500" />}
              error={errors.confirmPassword?.message}
              disabled={isSubmitting}
            />

            {/* Terms and Conditions Checkbox */}
            <RHFCheckbox
              control={control}
              name="terms"
              id="terms"
              label={uiText.acceptTerm}
              error={errors.terms?.message}
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
              className="h-12 sm:h-13 font-bold tracking-wide text-[#081326] text-sm uppercase mt-2"
            >
              {uiText.registerButton}
            </FormButton>
          </div>

          <p className="text-center text-xs text-slate-400 pt-2">
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
