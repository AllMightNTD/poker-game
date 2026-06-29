"use client";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Zap, CheckCircle, ArrowLeft } from "lucide-react";
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
      
      // Auto-redirect to login after 3 seconds
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
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left side - Illustration (Desktop Only) */}
      <div className="hidden lg:flex lg:w-5/12 bg-blue-50/50 flex-col p-12 relative overflow-hidden">
        <div className="flex items-center gap-2 text-blue-600 mb-20">
          <Zap size={32} fill="currentColor" className="text-emerald-400" />
          <span className="text-3xl font-black tracking-tight">Sociala.</span>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          <svg
            viewBox="0 0 500 400"
            className="w-full max-w-md drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="400" height="300" x="50" y="50" rx="4" fill="white" />
            <path d="M100 100 Q 150 50 200 100 T 300 100" stroke="#E2E8F0" strokeWidth="2" />
            <circle cx="160" cy="180" r="25" fill="#1E293B" />
            <path d="M160 205 L140 320 L180 320 Z" fill="#2563EB" />
            <circle cx="340" cy="190" r="22" fill="#4B5563" />
            <path d="M340 212 L310 320 L370 320 Z" fill="#2563EB" />
            <path d="M200 220 L300 220" stroke="#FCA5A5" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Right side - Reset Password Form */}
      <div className="w-full lg:w-7/12 flex flex-col items-center px-6 lg:px-20 py-12">
        <div className="w-full flex justify-between items-center mb-16">
          <Link href="/login" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} />
            Quay lại Đăng nhập
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className="px-8 py-2.5 rounded-full bg-slate-800 text-white text-sm font-bold shadow-lg">
              Login
            </Link>
            <Link href="/register" className="px-8 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg">
              Register
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col my-auto">
          {!isSuccess ? (
            <>
              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                Đặt lại mật khẩu mới
              </h1>
              <p className="text-slate-500 mb-10">
                Hãy tạo mật khẩu mới an toàn hơn. Mật khẩu phải có độ dài ít nhất 6 ký tự.
              </p>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                {errorMessage && (
                  <div className="p-4 text-sm text-red-500 bg-red-50 rounded-xl border border-red-200">
                    {errorMessage}
                    <div className="mt-3">
                      <Link
                        href="/forgot-password"
                        className="font-bold text-blue-600 hover:text-blue-700 underline text-xs"
                      >
                        Gửi lại yêu cầu đặt mật khẩu mới
                      </Link>
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu mới"
                      {...register("password")}
                      className={`w-full pl-12 pr-12 py-4 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 outline-none transition-all text-slate-600 placeholder:text-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm ml-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Xác nhận mật khẩu mới"
                      {...register("confirmPassword")}
                      className={`w-full pl-12 pr-12 py-4 rounded-xl border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 outline-none transition-all text-slate-600 placeholder:text-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm ml-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-slate-800 text-white font-bold text-lg shadow-xl hover:bg-slate-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang cập nhật...
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 border border-emerald-100 shadow-sm">
                <CheckCircle size={44} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Cập nhật thành công!
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Mật khẩu của bạn đã được đặt lại thành công. Bạn đang được tự động chuyển hướng đến trang Đăng nhập...
              </p>
              <div className="w-full">
                <Link
                  href="/login"
                  className="block w-full py-4 rounded-xl bg-slate-800 text-white font-bold text-lg shadow-xl hover:bg-slate-700 transition-colors text-center"
                >
                  Đăng nhập ngay lập tức
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
