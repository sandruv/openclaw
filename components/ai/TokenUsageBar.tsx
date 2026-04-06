'use client'

import { useEffect, useState, useCallback } from 'react'
import { AIUsageService, UserUsageResponse } from '@/services/aiUsageService'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface TokenUsageBarProps {
  /** Set to true to trigger a refresh (e.g. after a message finishes streaming) */
  refreshTrigger?: number
  /** Compact layout for narrow panels */
  compact?: boolean
  className?: string
}

export function TokenUsageBar({ refreshTrigger, compact, className }: TokenUsageBarProps) {
  const [usage, setUsage] = useState<UserUsageResponse | null>(null)
  const [error, setError] = useState(false)

  const fetchUsage = useCallback(async () => {
    try {
      const data = await AIUsageService.getUsage()
      setUsage(data)
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage, refreshTrigger])

  // Don't render for unlimited users or on error
  if (error || !usage || usage.unlimited) return null

  const percent = usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0
  const atLimit = usage.used >= usage.limit
  const nearLimit = percent >= 75

  // Next reset date (1st of next month)
  const now = new Date()
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const resetLabel = resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  const barColor = atLimit
    ? 'bg-red-500'
    : percent >= 90
      ? 'bg-red-400'
      : nearLimit
        ? 'bg-yellow-500'
        : 'bg-green-500'

  const formatTokens = (n: number) => n.toLocaleString()

  if (compact) {
    return (
      <div className={cn('px-2 py-1', className)}>
        {atLimit ? (
          <div className="flex items-center gap-1.5 text-xs text-red-500">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            <span>Token limit reached. Resets {resetLabel}.</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{formatTokens(usage.used)} / {formatTokens(usage.limit)}</span>
              <span>{percent}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('px-4 py-2', className)}>
      {atLimit ? (
        <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Token limit reached. Resets on {resetLabel}.</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTokens(usage.used)} / {formatTokens(usage.limit)} tokens this month</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
