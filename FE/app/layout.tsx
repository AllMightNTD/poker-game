// src/app/layout.tsx
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ToastProvider } from '@/core/providers/toast-provider';
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["vietnamese"],
  display: "swap",
  variable: "--font-roboto",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL
  ? (process.env.NEXT_PUBLIC_APP_URL.startsWith("http") ? process.env.NEXT_PUBLIC_APP_URL : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://poker-game-git-main-ntd-company.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PKCG - Cổng Game Poker Online Hàng Đầu Việt Nam",
    template: "%s | PKCG",
  },
  description: "Trải nghiệm PKCG - Cổng game Poker online hàng đầu. Tham gia các bàn đấu Texas Hold'em và Omaha gay cấn với hàng ngàn người chơi. Giao dịch nhanh chóng, bảo mật tuyệt đối.",
  keywords: ["poker online", "poker viet nam", "texas holdem", "omaha plo", "game bai poker", "pkcg", "poker cg"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "PKCG - Cổng Game Poker Online Hàng Đầu Việt Nam",
    description: "Trải nghiệm PKCG - Cổng game Poker online hàng đầu. Tham gia các bàn đấu Texas Hold'em và Omaha gay cấn với hàng ngàn người chơi.",
    url: siteUrl,
    siteName: "PKCG",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "PKCG Poker Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PKCG - Cổng Game Poker Online Hàng Đầu Việt Nam",
    description: "Trải nghiệm PKCG - Cổng game Poker online hàng đầu. Tham gia các bàn đấu Texas Hold'em và Omaha gay cấn với hàng ngàn người chơi.",
    images: ["/logo.png"],
  },
};

import MuiThemeProvider from "@/core/providers/mui-theme-provider";
import { UserProvider } from "@/core/providers/user-provider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "PKCG",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`,
        "caption": "PKCG Logo"
      }
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "PKCG - Cổng Game Poker Online",
      "publisher": {
        "@id": `${siteUrl}/#organization`
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
              <UserProvider>
                <SocketProvider>
                  <MuiThemeProvider>
                    {children}
                    <SpeedInsights />
                  </MuiThemeProvider>
                </SocketProvider>
              </UserProvider>
            </ToastProvider>
          </ReactQueryProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
