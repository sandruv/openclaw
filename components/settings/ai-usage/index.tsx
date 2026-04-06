'use client'

import { useEffect, useState, useCallback } from 'react'
import { AIUsageService, UserUsageResponse } from '@/services/aiUsageService'
import { cn } from '@/lib/utils'
import { AlertTriangle, Bot, RefreshCw } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export default function AIUsageSettings() {
  const [usage, setUsage] = useState<UserUsageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const data = await AIUsageService.getUsage()
      setUsage(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefresh = async () => {
    await fetchUsage()
  }

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  const formatTokens = (n: number) => n.toLocaleString()

  const percent = usage && usage.limit > 0
    ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
    : 0

  const atLimit = usage ? usage.used >= usage.limit && !usage.unlimited : false

  const barColor = atLimit
    ? 'bg-red-500'
    : percent >= 90
      ? 'bg-red-400'
      : percent >= 75
        ? 'bg-yellow-500'
        : 'bg-green-500'

  const now = new Date()
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const resetLabel = resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  if (error || !usage) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Unable to load AI usage data.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-8 relative h-[calc(100vh-130px)] max-w-[1000px]">
      {/* Left: Usage Overview */}
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Usage Overview
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>

        {usage.unlimited && (
          <p className="text-sm text-muted-foreground">
            Your role has unlimited AI usage — no token limits apply.
          </p>
        )}

        <div className="space-y-5">
          {/* Progress bar — only for limited users */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Monthly Usage</span>
              {!usage.unlimited && <span className="font-medium">{percent}%</span>}
            </div>
            {!usage.unlimited && (
              <>
                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', barColor)}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTokens(usage.used)} used</span>
                  <span>{formatTokens(usage.limit)} limit</span>
                </div>
              </>
            )}
          </div>

          {atLimit && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-md p-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Token limit reached. Resets on {resetLabel}.</span>
            </div>
          )}

          {/* Tokens used */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tokens Used</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatTokens(usage.used)}
              </span>
            </div>
            {!usage.unlimited && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatTokens(Math.max(0, usage.limit - usage.used))}
                </span>
              </div>
            )}
          </div>

          {/* Reset info */}
          <p className="text-xs text-muted-foreground">
            Resets on {resetLabel} — billing period: {usage.period}
          </p>
        </div>
      </div>

      <Separator orientation="vertical" className="h-full min-h-[500px]" />

      {/* Right: Limit Breakdown */}
      <div className="space-y-4 p-6 pl-2">
        <h3 className="text-lg font-medium">Limit Breakdown</h3>

        {usage.unlimited ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Admins and Super Admins are exempt from AI token limits.
            </p>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Tokens Used This Month</p>
                <p className="text-xs text-muted-foreground">Chat tokens consumed (no limit enforced)</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatTokens(usage.used)}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Role Limit</p>
                <p className="text-xs text-muted-foreground">Default monthly allocation for your role</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatTokens(usage.role_limit)}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Extra Tokens</p>
                <p className="text-xs text-muted-foreground">Additional tokens granted by admin</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {usage.extra_tokens > 0 ? `+${formatTokens(usage.extra_tokens)}` : '0'}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Effective Limit</p>
                <p className="text-xs text-muted-foreground">Role limit + extra tokens</p>
              </div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {formatTokens(usage.limit)}
              </span>
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground pt-2">
              Contact your administrator if you need additional tokens.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
