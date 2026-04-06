'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Clock, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SOUNDS,
  NOTIFICATION_VOLUME,
  INACTIVITY_SOUND_INTERVAL_MS,
  INACTIVITY_TIMEOUT_SECONDS,
} from '../timerConfig'

interface TimerContinueDialogProps {
  open: boolean
  ticketId: number
  remainingSeconds: number
  onContinue: () => void
  onStop: () => void
}

// Play notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio(SOUNDS.INACTIVITY)
    audio.volume = NOTIFICATION_VOLUME
    audio.play().catch(() => {})
  } catch {
    // Audio not supported
  }
}

export function TimerContinueDialog({
  open,
  ticketId,
  remainingSeconds,
  onContinue,
  onStop,
}: TimerContinueDialogProps) {
  const [isClosing, setIsClosing] = useState(false)
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasPlayedInitialRef = useRef(false)

  // Calculate progress percentage (starts at 100, goes to 0)
  const progress = (remainingSeconds / INACTIVITY_TIMEOUT_SECONDS) * 100

  // Play sound when dialog opens and every interval
  useEffect(() => {
    if (open && !isClosing) {
      // Play initial sound when dialog opens
      if (!hasPlayedInitialRef.current) {
        playNotificationSound()
        hasPlayedInitialRef.current = true
      }

      // Set up interval to play sound periodically
      soundIntervalRef.current = setInterval(() => {
        playNotificationSound()
      }, INACTIVITY_SOUND_INTERVAL_MS)
    } else {
      hasPlayedInitialRef.current = false
    }

    return () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current)
        soundIntervalRef.current = null
      }
    }
  }, [open, isClosing])

  // Handle continue action with animation
  const handleContinue = () => {
    setIsClosing(true)
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current)
      soundIntervalRef.current = null
    }
    setTimeout(() => {
      onContinue()
      setIsClosing(false)
    }, 300)
  }

  // Handle stop action with animation
  const handleStop = () => {
    setIsClosing(true)
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current)
      soundIntervalRef.current = null
    }
    setTimeout(() => {
      onStop()
      setIsClosing(false)
    }, 300)
  }

  // Reset closing state when dialog opens
  useEffect(() => {
    if (open) {
      setIsClosing(false)
    }
  }, [open])

  if (!open && !isClosing) return null

  return (
    <div
      className={cn(
        "fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out",
        open && !isClosing ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
      )}
    >
      <div className="bg-background border shadow-lg rounded-lg px-4 py-3 flex items-center gap-4 max-w-lg">
        {/* Circular progress indicator */}
        <div className="relative h-10 w-10 flex-shrink-0">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
            <circle
              className="stroke-muted"
              fill="none"
              strokeWidth="3"
              cx="20"
              cy="20"
              r="17"
            />
            <circle
              className="stroke-amber-500"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="107"
              strokeDashoffset={107 - (107 * progress) / 100}
              cx="20"
              cy="20"
              r="17"
            />
          </svg>
          <Clock className="absolute inset-0 m-auto h-4 w-4 text-amber-500" />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Still working on Task #{ticketId}?</p>
          <p className="text-xs text-muted-foreground">
            Auto-stop in {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            className="h-8 px-3 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Stop
          </Button>
          <Button
            size="sm"
            onClick={handleContinue}
            className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
          >
            <Check className="h-3 w-3 mr-1" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
