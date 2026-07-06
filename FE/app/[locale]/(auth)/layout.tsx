import { AuthLocaleRedirect } from "@/components/auth/AuthLocaleRedirect";
import { PokerAuthBackground } from "@/components/auth/PokerAuthBackground";

export default async function AuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <AuthLocaleRedirect currentLocale={locale}>
      <PokerAuthBackground>{children}</PokerAuthBackground>
    </AuthLocaleRedirect>
  );
}
