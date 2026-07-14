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
      .min(1, "Tên tài khoản không được bỏ trống")
      .min(3, "Tên tài khoản tối thiểu 3 ký tự")
      .max(20, "Tên tài khoản tối đa 20 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên tài khoản chỉ gồm chữ, số và dấu gạch dưới"),

    email: z
      .string()
      .trim()
      .min(1, "Email không được bỏ trống")
      .email("Email không hợp lệ"),

    password: z
      .string()
      .min(1, "Mật khẩu không được bỏ trống")
      .min(6, "Mật khẩu tối thiểu 6 ký tự")
      .max(32, "Mật khẩu tối đa 32 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Mật khẩu phải có chữ hoa, chữ thường và số"
      ),

    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),

    terms: z.boolean().refine((val) => val === true, {
      message: "Bạn cần đồng ý với điều khoản sử dụng",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
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
      toastSuccess("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.");
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
            message: messageStr || "Tên tài khoản đã được sử dụng",
          });
        } else if (errorCode === "EMAIL_ALREADY_EXISTS" || lowerMsg.includes("email")) {
          setError("email", {
            type: "server",
            message: messageStr || "Email đã được sử dụng",
          });
        } else {
          toastError(messageStr || "Email hoặc tên tài khoản đã tồn tại");
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
            typeof firstErr === "string" ? firstErr : firstErr?.error || "Đăng ký thất bại, vui lòng thử lại";
          toastError(errorMsg);
        }
        return;
      }

      // Trường hợp lỗi chung
      const errorMsg = typeof message === "string" ? message : "Đăng ký thất bại, vui lòng thử lại";
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
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting: registerMutation.isPending,
  };
}
