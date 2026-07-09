import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/core/providers/toast-provider";
import { AuthService } from "../services/auth.service";

export function useVerifyOtp(
  initialToken: string | null,
  initialOtp: string | null,
  emailParam: string | null,
  t: any
) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [otp, setOtp] = useState<string[]>(() => {
    if (initialOtp && initialOtp.length === 6) {
      return initialOtp.split("");
    }
    return Array(6).fill("");
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState(emailParam || "");
  const [token, setToken] = useState(initialToken || "");

  // Ref to track if auto-verification has been triggered to avoid duplicate runs in React Strict Mode
  const autoVerifyTriggered = useRef(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(async (verifyToken: string, verifyOtpCode: string) => {
    if (!verifyToken) {
      setErrorMessage(t("api.missingToken") || "Thiếu token xác thực.");
      return;
    }
    if (verifyOtpCode.length !== 6) {
      setErrorMessage(t("api.invalidOtpLength") || "Mã OTP phải có 6 chữ số.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");
    try {
      const result = await AuthService.verifyOtp({ token: verifyToken, otp: verifyOtpCode });
      toastSuccess(result.message || t("api.verifySuccess") || "Xác thực thành công!");
      setSuccessMessage(result.message || "Tài khoản của bạn đã được kích hoạt thành công!");
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      const msg = error.response?.data?.message || t("api.verifyFailed") || "Xác thực thất bại.";
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsVerifying(false);
    }
  }, [router, toastError, toastSuccess, t]);

  // Handle auto-verification if both token and otp are present in URL
  useEffect(() => {
    if (initialToken && initialOtp && initialOtp.length === 6 && !autoVerifyTriggered.current) {
      autoVerifyTriggered.current = true;
      handleVerify(initialToken, initialOtp);
    }
  }, [initialToken, initialOtp, handleVerify]);

  const handleManualVerify = () => {
    const fullOtp = otp.join("");
    handleVerify(token, fullOtp);
  };

  const handleResend = async (targetEmail: string) => {
    if (!targetEmail) {
      toastError(t("api.emptyEmail") || "Vui lòng nhập email.");
      return;
    }
    if (cooldown > 0) return;

    setErrorMessage("");
    try {
      const result = await AuthService.resendOtp({ email: targetEmail });
      toastSuccess(result.message || t("api.resendSuccess") || "Mã OTP mới đã được gửi!");
      setCooldown(60);
    } catch (error: any) {
      const msg = error.response?.data?.message || t("api.resendFailed") || "Không thể gửi lại OTP.";
      setErrorMessage(msg);
      toastError(msg);
    }
  };

  return {
    otp,
    setOtp,
    isVerifying,
    isSuccess,
    errorMessage,
    successMessage,
    cooldown,
    email,
    setEmail,
    token,
    setToken,
    handleManualVerify,
    handleResend: () => handleResend(email),
  };
}
