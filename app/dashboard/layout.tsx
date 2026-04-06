"use client"

import { Inter } from "next/font/google"
import "../globals.css"
import { DashboardLayout } from "@/components/dashboard/layout"
import { useAuth } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth();

  // Get current user info for chat
  const userId = user?.id || 0;

  return (
    <div className={inter.className}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </div>
  )
}