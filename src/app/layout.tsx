import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ViewModeProvider } from "@/contexts/ViewModeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarbonTrack - PCF 대시보드",
  description:
    "제품 탄소 발자국(PCF) 시각화 대시보드. GHG Protocol 기반 전과정 탄소 배출량 관리.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-gray-50">
        <ViewModeProvider>
          <Sidebar />
          <main className="min-h-screen lg:ml-64">{children}</main>
        </ViewModeProvider>
      </body>
    </html>
  );
}
