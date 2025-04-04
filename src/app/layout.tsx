import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import React from "react";
import Header from "./components/Header";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CacheProvider } from "./cache/CacheProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Park Easy",
  description: "Easy parking at an arm's length!",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CacheProvider>
          <Header />
          <main id="main" className="w-[100%] h-[100%] flex justify-center items-center">
            <AppRouterCacheProvider>
              {children}
            </AppRouterCacheProvider>
          </main>
        </CacheProvider>
      </body>
    </html>
  );
}
