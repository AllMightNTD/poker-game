"use client";

import { AuthService } from "@/features/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormButton } from "@/components/ui/form";
import { RHFInput } from "@/components/ui/form/RhfFields";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setErrorMessage("");

      if (!token) {
        setErrorMessage("Mã xác thực (Token) không tìm thấy. Vui lòng sử dụng liên kết trong email.");
        return;
      }

      await AuthService.resetPassword({
        token,
        password: data.password,
      });

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 3500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
        "Token đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu cầu."
      );
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8">
        {!isSuccess ? (
          <>
            {/* Nút quay lại login */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#F4B942] transition-colors mb-6 w-fit uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              Back to Login
                                      </Link>

            <div className="mb-6 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                Đặt lại mật khẩu mới
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                Hãy tạo mật khẩu mới an toàn hơn. Mật khẩu phải có độ dài ít nhất 6 ký tự.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {errorMessage && (
                <div className="p-4 text-xs font-bold text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/30 text-center uppercase tracking-wide">
                  {errorMessage}
                  <div className="mt-3">
                    <Link
                      href="/forgot-password"
                      className="font-bold text-[#F4B942] hover:text-[#e2aa36] underline text-xs uppercase"
                    >
                      Gửi lại yêu cầu
                    </Link>
                  </div>
                </div>
              )}

              {/* Password Input */}
              <RHFInput
                control={control}
                name="password"
                type="password"
                placeholder="New password"
                leftIcon={<Lock size={16} />}
                error={errors.password?.message}
                disabled={isSubmitting}
              />

              {/* Confirm Password Input */}
              <RHFInput
                control={control}
                name="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                leftIcon={<Lock size={16} />}
                error={errors.confirmPassword?.message}
                disabled={isSubmitting}
              />

              {/* Button Submit */}
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
                ĐẶT LẠI MẬT KHẨU
              </FormButton>
            </form>
          </>
        ) : (
          /* Giao diện thông báo thành công */
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-[#F4B942]/15 text-[#F4B942] border border-[#F4B942]/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(244,185,66,0.15)]">
              <CheckCircle size={32} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
              Cập nhật thành công!
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 mb-8 leading-relaxed max-w-xs">
              Mật khẩu của bạn đã được đặt lại thành công. Bạn đang được tự động chuyển hướng đến trang Đăng nhập...
            </p>

            <div className="w-full">
              <Link
                href="/login"
                className="h-12 sm:h-13 w-full rounded-xl bg-[#F4B942] hover:bg-[#e2aa36] font-bold tracking-wide text-[#081326] text-sm flex items-center justify-center transition-colors uppercase"
              >
                ĐĂNG NHẬP NGAY
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}