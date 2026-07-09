import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/core/providers/toast-provider";
import { useMutation } from "@tanstack/react-query";
import httpClient from "@/core/api/http-client";

export const getRegisterSchema = (t: any) => z.object({
  name: z.string().min(1, t("validation.emptyName")),
  username: z.string().min(1, t("validation.emptyUsername")).regex(/^[a-zA-Z0-9_]+$/, t("validation.invalidUsername")),
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
        if (message && message.toLowerCase().includes("username")) {
          setError("username", { type: "server", message: message });
        } else if (message && message.toLowerCase().includes("email")) {
          setError("email", { type: "server", message: message });
        } else {
          toastError(message || t("api.emailExists"));
        }
      } else {
        toastError(message || t("api.registerFailed"));
      }
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      full_name: data.name,
      username: data.username,
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
