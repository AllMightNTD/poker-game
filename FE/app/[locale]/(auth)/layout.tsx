import { AuthLocaleRedirect } from "@/components/auth/AuthLocaleRedirect";

export default async function AuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return <AuthLocaleRedirect currentLocale={locale}>{children}</AuthLocaleRedirect>;
}
