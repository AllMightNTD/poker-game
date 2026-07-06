
import { PokerAuthBackground } from "@/components/auth/PokerAuthBackground";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PokerAuthBackground>{children}</PokerAuthBackground>
  );
}
