import { useEffect, useRef } from 'react'

interface UseTimerIncrementProps {
  isRunning: boolean
  onIncrement: () => void
}

/**
 * Hook to handle timer increment interval
 * Only runs when timer is active for the current task
 */
export function useTimerIncrement({
  isRunning,
  onIncrement,
}: UseTimerIncrementProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(onIncrement, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, onIncrement])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])
}
