import { useToast } from "@/core/providers/toast-provider";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthService } from "../services/auth.service";

const OTP_LENGTH = 6;

const MESSAGES = {
  missingToken: "Thiếu token xác thực.",
  invalidOtpLength: "Mã OTP phải có 6 chữ số.",
  verifySuccess: "Xác thực thành công!",
  verifySuccessDefault: "Tài khoản của bạn đã được kích hoạt thành công!",
  verifyFailed: "Xác thực thất bại, vui lòng thử lại.",
  emptyEmail: "Vui lòng nhập email.",
  resendSuccess: "Mã OTP mới đã được gửi!",
  resendFailed: "Không thể gửi lại OTP, vui lòng thử lại.",
};

const RESEND_COOLDOWN_SECONDS = 60;

function extractErrorMessage(error: any, fallback: string): string {
  const msgRaw = error?.response?.data?.message;

  if (Array.isArray(msgRaw)) {
    const first = msgRaw[0];
    if (typeof first === "string") return first;
    if (first?.error) return first.error;
    return fallback;
  }

  if (typeof msgRaw === "string") return msgRaw;

  return fallback;
}

export function useVerifyOtp(
  initialToken: string | null,
  initialOtp: string | null,
  emailParam: string | null
) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [otp, setOtp] = useState<string[]>(() => {
    if (initialOtp && initialOtp.length === OTP_LENGTH) {
      return initialOtp.split("");
    }
    return Array(OTP_LENGTH).fill("");
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState(emailParam || "");
  const [token, setToken] = useState(initialToken || "");

  // Ref để tránh auto-verify chạy trùng lặp trong React Strict Mode
  const autoVerifyTriggered = useRef(false);

  // Đếm ngược cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(
    async (verifyToken: string | null, verifyOtpCode: string) => {
      if (!verifyToken && !email) {
        setErrorMessage("Thiếu email hoặc token xác thực.");
        return;
      }
      if (verifyOtpCode.length !== OTP_LENGTH) {
        setErrorMessage(MESSAGES.invalidOtpLength);
        return;
      }

      setIsVerifying(true);
      setErrorMessage("");
      try {
        const payload: { token?: string; email?: string; otp: string } = {
          otp: verifyOtpCode,
        };
        if (verifyToken) {
          payload.token = verifyToken;
        } else if (email) {
          payload.email = email;
        }

        const result = await AuthService.verifyOtp(payload);
        toastSuccess(result.message || MESSAGES.verifySuccess);
        setSuccessMessage(result.message || MESSAGES.verifySuccessDefault);
        setIsSuccess(true);

        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error: any) {
        const msg = extractErrorMessage(error, MESSAGES.verifyFailed);
        setErrorMessage(msg);
        toastError(msg);
      } finally {
        setIsVerifying(false);
      }
    },
    [router, toastError, toastSuccess, email]
  );

  // Tự động verify nếu URL có sẵn cả token và otp
  useEffect(() => {
    if (initialToken && initialOtp && initialOtp.length === OTP_LENGTH && !autoVerifyTriggered.current) {
      autoVerifyTriggered.current = true;
      handleVerify(initialToken, initialOtp);
    }
  }, [initialToken, initialOtp, handleVerify]);

  const handleManualVerify = () => {
    const fullOtp = otp.join("");
    handleVerify(token || null, fullOtp);
  };

  const handleResend = useCallback(
    async (targetEmail: string) => {
      if (!targetEmail) {
        toastError(MESSAGES.emptyEmail);
        return;
      }
      if (cooldown > 0) return;

      setErrorMessage("");
      try {
        const result = await AuthService.resendOtp({ email: targetEmail });
        toastSuccess(result.message || MESSAGES.resendSuccess);
        if (result?.token) {
          setToken(result.token);
        }
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } catch (error: any) {
        const msg = extractErrorMessage(error, MESSAGES.resendFailed);
        setErrorMessage(msg);
        toastError(msg);
      }
    },
    [cooldown, toastError, toastSuccess]
  );

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