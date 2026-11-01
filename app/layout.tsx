import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import InteractiveBackground from "@/components/InteractiveBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Form3D — AI 3D Creation Studio",
  description: "Turn text descriptions into interactive 3D models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full`}>
        <InteractiveBackground />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
