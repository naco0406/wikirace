import type { Metadata } from "next";
import "../styles/globals.css";
import { TimerProvider } from '@/contexts/TimerContext';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "링클 - Linkle",
  description: "매일 위키피디아 탐색하기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5140632902651926"
          crossOrigin="anonymous"></script>
      </head>
      <body className="font-sans">
        <TimerProvider>
          {children}
        </TimerProvider>
        <Analytics />
      </body>
    </html>
  );
}