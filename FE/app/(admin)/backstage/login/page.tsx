import { AdminLoginForm } from "@/features/admin/components/AdminLoginForm";
import { PokerAuthBackground } from "@/components/auth/PokerAuthBackground";

export default function AdminLoginPage() {
  return (
    <PokerAuthBackground showBranding={false}>
      <AdminLoginForm />
    </PokerAuthBackground>
  );
}
