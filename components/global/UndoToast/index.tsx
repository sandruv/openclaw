'use client'

import { useState, useEffect, useRef } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface UndoToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  onUndo?: () => void
  duration?: number
}

export function UndoToast({
  message,
  isVisible,
  onClose,
  onUndo,
  duration = 5000
}: UndoToastProps) {
  const [progress, setProgress] = useState(100)
  const [isClosing, setIsClosing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Handle animation and timing
  useEffect(() => {
    // Capture the current interval ref value when the effect runs
    const currentIntervalRef = intervalRef.current;
    
    if (isVisible && !isClosing) {
      // Reset progress when toast becomes visible
      setProgress(100)
      startTimeRef.current = Date.now()

      // Use requestAnimationFrame for smooth progress animation
      const animate = () => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current
          const newProgress = 100 - (elapsed / duration) * 100
          
          if (newProgress <= 0) {
            setProgress(0)
            setIsClosing(true)
            setTimeout(() => {
              onClose()
              setIsClosing(false)
            }, 300) // Match transition duration
          } else {
            setProgress(newProgress)
            animationFrameRef.current = requestAnimationFrame(animate)
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Use the captured interval ref value from when the effect ran
      if (currentIntervalRef) {
        clearInterval(currentIntervalRef)
      }
    }
  }, [isVisible, duration, onClose, isClosing])

  // Handle manual close
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300) // Match transition duration
  }

  // Handle undo action
  const handleUndo = () => {
    if (onUndo) {
      onUndo()
      handleClose()
    }
  }

  if (!isVisible && !isClosing) return null

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out",
        isVisible && !isClosing ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      )}
    >
      <div className="bg-background border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 max-w-md">
        {/* Circular progress indicator */}
        <div className="relative h-8 w-8 flex-shrink-0">
          <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
            <circle
              className="stroke-muted"
              fill="none"
              strokeWidth="3"
              cx="16"
              cy="16"
              r="14"
            />
            <circle
              className="stroke-primary"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="88"
              strokeDashoffset={88 - (88 * progress) / 100}
              cx="16"
              cy="16"
              r="14"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {Math.ceil(progress / 20)}
          </span>
        </div>
        
        {/* Message */}
        <p className="text-sm flex-1">{message}</p>
        
        {/* Buttons */}
        <div className="flex items-center gap-2">
          {onUndo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              className="h-8 px-2 text-xs flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Undo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
