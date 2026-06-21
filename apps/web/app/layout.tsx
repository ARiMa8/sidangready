import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SidangReady AI",
  description:
    "Asisten AI untuk mengecek kesiapan sidang, konsistensi laporan dan PPT, serta revisi skripsi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body>{children}</body>
    </html>
  );
}
