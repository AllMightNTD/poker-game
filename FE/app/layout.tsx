// src/app/layout.tsx
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ToastProvider } from '@/core/providers/toast-provider';
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["vietnamese"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    default: "PKCG - Cổng Game Poker Online Uy Tín Hàng Đầu Việt Nam",
    template: "%s | PKCG",
  },
  description: "Trải nghiệm PKCG - Cổng game bài Poker online đỉnh cao. Tham gia ngay các bàn đấu Texas Hold'em, Omaha kịch tính cùng hàng ngàn game thủ. Giao dịch nhanh chóng, bảo mật tuyệt đối.",
  keywords: ["poker online", "poker viet nam", "texas holdem", "omaha plo", "game bai poker", "pkcg", "poker cg"],
  alternates: {
    canonical: "https://pkcg.com",
  },
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

import MuiThemeProvider from "@/core/providers/mui-theme-provider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://pkcg.com/#organization",
      "name": "PKCG",
      "url": "https://pkcg.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pkcg.com/favicon.ico",
        "caption": "PKCG Logo"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://pkcg.com/#website",
      "url": "https://pkcg.com",
      "name": "PKCG - Cổng Game Poker Online",
      "publisher": {
        "@id": "https://pkcg.com/#organization"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${roboto.variable} ${roboto.className}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ReactQueryProvider>
            <ToastProvider>
              <SocketProvider>
                <MuiThemeProvider>
                  {children}
                </MuiThemeProvider>
              </SocketProvider>
            </ToastProvider>
          </ReactQueryProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
