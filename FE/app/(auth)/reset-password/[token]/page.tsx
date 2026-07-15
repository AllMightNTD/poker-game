"use client";

import { AuthService } from "@/features/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
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

  // Đồng bộ hoàn toàn hệ màu và kích thước với LoginForm & ForgotPasswordForm
  const inputBase =
    "h-12 sm:h-13 w-full rounded-xl bg-[#0B1B33] border pl-10 sm:pl-12 pr-12 text-sm text-white placeholder:text-slate-500 transition-colors focus:ring-0 outline-none";
  const inputNormal = "border-[#1E3A5F] focus:border-[#F4B942]/70";
  const inputError = "border-rose-500 focus:border-rose-400";

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Box ngoài bọc form sử dụng gam màu chuẩn */}
      <div className="rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8">
        {!isSuccess ? (
          <>
            {/* Nút quay lại login */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#F4B942] transition-colors mb-6 w-fit uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              Quay lại Đăng nhập
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
              <div className="space-y-1">
                <div className="relative group">
                  <Lock
                    className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.password ? "text-rose-400" : "text-slate-500 group-focus-within:text-[#F4B942]"
                      }`}
                    size={16}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu mới"
                    {...register("password")}
                    className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#F4B942] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {errors.password && (
                    <motion.p
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

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <div className="relative group">
                  <Lock
                    className={`absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.confirmPassword ? "text-rose-400" : "text-slate-500 group-focus-within:text-[#F4B942]"
                      }`}
                    size={16}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu mới"
                    {...register("confirmPassword")}
                    className={`${inputBase} ${errors.confirmPassword ? inputError : inputNormal}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#F4B942] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {errors.confirmPassword && (
                    <motion.p
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

              {/* Button Submit - Chuyển sang nút màu Vàng Gold tương tác êm mượt */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 sm:h-13 w-full rounded-xl bg-[#F4B942] hover:bg-[#e2aa36] font-bold tracking-wide text-[#081326] text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center uppercase mt-6"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-[#081326]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ĐANG CẬP NHẬT...
                  </>
                ) : (
                  "ĐẶT LẠI MẬT KHẨU"
                )}
              </button>
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