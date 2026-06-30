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
    default: "XIJIU Intelligent Equipment | Hydraulic Cylinder Manufacturer",
    template: "%s | XIJIU Intelligent Equipment",
  },
  description:
    "XIJIU Intelligent Equipment supplies hydraulic cylinders, custom hydraulic cylinders, honed tubes, chrome plated rods, and hydraulic power units.",
  keywords: [
    "hydraulic cylinder manufacturer",
    "custom hydraulic cylinders",
    "hydraulic components supplier",
    "hydraulic cylinder factory in China",
    "XIJIU Intelligent Equipment",
    "honed tube",
    "chrome plated rod",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "XIJIU Intelligent Equipment | Hydraulic Cylinder Manufacturer",
    description:
      "Hydraulic cylinders, custom hydraulic components, honed tubes, chrome plated rods, and hydraulic power units for overseas B2B buyers.",
    url: "https://www.hcjpistonrod.com",
    siteName: "XIJIU Intelligent Equipment",
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
