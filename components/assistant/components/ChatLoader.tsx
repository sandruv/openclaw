"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { LoadingDots } from "@/components/custom/loading-dots"

interface ChatLoaderProps {
  isLoading: boolean;
}

export function ChatLoader({ isLoading }: ChatLoaderProps) {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 z-9 flex items-center justify-center">
      <div className="absolute inset-0 bg-transparent backdrop-blur-sm animate-in fade-in-0" />
      <div className={cn(
        "relative z-50 w-full max-w-md rounded-lg bg-white py-2 px-4 shadow-lg duration-200 sm:max-w-[300px]",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-[48%]"
      )}>
        <div className="flex items-center justify-between">
          <div className="relative w-[40px] h-[40px]">
            <Loader2 className="w-[40px] h-[40px] animate-spin text-lime-500 absolute" />
            <Image
              src="/yw-logo_only.png"
              alt="YW Logo"
              width={25}
              height={25}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <p className="text-sm text-gray-600">Loading<LoadingDots /></p>
          <p className="w-[40px]"></p>
        </div>
      </div>
    </div>
  )
}
