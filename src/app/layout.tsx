import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingCTA } from "@/components/floating-cta";
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
    default: "XIJIU Intelligent Equipment | Piston Rod and Chrome Plated Rod Manufacturer",
    template: "%s | XIJIU Intelligent Equipment",
  },
  description:
    "XIJIU Intelligent Equipment supplies piston rods, hard chrome plated rods, honed tubes, and drawing-based precision hydraulic components.",
  keywords: [
    "piston rod manufacturer",
    "hard chrome plated rod supplier",
    "hydraulic components supplier",
    "hydraulic piston rod factory in China",
    "XIJIU Intelligent Equipment",
    "honed tube",
    "chrome plated rod",
    "hydraulic piston rod",
  ],
  openGraph: {
    type: "website",
    title: "XIJIU Intelligent Equipment | Piston Rod and Chrome Plated Rod Manufacturer",
    description:
      "Piston rods, hard chrome plated rods, honed tubes, and drawing-based hydraulic components for overseas B2B buyers.",
    url: "https://www.hcjpistonrod.com",
    siteName: "XIJIU Intelligent Equipment",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
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
      <body>
        {children}
        <FloatingCTA />
      </body>
    </html>
  );
}
