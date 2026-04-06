'use client'

import { useEffect, useState, useRef } from "react"
import { useTimerStore } from "@/stores/useTimerStore"
import { formatDuration } from "@/lib/dateTimeFormat"
import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import pusherService from "@/services/pusherService"

export function ActiveTimerPill() {
  const router = useRouter()
  const { checkGlobalActiveTimer, globalActiveTimer, isCheckingGlobalTimer, clearGlobalActiveTimer } = useTimerStore()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch active timer on mount with small delay to allow auth cookies to be set
  useEffect(() => {
    // Add 500ms delay to ensure cookies are set during initial login
    const timeoutId = setTimeout(() => {
      checkGlobalActiveTimer()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [checkGlobalActiveTimer])

  // Listen for timer stop events via Pusher
  useEffect(() => {
    const handleTimerEvent = (data: { action: string; ticketId?: number; taskId?: number }) => {
      if (data.action === 'stop') {
        // Timer was stopped - clear the global timer state
        clearGlobalActiveTimer()
      } else if (data.action === 'start') {
        // Timer started - refresh to get updated info
        checkGlobalActiveTimer()
      }
    }

    // Subscribe to global tasks channel for timer events
    pusherService.subscribe('tasks-channel', 'task:timer', handleTimerEvent)

    return () => {
      pusherService.unsubscribe('tasks-channel', 'task:timer', handleTimerEvent)
    }
  }, [clearGlobalActiveTimer, checkGlobalActiveTimer])

  // Set up timer increment when we have an active timer
  useEffect(() => {
    if (globalActiveTimer) {
      // Initialize with elapsed seconds from API
      setElapsedSeconds(globalActiveTimer.elapsedSeconds)

      // Start incrementing every second
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1)
      }, 1000)
    } else {
      setElapsedSeconds(0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [globalActiveTimer])

  if (!globalActiveTimer || isCheckingGlobalTimer) return null

  const handleClick = () => {
    router.push(`/tasks/${globalActiveTimer.ticketId}`)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-mono font-medium transition-colors cursor-pointer"
          >
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>{formatDuration(elapsedSeconds)}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 text-white p-1 px-2 rounded">
          <p className="text-sm">Go to Task #{globalActiveTimer.ticketId}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
