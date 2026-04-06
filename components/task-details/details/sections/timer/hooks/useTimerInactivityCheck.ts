import { useEffect, useRef, useState, useCallback } from 'react'

interface UseTimerInactivityCheckProps {
  isRunning: boolean
  checkIntervalMinutes: number // How often to show the confirmation (e.g., every 30 min)
  confirmationTimeoutSeconds: number // How long user has to confirm (e.g., 120 sec = 2 min)
  onTimeout: () => void // Called when user doesn't confirm in time
}

interface UseTimerInactivityCheckReturn {
  showConfirmation: boolean
  remainingSeconds: number
  onConfirm: () => void
  onDismiss: () => void
}

/**
 * Hook to check for user inactivity and prompt for confirmation
 * If user doesn't confirm within the timeout, triggers auto-stop
 */
export function useTimerInactivityCheck({
  isRunning,
  checkIntervalMinutes,
  confirmationTimeoutSeconds,
  onTimeout,
}: UseTimerInactivityCheckProps): UseTimerInactivityCheckReturn {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(confirmationTimeoutSeconds)
  
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasTimedOutRef = useRef(false)
  
  // Use refs for callbacks to prevent effect re-runs
  const onTimeoutRef = useRef(onTimeout)
  const confirmationTimeoutSecondsRef = useRef(confirmationTimeoutSeconds)
  const checkIntervalMinutesRef = useRef(checkIntervalMinutes)
  
  // Keep refs updated
  useEffect(() => {
    onTimeoutRef.current = onTimeout
    confirmationTimeoutSecondsRef.current = confirmationTimeoutSeconds
    checkIntervalMinutesRef.current = checkIntervalMinutes
  })

  // Clear all intervals
  const clearAllIntervals = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
      checkIntervalRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  // Start the countdown when confirmation is shown (uses refs to avoid deps)
  const startCountdown = useCallback(() => {
    setRemainingSeconds(confirmationTimeoutSecondsRef.current)
    hasTimedOutRef.current = false
    
    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Time's up - trigger timeout
          if (!hasTimedOutRef.current) {
            hasTimedOutRef.current = true
            setShowConfirmation(false)
            onTimeoutRef.current()
          }
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, []) // No deps - uses refs

  // User confirmed they're still working
  const onConfirm = useCallback(() => {
    setShowConfirmation(false)
    setRemainingSeconds(confirmationTimeoutSecondsRef.current)
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    
    // Restart the check interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
    }
    
    const intervalMs = checkIntervalMinutesRef.current * 60 * 1000
    checkIntervalRef.current = setInterval(() => {
      setShowConfirmation(true)
      startCountdown()
    }, intervalMs)
  }, [startCountdown])

  // User dismissed (same as confirm for now)
  const onDismiss = useCallback(() => {
    onConfirm()
  }, [onConfirm])

  // Main effect to set up the inactivity check - only depends on isRunning
  useEffect(() => {
    console.log('[InactivityCheck] isRunning:', isRunning)
    
    if (!isRunning) {
      clearAllIntervals()
      setShowConfirmation(false)
      setRemainingSeconds(confirmationTimeoutSecondsRef.current)
      return
    }

    // Set up the periodic check
    const intervalMs = checkIntervalMinutesRef.current * 60 * 1000
    console.log('[InactivityCheck] Setting up interval:', intervalMs, 'ms')
    
    checkIntervalRef.current = setInterval(() => {
      console.log('[InactivityCheck] Showing confirmation dialog')
      setShowConfirmation(true)
      startCountdown()
    }, intervalMs)

    return () => {
      clearAllIntervals()
    }
  }, [isRunning, clearAllIntervals, startCountdown])

  return {
    showConfirmation,
    remainingSeconds,
    onConfirm,
    onDismiss,
  }
}
