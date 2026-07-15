import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

export const getForgotPasswordSchema = (t: any) => z.object({
  email: z.string().min(1, t("validation.emptyEmail")).email(t("validation.invalidEmail")),
});

export type ForgotPasswordFormValues = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

export function useForgotPassword(t: any) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(getForgotPasswordSchema(t)),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setErrorMessage("");
      const result = await AuthService.forgotPassword(data);

      setSuccessMessage(
        result?.message || t("api.successMessage")
      );
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || t("api.requestFailed")
      );
      reset();
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    isSuccess,
    setIsSuccess,
    errorMessage,
    successMessage,
  };
}
