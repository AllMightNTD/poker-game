// src/app/layout.tsx
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ToastProvider } from '@/core/providers/toast-provider';
import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PKCG",
  description: "Poker Game CG",
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
