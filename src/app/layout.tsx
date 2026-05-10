import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers          from "@/components/layout/Providers";
import Navbar             from "@/components/layout/Navbar";
import Footer             from "@/components/layout/Footer";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClearGroup",
  description: "AI-powered WhatsApp group chat analyser",
};

// Root layout — mounts sticky Navbar and offsets page content below it
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased page-fade-in`}>
        <Providers>
          <AnnouncementBanner />
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
