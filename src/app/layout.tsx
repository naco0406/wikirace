import type { Metadata } from "next";
import { Viewport } from "next";
import "../styles/globals.css";
import { TimerProvider } from '@/contexts/TimerContext';
import { EnvironmentProvider } from '@/contexts/EnvironmentContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";

export const metadata: Metadata = {
  title: '링클 | 매일 위키피디아 탐색하기',
  description: "링클 - Linkle",
  keywords: ["링클", "Linkle", "위키피디아", "파도타기", "지식", "게임"],
  authors: [{ name: "Team MYTH" }],
  icons: {
    icon: '/Linkle.ico',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5140632902651926"
          crossOrigin="anonymous">
        </script>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-GJBPD4CLMP"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GJBPD4CLMP');
          `}
        </Script>
      </head>
      <body className="font-sans bg-[#F3F7FF]">
        <EnvironmentProvider>
          <TimerProvider>
            {children}
          </TimerProvider>
          <Analytics />
          <SpeedInsights />
        </EnvironmentProvider>
      </body>
    </html>
  );
}