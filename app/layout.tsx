import React from "react";
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Uroflujometro - Dashboard de Monitoreo",
  description:
    "Sistema profesional de uroflujometria para monitoreo y analisis de micciones",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/gyn-logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/gyn-logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/Logo.png",
        type: "image/png",
      },
    ],
    apple: "/gyn-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${_inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
