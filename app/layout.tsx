import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { WagmiProvider } from "./providers/WagmiProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Superchain Token Explorer | Next-Gen Multi-Chain Token Tracker",
  description:
    "Discover, analyze, and track token deployments across the Optimism Superchain ecosystem with real-time insights and advanced safety analytics.",
  keywords:
    "Optimism, Superchain, OP Stack, Base, token explorer, DeFi, liquidity pools, Web3, blockchain",
  authors: [{ name: "Serkan Aydin", url: "https://twitter.com/serayd61" }],
  alternates: {
    canonical: "https://www.superchain-token-explorer.xyz/",
  },
  openGraph: {
    type: "website",
    url: "https://www.superchain-token-explorer.xyz/",
    title: "Superchain Token Explorer | Next-Gen Multi-Chain Token Tracker",
    description:
      "Discover, analyze, and track token deployments across the Optimism Superchain ecosystem with real-time insights and advanced safety analytics.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Superchain Token Explorer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@serayd61",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <WagmiProvider>
            {children}
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
