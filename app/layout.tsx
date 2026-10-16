import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevlStreak — Track your progress. Build your legacy.",
  description:
    "Turn your GitHub activity into a visual journey of growth — streaks, XP, levels, achievements, and shareable cards.",
  manifest: "/manifest.json",
  icons: { apple: "/icon.svg" },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} bg-[#0a0a0a] text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
