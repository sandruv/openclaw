'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ChatButtonProps {
  onClick: () => void
  isActive?: boolean
}

export const ChatButton = ({ onClick, isActive }: ChatButtonProps) => {
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Don't run interval if chat is open
    if (isActive) {
      setShowTooltip(false)
      return
    }

    // Show tooltip every 30 seconds
    const interval = setInterval(() => {
      setShowTooltip(true)
      // Hide after 3 seconds
      setTimeout(() => setShowTooltip(false), 5000)
    }, 30000)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <TooltipProvider>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={onClick}
            className={cn(
              "w-15 position-relative text-zinc-400 hover:text-white hover:bg-zinc-800 p-0",
              isActive && "bg-zinc-800 text-white"
            )}
          >
            <Image
              src="/dashboard-assets/help2.svg"
              alt="Help"
              width={45}  
              height={45}
              className="position-absolute top-1"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-green-500 text-white border-green-500">
          <p>Need help? Chat with us!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
