import type { Metadata } from "next";
import "../styles/globals.css";
import { TimerProvider } from '@/contexts/TimerContext';

export const metadata: Metadata = {
  title: "링클 - Linkle",
  description: "위키피디아 스피드런",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-pretendard">
        <TimerProvider>
          {children}
        </TimerProvider>
      </body>
    </html>
  );
}