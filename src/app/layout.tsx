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
  title: "ClearGroup",
  description: "AI-powered WhatsApp group chat analyser",
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
      <body className={`${inter.variable} font-sans antialiased page-fade-in`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
