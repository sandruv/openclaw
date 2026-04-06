"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useAuth } from '@/contexts/AuthContext'

export default function LogoutPage() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md overflow-hidden bg-black/80">
        <CardHeader className="bg-muted p-0">
          <div className="flex flex-col justify-center items-center pt-6 bg-black/80">
            <Image
              src={process.env.NEXT_PUBLIC_LOGO_PATH || "/yw-logo.png"}
              alt="YW Portal Logo"
              width={240}
              height={80}
              className="dark:invert"
              priority
            />
            <CardTitle className="text-2xl font-bold text-center text-gray-200 mt-5">YW Portal</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <CardDescription className="text-center mb-6 text-gray-300">
            Click the button below to log out of your account
          </CardDescription>
          <Button 
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
