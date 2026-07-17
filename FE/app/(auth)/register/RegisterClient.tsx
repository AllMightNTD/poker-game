"use client";

import { useRegister } from "@/features/auth/hooks/use-register";
import { AtSign, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { FormInput, FormCheckbox, FormButton } from "@/components/ui/form";

const uiText: Record<string, string> = {
  createYourAccount: "TẠO TÀI KHOẢN",
  join: "Tham gia trải nghiệm poker đỉnh cao",
  yourUsername: "Tên đăng nhập",
  yourEmailAddress: "Địa chỉ Email",
  password: "Mật khẩu",
  confirmPassword: "Xác nhận mật khẩu",
  acceptTerm: "Tôi đồng ý với Điều khoản và Điều kiện",
  registerButton: "ĐĂNG KÝ",
  alreadyHaveAccount: "Đã có tài khoản?",
  login: "ĐĂNG NHẬP",
};

export default function RegisterClient() {
  const { register, handleSubmit, errors, isSubmitting } = useRegister();

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
          <FormInput
            {...register("user_name")}
            placeholder={uiText.yourUsername}
            leftIcon={<AtSign size={16} />}
            error={errors.user_name?.message}
            disabled={isSubmitting}
          />

          {/* Email */}
          <FormInput
            {...register("email")}
            type="email"
            placeholder={uiText.yourEmailAddress}
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            disabled={isSubmitting}
          />

          {/* Password */}
          <FormInput
            {...register("password")}
            type="password"
            placeholder={uiText.password}
            leftIcon={<Lock size={16} />}
            error={errors.password?.message}
            disabled={isSubmitting}
          />

          {/* Confirm Password */}
          <FormInput
            {...register("confirmPassword")}
            type="password"
            placeholder={uiText.confirmPassword}
            leftIcon={<Lock size={16} />}
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
          />

          {/* Terms */}
          <FormCheckbox
            {...register("terms")}
            label={uiText.acceptTerm}
            error={errors.terms?.message}
            disabled={isSubmitting}
          />

          <FormButton
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            className="mt-2"
          >
            {uiText.registerButton}
          </FormButton>

          <p className="text-center text-xs text-slate-400 pt-1">
            {uiText.alreadyHaveAccount}{" "}
            <Link href="/login" className="text-[#F4B942] font-semibold hover:underline">
              {uiText.login}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
