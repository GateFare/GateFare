import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import LenisInitializer from "@/components/lenis-initializer"
import "./globals.css"

import { CrispChat } from "@/components/crisp-chat"
import { CallButton } from "@/components/call-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gatefare - Premium Flight Inquiry Platform",
  description: "Discover and inquire about premium flight options with Gatefare, your luxury travel concierge.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`} suppressHydrationWarning>
        <LenisInitializer />
        <CrispChat />
        <CallButton />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
