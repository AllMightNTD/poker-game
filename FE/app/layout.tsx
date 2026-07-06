// src/app/layout.tsx
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={quicksand.className}>
      <body>
        <ReactQueryProvider>
          <ToastProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
