import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClearGroup — AI WhatsApp Project Intelligence",
  description:
    "Transform chaotic WhatsApp group chats into organized project dashboards in 30 seconds. Extract tasks, decisions, blockers, and deadlines using AI.",
  keywords: "WhatsApp, project management, AI, college students, group chat, task management",
  openGraph: {
    title: "ClearGroup — AI WhatsApp Project Intelligence",
    description: "Transform your group chat chaos into clarity in 30 seconds",
    url: "https://cleargroup.vercel.app",
    siteName: "ClearGroup",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearGroup",
    description: "Transform WhatsApp chaos into project clarity",
  },
};

// Root layout — minimal shell. Each page/section brings its own chrome.
// Marketing pages use <MarketingLayout>; app pages use their own navbars.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head><meta charSet="UTF-8" /></head>
      <body className={`${inter.variable} font-sans antialiased page-fade-in`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
