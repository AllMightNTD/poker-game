import { useToast } from "@/core/providers/toast-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

const REMEMBER_EMAIL_KEY = "sociala_remembered_email";

export const getLoginSchema = (t: any) => z.object({
  email: z.string().min(1, t("Email không được bỏ trống")).email(t("Email không hợp lệ")),
  password: z
    .string()
    .min(1, "Mật khẩu không được bỏ trống")
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .max(32, "Mật khẩu tối đa 32 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Mật khẩu phải có chữ hoa, chữ thường và số"
    ),
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
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(getLoginSchema(t)),
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

  const onSubmit = async (data: LoginFormValues) => {
    setFieldErrors({});
    try {
      const result = await AuthService.login({
        ...data,
        rememberMe,
      });

      const token = result?.metadata?.access_token || result?.access_token || result?.accessToken;

      if (token) {
        Cookies.set("accessToken", token, { expires: 15 / 1440, path: "/" }); // 15 minutes
      }

      if (rememberMe) {
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
