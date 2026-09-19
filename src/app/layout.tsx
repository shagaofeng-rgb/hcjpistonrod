import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { FloatingCTA } from "@/components/floating-cta";
import { AnalyticsTracker } from "@/components/analytics-tracker";
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
    default: "Piston Rod, Hard Chrome Plated Rod & Honed Tube Manufacturer | XIJIU",
    template: "%s | XIJIU Intelligent Equipment",
  },
  description:
    "XIJIU manufactures CK45 and 20MnV6 chrome plated rods, piston rods, honed tubes and SRB tubes with drawing-based machining for hydraulic cylinder OEMs worldwide.",
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
    title: "Piston Rod, Hard Chrome Plated Rod & Honed Tube Manufacturer | XIJIU",
    description:
      "XIJIU manufactures chrome plated rods, piston rods, honed tubes and SRB tubes for hydraulic cylinder OEM requirements.",
    url: "https://www.hcjpistonrod.com",
    siteName: "XIJIU Intelligent Equipment",
    images: [{ url: "/images/og/home.jpg", width: 1200, height: 630, alt: "XIJIU Intelligent Equipment factory" }],
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
      suppressHydrationWarning
    >
      <head>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2423431361518789');
fbq('track', 'PageView');`}
        </Script>
      </head>
      <body>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2423431361518789&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        <FloatingCTA />
        <Suspense fallback={null}><AnalyticsTracker /></Suspense>
        <Analytics />
      </body>
    </html>
  );
}
