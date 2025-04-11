import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Insonlar Aloqalari Vizualizatori",
  description: "Ikki shaxs o'rtasidagi aloqalarni vizualizatsiya qilish",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
