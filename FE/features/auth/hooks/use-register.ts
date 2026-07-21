import httpClient from "@/core/api/http-client";
import { useToast } from "@/core/providers/toast-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const registerSchema = z
  .object({
    user_name: z
      .string()
      .trim()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Invalid email"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(32, "Password must not exceed 32 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain uppercase, lowercase letters, and numbers"
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms of Use",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;


interface RegisterPayload {
  user_name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  token?: string;
  [key: string]: unknown;
}

interface FieldErrorItem {
  field: string;
  error: string;
}

const FIELD_MAP: Record<string, keyof RegisterFormValues> = {
  username: "user_name",
  user_name: "user_name",
  email: "email",
  password: "password",
  confirmPassword: "confirmPassword",
  terms: "terms",
};

export function useRegister() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      terms: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterPayload): Promise<RegisterResponse> => {
      const response = await httpClient.post("/api/v1/auth/register", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toastSuccess("Registration successful. Please check your email to verify your account.");
      const tokenQuery = data?.token ? `&token=${encodeURIComponent(data.token)}` : "";
      router.push(`/verify-otp?email=${encodeURIComponent(variables.email)}${tokenQuery}`);
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.errorCode;
      const message = error.response?.data?.message;
      const status = error.response?.status;

      // Trường hợp trùng email/username
      if (errorCode === "EMAIL_ALREADY_EXISTS" || errorCode === "USERNAME_ALREADY_EXISTS" || status === 409) {
        const messageStr = typeof message === "string" ? message : "";
        const lowerMsg = messageStr.toLowerCase();

        if (errorCode === "USERNAME_ALREADY_EXISTS" || lowerMsg.includes("username")) {
          setError("user_name", {
            type: "server",
            message: messageStr || "Username is already taken",
          });
        } else if (errorCode === "EMAIL_ALREADY_EXISTS" || lowerMsg.includes("email")) {
          setError("email", {
            type: "server",
            message: messageStr || "Email is already in use",
          });
        } else {
          toastError(messageStr || "Email or username already exists");
        }
        return;
      }

      // Trường hợp lỗi validate nhiều field từ server
      if (Array.isArray(message)) {
        let hasFieldError = false;

        message.forEach((err: FieldErrorItem) => {
          if (err && typeof err === "object" && err.field && err.error) {
            const fieldName = FIELD_MAP[err.field];
            if (fieldName) {
              setError(fieldName, { type: "server", message: err.error });
              hasFieldError = true;
            }
          }
        });

        if (!hasFieldError) {
          const firstErr = message[0];
          const errorMsg =
            typeof firstErr === "string" ? firstErr : firstErr?.error || "Registration failed, please try again";
          toastError(errorMsg);
        }
        return;
      }

      // Trường hợp lỗi chung
      const errorMsg = typeof message === "string" ? message : "Registration failed, please try again";
      toastError(errorMsg);
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      user_name: data.user_name,
      email: data.email,
      password: data.password,
    });
  };

  return {
    register,
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: registerMutation.isPending,
  };
}
