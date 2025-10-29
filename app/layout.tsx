// app/layout.tsx

import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepVerse",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* Add your color classes here.
        The "pattern" class from the tutorial is fine to keep.
      */}
      <body
        className={`${monaSans.className} antialiased pattern bg-white text-black dark:bg-gray-900 dark:text-white`}
      >
        {children}

        <Toaster />
      </body>
    </html>
  );
}