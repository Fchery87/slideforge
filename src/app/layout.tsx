import type { Metadata } from "next";
import { Syne, Manrope } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SlideForge — Create Stunning Slideshows",
  description:
    "Upload images, add music, apply effects, and export slideshows in any format. For every occasion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${manrope.variable} h-full dark`} suppressHydrationWarning>
      <body className="min-h-full bg-[#0F0F23] font-[family-name:var(--font-manrope)] text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
