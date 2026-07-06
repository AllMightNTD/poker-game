"use client";

import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
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

      await api.post("/api/v1/user/auth/reset-password", {
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

  const inputBase =
    "w-full pl-12 pr-12 py-3.5 rounded-xl outline-none transition-all duration-300 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#F4B942]/50 bg-black/50 backdrop-blur-md";
  const inputNormal = "border border-white/10 focus:border-[#F4B942]/80";
  const inputError = "border border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-500/10 focus:ring-rose-500/40";

  return (
    <div className="w-full">
      {!isSuccess ? (
        <>
          <Link href="/login" className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-[#F4B942] transition-colors mb-6 w-fit uppercase tracking-wider">
            <ArrowLeft size={14} />
            Quay lại Đăng nhập
          </Link>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight uppercase">
              Đặt lại mật khẩu mới
            </h1>
            <p className="text-[#F4B942]/80 text-sm mt-2 font-medium leading-relaxed">
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
                    className="font-black text-[#F4B942] hover:text-[#F4B942]/80 underline text-xs uppercase"
                  >
                    Gửi lại yêu cầu
                  </Link>
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.password ? "text-rose-400" : "text-white/40 group-focus-within:text-[#F4B942]"}`} size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  {...register("password")}
                  className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#F4B942] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-xs ml-1 font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${errors.confirmPassword ? "text-rose-400" : "text-white/40 group-focus-within:text-[#F4B942]"}`} size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu mới"
                  {...register("confirmPassword")}
                  className={`${inputBase} ${errors.confirmPassword ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#F4B942] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-rose-400 text-xs ml-1 font-medium mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

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
                  ĐANG CẬP NHẬT...
                </>
              ) : (
                "ĐẶT LẠI MẬT KHẨU"
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
            Cập nhật thành công!
          </h2>
          <p className="text-white/60 text-sm mt-2 mb-8 font-medium leading-relaxed">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn đang được tự động chuyển hướng đến trang Đăng nhập...
          </p>
          <div className="w-full">
            <Link
              href="/login"
              className="block w-full py-4 rounded-xl bg-gradient-to-b from-[#e33232] to-[#b31b1b] border-2 border-[#ff4d4d]/50 text-white font-black tracking-widest text-base shadow-[0_0_20px_rgba(227,50,50,0.4)] hover:shadow-[0_0_30px_rgba(227,50,50,0.6)] text-center transition-all uppercase"
            >
              ĐĂNG NHẬP NGAY
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
