'use client'

import React from "react"
import Image from "next/image"
import { useAuth } from '@/contexts/AuthContext'
import { UserAvatar } from "@/components/global/UserAvatar"

export function DashboardHeader() {
  const { logout } = useAuth()

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      {/* Logo and text on the right */}
      <div className="flex items-center space-x-2">
        <Image src="/yw-logo_only.svg" alt="YW Logo" width={32} height={32} />
        <span className="text-md font-semibold">ywportal</span>
      </div>

      {/* User avatar with dropdown on the left */}
      <div className="flex items-center">
        <UserAvatar logoutOnly />
      </div>
    </header>
  )
}
