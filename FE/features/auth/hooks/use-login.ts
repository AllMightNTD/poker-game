"use client";

import { useToast } from "@/core/providers/toast-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

const REMEMBER_EMAIL_KEY = "sociala_remembered_email";

export const getLoginSchema = (t: any) => z.object({
  email: z.string().min(1, t("Email is required")).email(t("Invalid email")),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(32, "Password must not exceed 32 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain uppercase, lowercase letters, and numbers"
    ),
  rememberMe: z.boolean().optional(),
})

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>;

export interface FieldErrors {
  email?: string;
  password?: string;
}

export function useLogin(t: any) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const { error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    }
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setValue("email", savedEmail);
      Promise.resolve().then(() => {
        setRememberMe(true);
      });
    }
  }, [setValue]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const watchEmail = useWatch({ control, name: "email" });
  const watchPassword = useWatch({ control, name: "password" });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    clearFieldError("email");
  }, [watchEmail]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    clearFieldError("password");
  }, [watchPassword]);

  const onSubmit = async (data: LoginFormValues) => {
    setFieldErrors({});
    try {
      const result = await AuthService.login({
        email: data.email,
        password: data.password,
        rememberMe: !!data.rememberMe,
      });

      const token = result?.metadata?.access_token || result?.access_token || result?.accessToken;

      if (token) {
        Cookies.set("accessToken", token, { expires: 15 / 1440, path: "/" }); // 15 minutes
      }

      if (data.rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      router.push("/poker-game");
    } catch (error: any) {
      const errorCode = error.response?.data?.errorCode;
      const message = error.response?.data?.message;

      if (errorCode === "EMAIL_NOT_FOUND") {
        setFieldErrors({ email: message || t("api.emailNotFound") });
      } else if (errorCode === "WRONG_PASSWORD") {
        setFieldErrors({ password: message || t("api.wrongPassword") });
      } else {
        if (Array.isArray(message)) {
          const newErrors: FieldErrors = {};
          let hasFieldError = false;
          message.forEach((err: any) => {
            if (err && typeof err === "object" && err.field && err.error) {
              // Map email to email if needed
              const field = err.field === "email" ? "email" : err.field;
              newErrors[field as keyof FieldErrors] = err.error;
              hasFieldError = true;
            }
          });

          if (hasFieldError) {
            setFieldErrors(newErrors);
          } else if (typeof message[0] === "string") {
            toastError(message[0]);
          } else {
            toastError(t("api.loginFailed"));
          }
        } else {
          toastError(typeof message === "string" ? message : t("api.loginFailed"));
        }
      }
    }
  };

  return {
    register,
    control,
    handleSubmit: handleSubmit(onSubmit),
    setValue,
    errors,
    isSubmitting,
    fieldErrors,
    rememberMe,
    setRememberMe,
    clearFieldError,
  };
}
