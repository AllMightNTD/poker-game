import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AuthService } from "../services/auth.service";

const REMEMBER_EMAIL_KEY = "sociala_remembered_email";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await AuthService.logout();
    } catch {
      // Ignore network errors — always clear FE session
    } finally {
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      localStorage.removeItem("token");
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
      router.push("/login");
      setIsLoggingOut(false);
    }
  }, [router]);

  return { logout, isLoggingOut };
}
