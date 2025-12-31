import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "24/7 Humanless DriveThru",
  description: "The end of service staff.",
  generator: "v0.app",
}

import { Toaster } from "@/components/ui/toaster"
import { DatadogRumInit } from "@/components/datadog-rum-init"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
        <DatadogRumInit />
        <Suspense fallback={<div>Loading...</div>}>
          <div className="animated-bg"></div>
          {children}
        </Suspense>
        <Toaster />
      </body>
    </html>
  )
}
