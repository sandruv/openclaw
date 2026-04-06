import { useEffect } from 'react'
import { formatDuration } from '@/lib/dateTimeFormat'

interface UseBrowserTabTitleProps {
  taskId: number | undefined
  elapsedSeconds: number
  isRunning: boolean
}

/**
 * Hook to update browser tab title with running timer
 * Restores original title when timer stops or component unmounts
 */
export function useBrowserTabTitle({
  taskId,
  elapsedSeconds,
  isRunning,
}: UseBrowserTabTitleProps) {
  useEffect(() => {
    if (!taskId) return

    const originalTitle = document.title

    if (isRunning) {
      document.title = `⏱️ ${formatDuration(elapsedSeconds)} - Task #${taskId}`
    }

    return () => {
      document.title = originalTitle
    }
  }, [taskId, elapsedSeconds, isRunning])
}
