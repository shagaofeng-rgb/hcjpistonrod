import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hcjpistonrod.com"),
  title: {
    default: "Nantong Huichenjin | Hydraulic Piston Rods & Hard Chrome Rods",
    template: "%s | Nantong Huichenjin",
  },
  description:
    "Factory supply and export support for hard chrome plated rods, induction hardened piston rods, honed tubes, and hydraulic cylinder components.",
  keywords: [
    "hydraulic piston rod",
    "hard chrome plated rod",
    "induction hardened chrome rod",
    "honed tube",
    "hydraulic cylinder components",
  ],
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
