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
  title: {
    default: "PKCG - Cổng Game Poker Online Uy Tín Hàng Đầu Việt Nam",
    template: "%s | PKCG",
  },
  description: "Trải nghiệm PKCG - Cổng game bài Poker online đỉnh cao. Tham gia ngay các bàn đấu Texas Hold'em, Omaha kịch tính cùng hàng ngàn game thủ. Giao dịch nhanh chóng, bảo mật tuyệt đối.",
  keywords: ["poker online", "poker viet nam", "texas holdem", "omaha plo", "game bai poker", "pkcg", "poker cg"],
  openGraph: {
    title: "PKCG - Cổng Game Poker Online Uy Tín Hàng Đầu Việt Nam",
    description: "Trải nghiệm PKCG - Cổng game bài Poker online đỉnh cao. Tham gia ngay các bàn đấu Texas Hold'em, Omaha kịch tính cùng hàng ngàn game thủ.",
    url: "https://pkcg.com",
    siteName: "PKCG",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PKCG - Cổng Game Poker Online Uy Tín Hàng Đầu Việt Nam",
    description: "Trải nghiệm PKCG - Cổng game bài Poker online đỉnh cao. Tham gia ngay các bàn đấu Texas Hold'em, Omaha kịch tính cùng hàng ngàn game thủ.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={quicksand.className}>
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
