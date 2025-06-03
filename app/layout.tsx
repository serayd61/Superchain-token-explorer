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
  title: "Superchain Token Explorer | OP Stack Multi-Chain Token Tracker",
  description: "Real-time token deployment tracking across the Optimism Superchain ecosystem. Monitor liquidity pools and discover new opportunities on Base, OP Mainnet, Mode, Zora, and more.",
  keywords: "Optimism, Superchain, OP Stack, Base, token explorer, DeFi, liquidity pools, Web3, blockchain",
  authors: [{ name: "Serkan Aydin", url: "https://twitter.com/serayd61" }],
  openGraph: {
    title: "Superchain Token Explorer",
    description: "Track new token deployments across 7+ OP Stack chains",
    url: "https://superchain-token-explorer.vercel.app",
    siteName: "Superchain Token Explorer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Superchain Token Explorer - Track tokens across OP Stack chains",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Superchain Token Explorer",
    description: "Real-time token tracking across the Optimism Superchain",
    creator: "@serayd61",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}