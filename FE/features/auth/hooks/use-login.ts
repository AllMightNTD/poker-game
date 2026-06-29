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
  emailOrPhone: z.string().min(1, t("validation.emptyEmail")).email(t("validation.invalidEmail")),
  password: z.string().min(6, t("validation.passwordMin")),
});

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>;

export interface FieldErrors {
  email?: string;
  password?: string;
}

export function useLogin(t: any) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

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
      setValue("emailOrPhone", savedEmail);
      setRememberMe(true);
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

      const token = result?.metadata?.accessToken || result?.accessToken;
      const cookieExpireDays = result?.cookieExpireDays ?? 1;

      if (token) {
        Cookies.set("accessToken", token, { expires: cookieExpireDays });
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, data.emailOrPhone);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      router.push("/");
    } catch (error: any) {
      const errorCode = error.response?.data?.errorCode;
      const message = error.response?.data?.message;

      if (errorCode === "EMAIL_NOT_FOUND") {
        setFieldErrors({ email: message || t("api.emailNotFound") });
      } else if (errorCode === "WRONG_PASSWORD") {
        setFieldErrors({ password: message || t("api.wrongPassword") });
      } else {
        toastError(message || t("api.loginFailed"));
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
