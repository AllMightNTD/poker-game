"use client";

import React from "react";
import { Lock } from "lucide-react";
import Link from "next/link";
import { FormInput, FormButton } from "@/components/ui/form";

export default function ChangePasswordPage() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
            Đổi mật khẩu
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Old Password Input */}
          <FormInput
            type="password"
            placeholder="Mật khẩu hiện tại"
            leftIcon={<Lock size={16} />}
          />

          {/* New Password Input */}
          <FormInput
            type="password"
            placeholder="Mật khẩu mới"
            leftIcon={<Lock size={16} />}
          />

          {/* Submit Button */}
          <FormButton
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            className="mt-6"
          >
            ĐỔI MẬT KHẨU
          </FormButton>

          <p className="text-center text-xs text-slate-400 pt-1">
            <Link href="/login" className="text-[#F4B942] font-semibold hover:underline">
              Quay lại Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
