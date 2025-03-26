import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Focus Sound Mixer",
  description: "Mix nature sounds, white noise, and melodies for the perfect focus environment",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-white text-foreground">
        {children}
      </body>
    </html>
  )
}

import "./globals.css"