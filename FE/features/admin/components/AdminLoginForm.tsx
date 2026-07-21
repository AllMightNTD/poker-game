"use client";

import { FormButton } from "@/components/ui/form";
import { RHFInput } from "@/components/ui/form/RhfFields";
import httpClient from "@/core/api/http-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { Gamepad2, Lock, Mail, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export const AdminLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const getErrorMessage = (err: unknown): string => {
    const axiosErr = err as { response?: { data?: { message?: unknown; error?: string } } };
    const data = axiosErr.response?.data;
    if (!data) return "Incorrect login credentials.";

    const message = data.message;
    if (typeof message === "string") return message;

    if (Array.isArray(message)) {
      const first = message[0] as unknown;
      if (typeof first === "string") return first;
      if (first && typeof first === "object") {
        const f = first as Record<string, string>;
        return f.error || f.message || JSON.stringify(first);
      }
    }

    if (message && typeof message === "object") {
      const m = message as Record<string, string>;
      return m.error || m.message || JSON.stringify(message);
    }

    if (typeof data.error === "string") return data.error;

    return "Incorrect login credentials.";
  };

  const onSubmit = async (data: AdminLoginValues) => {
    setError(null);
    try {
      const res = await httpClient.post("/api/v1/admin/login", data);

      if (res.data?.admin_access_token) {
        Cookies.set("admin_access_token", res.data.admin_access_token, {
          path: "/",
          expires: 2 / 24, // 2 hours (matching backend JWT lifetime)
        });
        router.push("/backstage/dashboard");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center mb-3">
          <Gamepad2 size={22} className="text-slate-300" />
        </div>
        <h1 className="text-lg font-semibold text-slate-100">Admin Login</h1>
        <p className="text-slate-500 text-xs mt-1">Authorized personnel only</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-3 py-2.5 rounded-lg bg-red-950/40 border border-red-900/50 flex items-start gap-2">
          <ShieldAlert size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="grid grid-cols-1 gap-4">
          <RHFInput
            control={control}
            name="email"
            type="email"
            placeholder="Admin Email"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            disabled={isSubmitting}
          />

          {/* Password */}
          <RHFInput
            control={control}
            name="password"
            type="password"
            placeholder="Password"
            leftIcon={<Lock size={16} />}
            error={errors.password?.message}
            disabled={isSubmitting}
          />

          <FormButton
            type="submit"
            isLoading={isSubmitting}
            variant="contained"
            color="primary"
            fullWidth
            className="mt-2"
          >
            Log In
                                </FormButton>
        </div>
      </form>
    </div>
  );
};