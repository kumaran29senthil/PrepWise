// app/layout.tsx

import { Toaster } from "sonner";
import type { Metadata } from "next";

import "./globals.css";

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
      <body
        className="antialiased pattern bg-white text-black dark:bg-gray-900 dark:text-white"
        style={{
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {children}

        <Toaster />
      </body>
    </html>
  );
}