// src/app/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "../globals.css";
import { ToastProvider } from '@/core/providers/toast-provider';
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

const quicksand = Quicksand({
  subsets: ["vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sociala",
  description: "Mạng xã hội Sociala",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={quicksand.className}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ReactQueryProvider>
            <ToastProvider>
              <SocketProvider>
                {children}
              </SocketProvider>
            </ToastProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
