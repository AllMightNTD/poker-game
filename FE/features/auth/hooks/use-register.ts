import httpClient from "@/core/api/http-client";
import { useToast } from "@/core/providers/toast-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const getRegisterSchema = (t: any) => z.object({
  name: z.string().min(1, t("validation.emptyName")),
  user_name: z.string().min(1, t("validation.emptyUsername")).regex(/^[a-zA-Z0-9_]+$/, t("validation.invalidUsername")),
  email: z.string().min(1, t("validation.emptyEmail")).email(t("validation.invalidEmail")),
  password: z.string().min(6, t("validation.passwordMin")),
  confirmPassword: z.string().min(1, t("validation.passwordMismatch")),
  terms: z.boolean().refine((val) => val === true, {
    message: t("validation.acceptTerms")
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: t("validation.passwordMismatch"),
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<ReturnType<typeof getRegisterSchema>>;

export function useRegister(t: any) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(getRegisterSchema(t)),
    defaultValues: {
      terms: false
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await httpClient.post("/api/v1/auth/register", data);
      return response.data;
    },
    onSuccess: (data: any, variables: any) => {
      toastSuccess(t("api.registerSuccess"));
      router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.errorCode;
      const message = error.response?.data?.message;

      if (errorCode === "EMAIL_ALREADY_EXISTS" || errorCode === "USERNAME_ALREADY_EXISTS" || error.response?.status === 409) {
        const messageStr = typeof message === "string" ? message : "";
        if (messageStr && messageStr.toLowerCase().includes("username")) {
          setError("user_name", { type: "server", message: messageStr });
        } else if (messageStr && messageStr.toLowerCase().includes("email")) {
          setError("email", { type: "server", message: messageStr });
        } else {
          toastError(messageStr || t("api.emailExists"));
        }
      } else if (Array.isArray(message)) {
        let hasFieldError = false;
        message.forEach((err: any) => {
          if (err && typeof err === "object" && err.field && err.error) {
            const field = err.field === "full_name" ? "name" : err.field;
            if (["name", "username", "email", "password", "confirmPassword", "terms"].includes(field)) {
              setError(field as any, { type: "server", message: err.error });
              hasFieldError = true;
            }
          }
        });

        if (!hasFieldError) {
          const firstErr = message[0];
          const errorMsg = typeof firstErr === "string" ? firstErr : (firstErr?.error || t("api.registerFailed"));
          toastError(errorMsg);
        }
      } else {
        const errorMsg = typeof message === "string" ? message : t("api.registerFailed");
        toastError(errorMsg);
      }
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      full_name: data.name,
      user_name: data.user_name,
      email: data.email,
      password: data.password,
    });
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: registerMutation.isPending,
  };
}
