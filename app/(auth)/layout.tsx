import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import AuthLayout from "@/layouts/auth-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YW Portal",
  description: "A ticketing system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className + "bg-purple-500"}>
      <AuthLayout>{children}</AuthLayout>
    </div>
  )
}