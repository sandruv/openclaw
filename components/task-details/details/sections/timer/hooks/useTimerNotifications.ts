import { useEffect, useRef } from 'react'
import { formatDuration } from '@/lib/dateTimeFormat'
import { SOUNDS, NOTIFICATION_VOLUME } from '../timerConfig'

interface UseTimerNotificationsProps {
  taskId: number | undefined
  isRunning: boolean
  intervalMinutes: number
  getElapsedSeconds: () => number
}

/**
 * Hook to handle periodic desktop notifications while timer is running
 * Requests notification permission and plays sound with each reminder
 */
export function useTimerNotifications({
  taskId,
  isRunning,
  intervalMinutes,
  getElapsedSeconds,
}: UseTimerNotificationsProps) {
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!taskId || !isRunning) {
      // Clear interval if timer is not running
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current)
        notificationIntervalRef.current = null
      }
      return
    }

    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Pre-load audio to avoid performance issues in interval handler
    let notificationAudio: HTMLAudioElement | null = null
    try {
      notificationAudio = new Audio(SOUNDS.NOTIFICATION)
      notificationAudio.volume = NOTIFICATION_VOLUME
      notificationAudio.load()
    } catch {
      // Audio not supported
    }

    // Function to show desktop notification with sound
    const showTimerReminder = () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(`⏱️ Timer Running - Task #${taskId}`, {
          body: `You've been tracking time for ${formatDuration(getElapsedSeconds())}`,
          icon: '/favicon.ico',
          tag: 'timer-reminder',
          requireInteraction: false,
        })

        // Play pre-loaded notification sound
        if (notificationAudio) {
          notificationAudio.currentTime = 0
          notificationAudio.play().catch(() => {})
        }

        // Auto-close notification after 5 seconds
        setTimeout(() => notification.close(), 5000)
      }
    }

    // Set up periodic notification
    const intervalMs = intervalMinutes * 60 * 1000
    notificationIntervalRef.current = setInterval(showTimerReminder, intervalMs)

    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current)
        notificationIntervalRef.current = null
      }
      notificationAudio = null
    }
  }, [taskId, isRunning, intervalMinutes, getElapsedSeconds])
}
