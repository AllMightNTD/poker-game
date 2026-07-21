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

export const metadata: Metadata = {
  title: {
    default: "PKCG - Vietnam's Leading Online Poker Portal",
    template: "%s | PKCG",
  },
  description: "Experience PKCG - The ultimate online Poker portal. Join thrilling Texas Hold'em and Omaha tables with thousands of players. Fast transactions, absolute security.",
  keywords: ["poker online", "poker viet nam", "texas holdem", "omaha plo", "game bai poker", "pkcg", "poker cg"],
  alternates: {
    canonical: "https://pkcg.com",
  },
  openGraph: {
    title: "PKCG - Vietnam's Leading Online Poker Portal",
    description: "Experience PKCG - The ultimate online Poker portal. Join thrilling Texas Hold'em and Omaha tables with thousands of players.",
    url: "https://pkcg.com",
    siteName: "PKCG",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PKCG - Vietnam's Leading Online Poker Portal",
    description: "Experience PKCG - The ultimate online Poker portal. Join thrilling Texas Hold'em and Omaha tables with thousands of players.",
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
      "name": "PKCG - Online Poker Portal",
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
