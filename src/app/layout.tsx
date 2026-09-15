import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIMNAS MBPP — Sistem Pencarian Instan Q&A (< 1 Detik)",
  description: "Mesin pencarian instan untuk 200 soal jawab PIMNAS MBPP 2026. Temukan jawaban kurang dari 1 detik langsung saat mengetik.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased selection:bg-blue-500/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
