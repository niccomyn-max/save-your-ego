import { Suspense } from "react";
import { AccountSettings } from "@/components/account-settings";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  title: "Save Your EGO",
  description:
    "Save Your EGO helps households assess Electricity, Gas and Oil use and generate practical home energy reports.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  
  <Suspense fallback={null}>
  <AccountSettings />
</Suspense>

{children}
</ThemeProvider>
      </body>
    </html>
  );
}
