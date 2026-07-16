"use client";

import { FormInput } from "@/components/ui/form";
import httpClient from "@/core/api/http-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gamepad2, Lock, Mail, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  twoFactorToken: z
    .string()
    .min(6, "Mã xác thực gồm 6 chữ số")
    .max(6)
    .optional()
    .or(z.literal("")),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export const AdminLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorToken: "",
    },
  });

  const onSubmit = async (data: AdminLoginValues) => {
    setError(null);
    try {
      const res = await httpClient.post("/api/v1/admin/login", data);

      if (res.data?.admin_access_token) {
        router.push("/backstage/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Sai thông tin đăng nhập.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center mb-3">
          <Gamepad2 size={22} className="text-slate-300" />
        </div>
        <h1 className="text-lg font-semibold text-slate-100">Đăng nhập quản trị</h1>
        <p className="text-slate-500 text-xs mt-1">Chỉ dành cho nhân viên được cấp quyền</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-3 py-2.5 rounded-lg bg-red-950/40 border border-red-900/50 flex items-start gap-2">
          <ShieldAlert size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <FormInput
          {...register("email")}
          type="email"
          placeholder="Email quản trị"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          disabled={isSubmitting}
        />

        {/* Password */}
        <FormInput
          {...register("password")}
          type="password"
          placeholder="Mật khẩu"
          leftIcon={<Lock size={16} />}
          error={errors.password?.message}
          disabled={isSubmitting}
        />

        {/* 2FA */}
        <FormInput
          {...register("twoFactorToken")}
          type="text"
          maxLength={6}
          placeholder="Mã 2FA (nếu có)"
          leftIcon={<ShieldAlert size={16} />}
          error={errors.twoFactorToken?.message}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-slate-900 bg-slate-200 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-500/40 border-t-slate-700 animate-spin" />
              Đang xác thực...
            </span>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>
    </div>
  );
};